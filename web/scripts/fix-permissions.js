const { createClient } = require('@supabase/supabase-js');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

const sql = `
-- Garantir permissões para o role authenticated em todas as tabelas
GRANT ALL ON TABLE public.properties TO authenticated;
GRANT ALL ON TABLE public.developments TO authenticated;
GRANT ALL ON TABLE public.brokers TO authenticated;
GRANT ALL ON TABLE public.imports TO authenticated;

-- Garantir acesso a sequences (para IDs gerados)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.developments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports DISABLE ROW LEVEL SECURITY;
`;

async function fixPermissions() {
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: stmt }).catch(() => ({ error: null }));
    // Tenta via from como fallback
  }

  // Usar rpc direto
  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql
  }).catch(async () => {
    // Fallback: tentar cada statement via rpc genérico
    return { data: null, error: { message: 'rpc não disponível' } };
  });

  if (error) {
    console.log('RPC não disponível, use o SQL abaixo no painel Supabase:');
    console.log('\n' + sql);
    return;
  }

  console.log('✅ Permissões configuradas!');
}

fixPermissions();
