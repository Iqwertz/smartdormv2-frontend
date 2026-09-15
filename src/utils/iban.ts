/**
 * IBAN helpers for the HSV membership form.
 *
 * This mirrors the server-side check in smartdorm/utils/crypto_utils.py so a typo is caught
 * while the member is still looking at the field. The server validates again - this is
 * convenience, never the authority.
 */

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22,
  DK: 18, EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GI: 23, GR: 27,
  HR: 21, HU: 28, IE: 22, IS: 26, IT: 27, LI: 21, LT: 20, LU: 20,
  LV: 21, MC: 27, MT: 31, NL: 18, NO: 15, PL: 28, PT: 25, RO: 24,
  SE: 24, SI: 19, SK: 24, SM: 27, VA: 22,
};

export const normalizeIban = (raw: string): string => raw.replace(/\s+/g, "").toUpperCase();

/** Group into blocks of four while typing: "DE89 3704 0044 ...". */
export const formatIban = (raw: string): string => normalizeIban(raw).replace(/(.{4})/g, "$1 ").trim();

export const isValidIban = (raw: string): boolean => {
  const iban = normalizeIban(raw);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;

  const expectedLength = IBAN_LENGTHS[iban.slice(0, 2)];
  if (!expectedLength || iban.length !== expectedLength) return false;

  // ISO 7064 mod-97: move the first four characters to the end, map letters to numbers
  // (A=10..Z=35), then the whole number must be congruent to 1 modulo 97. Computed in
  // chunks because the number is far larger than Number.MAX_SAFE_INTEGER.
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  let remainder = 0;
  for (let i = 0; i < digits.length; i += 7) {
    remainder = Number(String(remainder) + digits.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
};

/**
 * Validation message for the IBAN field, or null when it is fine.
 * Returns null for an empty value so the field is not red before anything is typed.
 */
export const ibanError = (raw: string): string | null => {
  if (!raw.trim()) return null;
  return isValidIban(raw) ? null : "Diese IBAN ist ungültig. Bitte prüfe deine Eingabe.";
};
