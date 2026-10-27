import bcrypt from "bcryptjs";

// Same cost as the reference backend; bcryptjs hashes ($2a/$2b) are
// interchangeable with the native `bcrypt` package it used.
const ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Checked when the email isn't registered, so a login for an unknown account
// takes as long as one with a wrong password and doesn't reveal which exist.
export const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", ROUNDS);
