import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qkvpmnpawspdndbcdegs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdnBtbnBhd3NwZG5kYmNkZWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzExMTIsImV4cCI6MjA4ODYwNzExMn0.W9itnRCbyXFTl3gsO85p-hlypcyMqjDI_L4Ze6w24zE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
