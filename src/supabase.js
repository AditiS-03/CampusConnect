import { createClient } from '@supabase/supabase-js';

// ⚠️  Replace with your Supabase project values
// Go to: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://pqcivfmghevezbjlrbxh.supabase.co';         // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY2l2Zm1naGV2ZXpiamxyYnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTAxNzEsImV4cCI6MjA5Mjc2NjE3MX0.EzFyMpElsFylPVdcXb8571EIXY4YBsilI2U4kml_EIU'; // starts with "eyJ..."

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
