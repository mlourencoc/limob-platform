const { createClient } = require('@supabase/supabase-js');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

// Gerar senha aleatória forte
function generateStrongPassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';

  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Preencher o resto
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function setupUser() {
  try {
    const strongPassword = generateStrongPassword();

    // Deletar usuário antigo
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      for (const user of users.users) {
        if (user.email === 'test@example.com') {
          await supabase.auth.admin.deleteUser(user.id);
        }
      }
    } catch (e) {
      // continua
    }

    // Criar usuário com senha forte via admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: strongPassword,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: test@example.com');
    console.log('Senha: ' + strongPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Copie a senha acima!');
    console.log('📝 Limpe o cache do navegador (Ctrl+Shift+R) e faça login.');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

setupUser();
