import { createClient } from "@supabase/supabase-js";

/**
 * Set up Supabase connection safely.
 * Checks for environment variables REACT_APP_APP_SUPABASE_URL and REACT_APP_APP_SUPABASE_KEY.
 * Shows a helpful error in development if missing, and fails gracefully in production.
 */

// The following environment variables must be set in your .env file (and passed at build time):
// REACT_APP_APP_SUPABASE_URL
// REACT_APP_APP_SUPABASE_KEY

const supabaseUrl = process.env.REACT_APP_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_APP_SUPABASE_KEY;

function isEmpty(v) {
  return v === undefined || v === null || v === "";
}

if (isEmpty(supabaseUrl) || isEmpty(supabaseKey)) {
  const errorMsg =
    [
      "❌ Supabase client not initialized: Environment variables for Supabase are missing.",
      "Make sure REACT_APP_APP_SUPABASE_URL and REACT_APP_APP_SUPABASE_KEY are set in your .env file.",
      `Current values:`,
      `  REACT_APP_APP_SUPABASE_URL: '${supabaseUrl}'`,
      `  REACT_APP_APP_SUPABASE_KEY: '${supabaseKey ? "[REDACTED]" : ""}'`
    ].join("\n");
  // eslint-disable-next-line no-console
  if (typeof window !== "undefined" && window.location && window.location.hostname === "localhost") {
    // In development, pop up a visible error and log it
    // eslint-disable-next-line no-alert
    alert(errorMsg);
    // eslint-disable-next-line no-console
    console.error(errorMsg);
  } else {
    // In production, throw hard so app fails fast
    throw new Error(errorMsg);
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
