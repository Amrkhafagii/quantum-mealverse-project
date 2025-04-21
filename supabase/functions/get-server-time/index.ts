
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Get the current server timestamp
  const timestamp = new Date().toISOString();
  
  // Return the server time as JSON
  return new Response(
    JSON.stringify({
      timestamp,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});
