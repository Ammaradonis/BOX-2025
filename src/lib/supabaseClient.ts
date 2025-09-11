import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msqajzusuyrjyqjipzjy.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcWFqenVzdXlyanlxamlwemp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTc5ODgsImV4cCI6MjA3MjA5Mzk4OH0.mR6yajOmYL2LEmhZMfQOKhaEvFTHo3Nm7Dp3a86rh98'; // Replace with your Supabase Anon Key

const supabase = createClient(supabaseUrl, supabaseKey);