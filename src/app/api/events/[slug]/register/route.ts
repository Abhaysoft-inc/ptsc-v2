import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { serverError } from "@/lib/auth/require-admin";
import { computeAcademicFromRoll } from "@/lib/academic";
import { badRequest, isObjectId, notFound, parseBody } from "@/lib/server/query";
import { rateLimit } from "@/lib/server/rate-limit";
import { EVENTS_TAG, isDuplicateKeyError, registrationOpen } from "@/lib/server/events";
import {
  cleanAnswers,
  individualSchema,
  makeRegistrationId,
  teamSchema,
  type Answers,
  type Person,
} from "@/lib/server/registration";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ slug: string }> };

type StoredPerson = {
  name: string;
  gender: string;
  rollNo: string;
  year: number;
  branch: string;
  contactNo: string;
  email: string;
  dynamic: Answers;
};

/** The person's built-in answers plus year and branch worked out from the roll number. */
function withAcademic(
  p: Person,
  dynamic: Answers,
  prefix: string
): { error: string } | { person: StoredPerson } {
  const academic = computeAcademicFromRoll(p.rollNo);
  if (!academic.valid) return { error: `${prefix}${academic.reason}.` };
  return {
    person: {
      name: p.name,
      gender: p.gender,
      rollNo: p.rollNo,
      year: academic.year,
      branch: academic.branch,
      contactNo: p.contactNo,
      email: p.email,
      dynamic,
    },
  };
}

// POST /api/events/:slug/register — public sign-up for an event.
//
// Individual events: { name, gender, rollNo, contactNo, email, dynamic? }
// Team events:       { team: { teamName, dynamic? }, participants: [...], leaderIndex? }
//
// `dynamic` holds the answers to the event's custom questions, keyed by field name.
export async function POST(request: Request, { params }: Context) {
  const { slug } = await params;

  try {
    // Campus Wi-Fi shares a few IPs between many students, so this is generous.
    const limited = await rateLimit(request, { name: "register", limit: 60, windowSeconds: 600 });
    if (limited) return limited;

    await connectDB();
    const event = await Event.findOne({
      published: { $ne: false },
      $or: [{ slug }, ...(isObjectId(slug) ? [{ _id: slug }] : [])],
    }).lean();
    if (!event) return notFound("Event not found.");

    if (!registrationOpen(event)) {
      return NextResponse.json(
        { success: false, message: "Registration for this event is closed." },
        { status: 409 }
      );
    }
    if (event.forceGoogleForm && event.googleFormLink) {
      return badRequest("This event takes registrations through a Google Form.");
    }

    const team = event.registrationType === "team";
    const eventFields = event.useCustomForm ? (event.registrationFields ?? []) : [];
    const memberFields = event.useCustomForm ? (event.participantFields ?? []) : [];

    // ---- Validate, and build the document to store.
    let doc: Record<string, unknown>;
    let rolls: string[];

    if (team) {
      const body = await parseBody(request, teamSchema, "Please fix the highlighted fields.");
      if ("response" in body) return body.response;
      const { team: teamInfo, participants, leaderIndex } = body.data;

      const min = Math.max(1, event.teamMinSize ?? 1);
      const max = Math.max(min, event.teamMaxSize ?? min);
      if (participants.length < min || participants.length > max) {
        return badRequest(`Team size must be between ${min} and ${max}.`);
      }
      if (leaderIndex >= participants.length) return badRequest("Pick a valid team leader.");

      const teamAnswers = cleanAnswers(eventFields, teamInfo.dynamic);
      if ("error" in teamAnswers) return badRequest(teamAnswers.error);

      const people = [];
      for (const [i, p] of participants.entries()) {
        const prefix = `Participant #${i + 1}: `;
        const answers = cleanAnswers(memberFields, p.dynamic, prefix);
        if ("error" in answers) return badRequest(answers.error);
        const built = withAcademic(p, answers.data, prefix);
        if ("error" in built) return badRequest(built.error);
        people.push(built.person);
      }

      rolls = people.map((p) => p.rollNo);
      doc = {
        type: "team",
        name: teamInfo.teamName, // the list views read `name` for every registration
        team: { teamName: teamInfo.teamName, dynamic: teamAnswers.data },
        participants: people,
        leaderIndex,
      };
    } else {
      const body = await parseBody(request, individualSchema, "Please fix the highlighted fields.");
      if ("response" in body) return body.response;
      const p = body.data;

      const answers = cleanAnswers(eventFields, p.dynamic);
      if ("error" in answers) return badRequest(answers.error);
      const built = withAcademic(p, answers.data, "");
      if ("error" in built) return badRequest(built.error);

      rolls = [p.rollNo];
      doc = { type: "individual", ...built.person };
    }

    // ---- The same roll number can't sign up twice for one event, alone or in
    // a team. (Checked here, not with a unique index: the existing data already
    // has repeats from the old site, which would stop the index being built.)
    if (new Set(rolls).size !== rolls.length) {
      return badRequest("Each team member needs a different roll number.");
    }
    const taken = await EventRegistration.find(
      {
        eventId: event._id,
        deleted: { $ne: true },
        $or: [{ rollNo: { $in: rolls } }, { "participants.rollNo": { $in: rolls } }],
      },
      "rollNo participants.rollNo"
    ).lean();
    const takenRolls = new Set(
      taken.flatMap((r) => [r.rollNo, ...(r.participants ?? []).map((p) => p.rollNo)])
    );
    const repeat = rolls.find((r) => takenRolls.has(r));
    if (repeat) {
      return NextResponse.json(
        {
          success: false,
          message: `Roll number ${repeat} is already registered for this event.`,
        },
        { status: 409 }
      );
    }

    const capacity = event.capacity ?? 0;
    if (capacity > 0) {
      const registered = await EventRegistration.countDocuments({
        eventId: event._id,
        deleted: { $ne: true },
      });
      if (registered >= capacity) {
        return NextResponse.json(
          { success: false, message: "This event is full." },
          { status: 409 }
        );
      }
    }

    // ---- Save. The registration ID has a unique index, so if two people draw
    // the same one at the same instant, the loser just draws again.
    let registration;
    for (let attempt = 0; attempt < 8 && !registration; attempt++) {
      try {
        registration = await EventRegistration.create({
          ...doc,
          eventId: event._id,
          registrationId: makeRegistrationId(event.title),
        });
      } catch (error) {
        if (!(isDuplicateKeyError(error) && error.keyPattern?.registrationId)) throw error;
      }
    }
    if (!registration) throw new Error("Could not generate a unique registration ID.");

    // The public pages show registration counts and spots left.
    revalidateTag(EVENTS_TAG, "max");

    // A confirmation email goes out through the mail queue (planned, phase 2).
    return NextResponse.json(
      {
        success: true,
        message: "You're registered!",
        registration: {
          registrationId: registration.registrationId,
          type: registration.type,
          name: registration.name,
        },
        whatsappGroupLink: event.whatsappGroupLink ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    return serverError("Registration failed", error);
  }
}
