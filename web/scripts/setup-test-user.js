#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const projectUrl = 'https://daxmtuidnrxcgnfonwtc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheG10dWlkbnJ4Y2duZm9ud3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4NTk1MSwiZXhwIjoyMDk0MjYxOTUxfQ.Vx7hZGOSoxBTzPAfdVWteVUOmS70XwoWCMKboZijniQ';

const supabase = createClient(projectUrl, serviceKey);

async function createTestUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Usuário já existe: test@example.com');
        console.log('\nFaça login com:');
        console.log('Email: test@example.com');
        console.log('Senha: password123');
        return;
      }
      throw error;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('\nFaça login com:');
    console.log('Email: test@example.com');
    console.log('Senha: password123');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

createTestUser();
