/**
 * Table schema:
 * CREATE TABLE kv_store_9c83b899 (
 *   key TEXT NOT NULL PRIMARY KEY,
 *   value JSONB NOT NULL
 * );
 *
 * View at https://supabase.com/dashboard/project/msqajzusuyrjyqjipzjy/database/tables
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Initialize Supabase client ONCE (backend-safe with Service Role key)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const TABLE = "kv_store_9c83b899";

// Set a key-value pair
export const set = async (key: string, value: unknown): Promise<void> => {
  const { error } = await supabase.from(TABLE).upsert({ key, value });
  if (error) throw new Error(`Supabase set error: ${error.message}`);
};

// Get a value by key
export const get = async (key: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(`Supabase get error: ${error.message}`);
  return data?.value ?? null;
};

// Delete a key-value pair
export const del = async (key: string): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq("key", key);
  if (error) throw new Error(`Supabase delete error: ${error.message}`);
};

// Set multiple pairs
export const mset = async (keys: string[], values: unknown[]): Promise<void> => {
  const rows = keys.map((k, i) => ({ key: k, value: values[i] }));
  const { error } = await supabase.from(TABLE).upsert(rows);
  if (error) throw new Error(`Supabase mset error: ${error.message}`);
};

// Get multiple values
export const mget = async (keys: string[]): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .in("key", keys);

  if (error) throw new Error(`Supabase mget error: ${error.message}`);
  return data?.map((d) => d.value) ?? [];
};

// Delete multiple keys
export const mdel = async (keys: string[]): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().in("key", keys);
  if (error) throw new Error(`Supabase mdel error: ${error.message}`);
};

// Get values by prefix
export const getByPrefix = async (prefix: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .like("key", `${prefix}%`);

  if (error) throw new Error(`Supabase getByPrefix error: ${error.message}`);
  return data?.map((d) => d.value) ?? [];
};
