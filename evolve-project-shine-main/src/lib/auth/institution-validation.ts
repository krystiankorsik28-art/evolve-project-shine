export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function validateRspo(value: string) {
  const digits = digitsOnly(value);
  return digits.length >= 4 && digits.length <= 10;
}

export function validateNip(value: string) {
  const digits = digitsOnly(value);
  if (!/^\d{10}$/.test(digits)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const checksum =
    weights.reduce((sum, weight, index) => sum + weight * Number(digits[index]), 0) % 11;
  return checksum !== 10 && checksum === Number(digits[9]);
}

function validateRegon9(digits: string) {
  const weights = [8, 9, 2, 3, 4, 5, 6, 7];
  const checksum =
    weights.reduce((sum, weight, index) => sum + weight * Number(digits[index]), 0) % 11;
  return (checksum === 10 ? 0 : checksum) === Number(digits[8]);
}

function validateRegon14(digits: string) {
  const weights = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
  const checksum =
    weights.reduce((sum, weight, index) => sum + weight * Number(digits[index]), 0) % 11;
  return (checksum === 10 ? 0 : checksum) === Number(digits[13]);
}

export function validateRegon(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 9) return validateRegon9(digits);
  if (digits.length === 14) return validateRegon14(digits);
  return false;
}

const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "wp.pl",
  "onet.pl",
  "o2.pl",
  "interia.pl",
  "op.pl",
]);

export function emailDomain(value: string) {
  return value.trim().toLowerCase().split("@").pop() || "";
}

export function requiresManualInstitutionReview(value: string) {
  return CONSUMER_EMAIL_DOMAINS.has(emailDomain(value));
}
