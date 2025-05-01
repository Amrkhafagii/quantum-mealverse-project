
import { Json } from "@/integrations/supabase/types";

/**
 * Safely converts a value to a Supabase-compatible JSON value
 */
export function toSupabaseJson<T>(value: T): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

/**
 * Safely parses a Supabase JSON value to a typed value
 */
export function fromSupabaseJson<T>(json: Json): T {
  return json as unknown as T;
}
