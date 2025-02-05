export function ToPrimitiveRecord(input) {
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (
      value === null ||
      (typeof value !== "object" && typeof value !== "function")
    ) {
      output[key] = value;
    }
  }
  return output;
}
