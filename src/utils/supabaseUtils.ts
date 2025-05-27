
// Utility functions for handling Supabase JSON data types

export function toSupabaseJson<T>(data: T): string {
  return JSON.stringify(data);
}

export function fromSupabaseJson<T>(jsonString: string | null): T | undefined {
  if (!jsonString) return undefined;
  try {
    return JSON.parse(jsonString);
  } catch {
    return undefined;
  }
}
