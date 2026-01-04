import { createClient } from '@supabase/supabase-js';

// URL do seu projeto (confirmada pelo seu erro)
const supabaseUrl = 'https://zwkdejjvgzomohruixhe.supabase.co';

/**
 * ATENÇÃO: A chave abaixo é o que está causando o erro.
 * Você deve ir no Supabase -> Project Settings -> API 
 * E copiar a "anon" "public" key COMPLETA. 
 * Ela é bem longa e começa com "ey...".
 */
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3a2Rlamp2Z3pvbW9ocnVpeGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0Njc2NzcsImV4cCI6MjA4MzA0MzY3N30.P4m5P1FZqfaz8LApEDaGGAEfAhUdGN25HuRqZnjeecI'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);