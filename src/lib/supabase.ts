import { createClient } from "@supabase/supabase-js";

// Usando variáveis de ambiente para conectar ao banco de dados do casamento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
