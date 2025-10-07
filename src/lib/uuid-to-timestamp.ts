export function uuidToTimestamp(uuid: string): Date {
  // Remove dashes
  const hex = uuid.replace(/-/g, "");

  // The first 12 hex characters (6 bytes = 48 bits) are the timestamp in milliseconds since Unix epoch
  const timestampHex = hex.substring(0, 12);

  // Convert hex to integer (BigInt, because it can exceed Number range)
  const timestampMs = BigInt(`0x${timestampHex}`);

  // Convert to normal Date
  return new Date(Number(timestampMs));
}
