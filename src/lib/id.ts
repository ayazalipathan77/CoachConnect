import { customAlphabet } from "nanoid";

/** URL-safe, collision-resistant id generator (21 chars ≈ uuid entropy). */
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 21);

export function createId(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid()}` : nanoid();
}
