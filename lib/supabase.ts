import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in different environments (Vite, CRA, Browser)
const getEnv = (key: string) => {
  try {
    // Check for Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    // Check for Node/Webpack/CRA
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    console.warn('Error reading environment variable', e);
  }
  return undefined;
};

// Credenciais padrão do Supabase
// O sistema usará estas chaves caso não encontre variáveis de ambiente
const DEFAULT_URL = 'https://ncbmjkhoplgyfgxeqhmo.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYm1qa2hvcGxneWZneGVxaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzMwMzgsImV4cCI6MjA4MTA0OTAzOH0.t6_KI2oF6u7jmFwu8R_Av16vcBe5qgUTYgr9p1u4Ux4';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Verifica se as chaves estão presentes (sempre estarão true devido aos padrões acima)
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'undefined';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Key missing.');
}

// Inicializa o cliente diretamente com suas credenciais
export const supabase = createClient(supabaseUrl, supabaseAnonKey);