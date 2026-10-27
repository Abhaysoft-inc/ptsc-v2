import "server-only";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

export function pageSizeFrom(params: URLSearchParams) {
  return positiveInt(params.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
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

export const noStore = { headers: { "Cache-Control": "no-store" } };
