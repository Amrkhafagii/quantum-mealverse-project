
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

/**
 * Converts workout objects to Supabase-compatible format
 */
export function workoutToSupabase(object: any): any {
  if (Array.isArray(object)) {
    return object.map(item => workoutToSupabase(item));
  }
  
  if (object === null || object === undefined) {
    return null;
  }
  
  if (typeof object === 'object') {
    const result: any = {};
    for (const key in object) {
      result[key] = workoutToSupabase(object[key]);
    }
    return result;
  }
  
  return object;
}

/**
 * Special handler for workout logs which have complex nested structures
 */
export function formatWorkoutLogForSupabase(log: any): any {
  return {
    ...log,
    completed_exercises: toSupabaseJson(log.completed_exercises)
  };
}
