import "server-only";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import type { z } from "zod";
import { fieldErrors } from "@/lib/auth/validation";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function positiveInt(raw: string | null, fallback: number, max = Infinity) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? Math.min(n, max) : fallback;
}

/** Search text from `?q=`, trimmed and capped so it can't be abused. */
export function searchText(params: URLSearchParams) {
  return (params.get("q") ?? "").trim().slice(0, 100);
}

export function pageSizeFrom(params: URLSearchParams, fallback = DEFAULT_PAGE_SIZE) {
  return positiveInt(params.get("pageSize"), fallback, MAX_PAGE_SIZE);
}

/**
 * Works out the page to show once the total is known, clamping an
 * out-of-range page (say, after deleting the last row on the last page).
 */
export function paginate(params: URLSearchParams, total: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(positiveInt(params.get("page"), 1), totalPages);
  return { page, pageSize, total, totalPages, skip: (page - 1) * pageSize };
}

/**
 * Fetches one page of rows at the same time as the total count, so a list costs
 * one database round trip instead of two in a row. If the requested page is past
 * the end (say, the last row on the last page was just deleted), the page is
 * clamped and the rows are fetched again. That's the rare case.
 */
export async function pagedRows<T>(
  params: URLSearchParams,
  pageSize: number,
  count: Promise<number>,
  fetchRows: (skip: number, limit: number) => Promise<T[]>
) {
  const requested = positiveInt(params.get("page"), 1);
  const [total, rows] = await Promise.all([count, fetchRows((requested - 1) * pageSize, pageSize)]);
  const paging = paginate(params, total, pageSize);
  if (paging.page !== requested) {
    return { paging, rows: await fetchRows(paging.skip, pageSize) };
  }
  return { paging, rows };
}

export function notFound(message = "Not found.") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function badRequest(message: string, errors?: Record<string, string>) {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status: 400 }
  );
}

export function isObjectId(id: string) {
  return mongoose.isValidObjectId(id) && /^[a-f\d]{24}$/i.test(id);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/**
 * Reads and validates a JSON body. Returns the parsed data, or a ready-made 400
 * response with per-field messages. Call it after the auth check, so signed-out
 * callers get a 401 rather than a validation error.
 */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  message = "Please check the highlighted values."
): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  const body = await readJson(request);
  if (body === undefined) return { response: badRequest("Invalid request body.") };
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { response: badRequest(message, fieldErrors(parsed.error)) };
  }
  return { data: parsed.data };
}

export const noStore = { headers: { "Cache-Control": "no-store" } };
