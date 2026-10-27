import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { isObjectId, notFound } from "@/lib/server/query";
import { registrationFilter, toRegistrationRow } from "@/lib/server/registrations";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  // Quote anything with separators, and neutralise leading = + - @ so Excel
  // doesn't run a cell as a formula.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

// GET /api/admin/events/:id/registrations/export
// Every active registration for the event as CSV, one row per person (team
// members each get a row), with the custom form answers as extra columns.
export async function GET(_request: Request, { params }: Context) {
  await connection();
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const event = await Event.findById(id, "title slug").lean();
    if (!event) return notFound("Event not found.");

    const docs = await EventRegistration.find(registrationFilter(id, {}))
      .sort({ createdAt: 1, _id: 1 })
      .lean();
    const rows = docs.map(toRegistrationRow);

    // Registration-level answers plus each team member's own answers.
    const detailKeys = [
      ...new Set(
        rows.flatMap((r) => [
          ...Object.keys(r.details),
          ...r.participants.flatMap((p) => Object.keys(p.details)),
        ])
      ),
    ];
    const header = [
      "Registration ID",
      "Type",
      "Team Name",
      "Name",
      "Leader",
      "Gender",
      "Roll No",
      "Branch",
      "Year",
      "Contact",
      "Email",
      "Attended",
      "Submitted",
      ...detailKeys,
    ];

    const lines = [header];
    for (const r of rows) {
      const people = r.type === "team" && r.participants.length ? r.participants : [r.lead];
      people.forEach((p, i) => {
        lines.push([
          r.registrationId,
          r.type,
          r.teamName ?? "",
          p.name,
          r.type === "team" ? (i === r.leaderIndex ? "Yes" : "No") : "",
          p.gender,
          p.rollNo,
          p.branch,
          p.year ?? "",
          p.contactNo,
          p.email,
          r.attended ? "Yes" : "No",
          r.createdAt ?? "",
          ...detailKeys.map((k) => p.details[k] ?? r.details[k] ?? ""),
        ].map(String));
      });
    }

    // BOM so Excel opens the UTF-8 correctly.
    const BOM = String.fromCharCode(0xfeff);
    const csv = BOM + lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const name = (event.slug || event.title).replace(/[^\w-]+/g, "-").toLowerCase();

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}-registrations.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return serverError("Exporting registrations failed", error);
  }
}
