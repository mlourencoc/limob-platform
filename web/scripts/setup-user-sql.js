const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

async function setupUser() {
  try {
    // Deletar usuário antigo
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      for (const user of users.users) {
        if (user.email === 'test@example.com') {
          await supabase.auth.admin.deleteUser(user.id);
          console.log('✓ Usuário antigo deletado');
        }
      }
    } catch (e) {
      console.log('✓ Nenhum usuário anterior para deletar');
    }

    const userId = crypto.randomUUID();
    const bcryptHash = '$2b$10$GDWCzbGeRWGitKRTqZX2ouwgyRvpyXhRzoLtmy5fwa3nO6rxjfwju';
    const now = new Date().toISOString();

    // Inserir usuário direto na tabela auth.users
    const { data, error } = await supabase
      .from('auth.users')
      .insert({
        id: userId,
        instance_id: '00000000-0000-0000-0000-000000000000',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
        encrypted_password: bcryptHash,
        email_confirmed_at: now,
        created_at: now,
        updated_at: now,
      });

    if (error) {
      throw error;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email: test@example.com');
    console.log('Senha: password123');
    console.log('\n📝 Limpe o cache do navegador (Ctrl+Shift+R) e tente fazer login.');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

setupUser();
