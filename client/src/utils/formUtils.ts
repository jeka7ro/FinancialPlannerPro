// Form utility functions for handling nullable values in React forms

/**
 * Ensures form field values are never null for React inputs
 * Converts null/undefined to empty string
 */
export function safeFormValue(value: string | null | undefined): string {
  return value ?? "";
}

/**
 * Handles numeric form values that might be null
 * Converts null/undefined to empty string for display
 */
export function safeNumericValue(value: number | null | undefined): string {
  return value?.toString() ?? "";
}

/**
 * Converts form string values back to nullable types for database storage
 */
export function nullifyEmptyString(value: string): string | null {
  return value.trim() === "" ? null : value;
}

/**
 * Converts form string values to nullable numbers for database storage
 */
export function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}