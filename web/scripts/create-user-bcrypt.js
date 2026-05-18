const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

async function createUserWithValidPassword() {
  try {
    // Primeiro, deletar usuário antigo
    const { data: users } = await supabase.auth.admin.listUsers();
    for (const user of users.users) {
      if (user.email === 'test@example.com') {
        await supabase.auth.admin.deleteUser(user.id);
        console.log('✓ Usuário antigo deletado');
      }
    }

    // Criar usuário via SQL com hash de senha válido
    const { data, error } = await supabase
      .from('auth.users')
      .insert({
        id: crypto.randomUUID(),
        instance_id: '00000000-0000-0000-0000-000000000000',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
        encrypted_password: '$2a$10$PNhUjlMweiMQAUF0Dqh1Bu57WyZkL8X6T.6zGJt0DqMxIa03RakQm', // hash de 'password123'
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.log('Tentando com admin createUser...');
      const { data: user, error: err2 } = await supabase.auth.admin.createUser({
        email: 'test@example.com',
        password: 'password123',
        email_confirm: true,
        phone_confirm: true,
      });

      if (err2) throw err2;

      console.log('✅ Usuário criado com sucesso!');
      console.log('Email: test@example.com');
      console.log('Senha: password123');
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email: test@example.com');
    console.log('Senha: password123');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

createUserWithValidPassword();
