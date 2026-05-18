const { createClient } = require('@supabase/supabase-js');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

async function deleteAndRecreate() {
  try {
    // Deletar usuário antigo
    const { data: users } = await supabase.auth.admin.listUsers();
    for (const user of users.users) {
      if (user.email === 'test@example.com') {
        await supabase.auth.admin.deleteUser(user.id);
        console.log('❌ Usuário antigo deletado');
      }
    }

    // Criar novo usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Novo usuário criado!');
    console.log('Email: test@example.com');
    console.log('Senha: password123');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

deleteAndRecreate();
