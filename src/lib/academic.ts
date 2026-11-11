// Derives a student's academic year (1-4) and branch from their roll number.
// Ported unchanged from the old backend (Utils/academic.js) so existing
// registrations and new ones agree.
//
// Rules:
// - 5-digit roll: first two digits YY are the admission year (20YY); the branch
//   digit is the 3rd.
// - 6-digit roll: the branch digit is the 4th. (Lateral entry.)
// - The academic year changes every July 1.
//   Example: admission 2023 => first year until 2024-07-01, second until 2025-07-01, ...

export const BRANCH_MAP: Record<string, string> = {
  "1": "Civil Engineering",
  "2": "Computer Science",
  "3": "Electrical Engineering",
  "4": "Electronics Engineering",
  "5": "Mechanical Engineering",
  "6": "Information Technology",
  "7": "MCA",
};

export type AcademicInfo =
  | { valid: true; year: number; branch: string; admissionYear: number }
  | { valid: false; reason: string };

export function computeAcademicFromRoll(roll: unknown, now = new Date()): AcademicInfo {
  if (!roll || typeof roll !== "string") {
    return { valid: false, reason: "Roll number missing" };
  }
  const trimmed = roll.trim();
  if (!/^\d{5,6}$/.test(trimmed)) {
    return { valid: false, reason: "Roll number must be 5 or 6 digits" };
  }
  const length = trimmed.length;
  const admissionYear = 2000 + parseInt(trimmed.slice(0, 2), 10);

  const branchDigit = length === 5 ? trimmed.charAt(2) : trimmed.charAt(3);
  const branch = BRANCH_MAP[branchDigit];
  if (!branch) return { valid: false, reason: "Unknown branch code" };

  let year = 1;
  for (let i = 1; i <= 3; i++) {
    // Month index 6 is July.
    if (now >= new Date(admissionYear + i, 6, 1)) year++;
  }
  if (length === 6) year = Math.min(year + 1, 4);
  if (year < 1 || year > 4) return { valid: false, reason: "Derived year out of range" };

  return { valid: true, year, branch, admissionYear };
}
