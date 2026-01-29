export function formatNGPhone(input: string) {
  
  const digits = input.replace(/\D/g, "");

  // remove leading 0 or 234 if user typed it
  let local = digits;
  if (local.startsWith("234")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);

  const part1 = local.slice(0, 3);
  const part2 = local.slice(3, 6);
  const part3 = local.slice(6, 10);

  let formatted = "+234";

  if (part1) formatted += ` (${part1}`;
  if (part1.length === 3) formatted += ")";
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += `-${part3}`;

  return formatted;
}

export const formatNumberSpace = (val: string | number) => {
  const digits = String(val).replace(/\D/g, "");

  // Split as: 3 - 4 - rest
  if (digits.length <= 3) return digits;
  if (digits.length <= 7)
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;

  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
};

export function getInitials(fullName: string) {
  if (!fullName) return "";

  const names = fullName.trim().split(" ").filter(Boolean);

  if (names.length === 1) {
    // If only one name, take first letter
    return names[0][0].toUpperCase();
  }

  // Otherwise, take first letter of first two words
  return (names[0][0] + names[1][0]).toUpperCase();
}

// Output: "17 Jan 2026 • 10:42 AM"
export function formatCurrentDate(date: string) {
  if (!date) return '';
  const now = new Date(date);

  // Options for the date part
  const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
  const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };

  const datePart = now.toLocaleDateString("en-US", dateOptions); // e.g., "17 Jan 2026"
  const timePart = now.toLocaleTimeString("en-US", timeOptions); // e.g., "10:42 AM"

  return `${datePart} • ${timePart}`;
}

/**
 * Extracts MM-DD from a datetime string
 * @param datetime e.g. "2026-01-24 05:39:30"
 * @returns "01-24"
 */
export const formatToMonthDay = (datetime: string): string => {
  // Split the date and time part
  const [datePart] = datetime.split(' ');
  const [, month, day] = datePart.split('-');
  return `${month}-${day}`;
};


/**
 * Converts a formatted amount string back to number
 * Example: "1,000.00" -> 1000
 */
export function parseFormattedAmount(amountStr: string): number {
  if (!amountStr) return 0;

  // Remove commas and any extra spaces
  const cleanStr = amountStr.replace(/,/g, "").trim();

  // Convert to number
  const num = Number(cleanStr);

  // If conversion fails, return 0
  return isNaN(num) ? 0 : num;
}

export const capitalizeFirst = (value?: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};





