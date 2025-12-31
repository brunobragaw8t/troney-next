export function isValidFloat(value: string): boolean {
  return /^\-?\d*\.?\d{0,2}$/.test(value);
}
