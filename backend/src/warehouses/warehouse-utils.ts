/**
 * Utility functions for warehouse operations
 */

/**
 * Generate possible values for a dimension based on type and count
 * @param type - 'numeric' | 'alphabetic' | null
 * @param count - number of items
 * @returns Array of possible values as strings
 */
export function generatePossibleValues(
  type: 'numeric' | 'alphabetic' | null,
  count: number | null
): string[] {
  if (!type || !count || count <= 0) {
    return [];
  }

  const values: string[] = [];

  if (type === 'numeric') {
    for (let i = 1; i <= count; i++) {
      values.push(i.toString());
    }
  } else if (type === 'alphabetic') {
    // Generate alphabetic sequence: A, B, C, ..., Z, AA, AB, ...
    let current = 0;
    while (current < count) {
      values.push(numberToAlphabetic(current + 1));
      current++;
    }
  }

  return values;
}

/**
 * Convert a number to alphabetic representation (1=A, 2=B, ..., 27=AA, etc.)
 */
function numberToAlphabetic(n: number): string {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
