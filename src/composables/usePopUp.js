import { ref } from 'vue';
import { supabase } from './useSupabase';

/**
 * Gera uma senha segura com 20 caracteres, contendo letras e números.
 * @returns {string} A senha gerada.
 */
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 20; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function usePopUp() {
  const name = ref('');
  const email = ref('');
  const phone = ref('');
  const errorMessage = ref('');
  const password = ref('');
  const showPassword = ref(false);

  async function createCustomer() {
    errorMessage.value = '';
    if (!name.value || !email.value || !phone.value) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 3000);
      return;
    }

    // 1. Gera a nova senha segura
    password.value = generateSecurePassword();

    // 2. Cria o usuário no sistema de autenticação do Supabase
    const { data: dataCustomer, error: errorCustomer } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { // Metadados que podem ser úteis, mas não são usados para o perfil
          full_name: name.value,
          phone: phone.value
        }
      }
    });

    if (errorCustomer) {
      errorMessage.value = `Erro ao criar autenticação: ${errorCustomer.message}`;
      setTimeout(() => { errorMessage.value = ''; }, 3000);
      return;
    }

    // 3. Insere o perfil na tabela 'users' usando o ID da autenticação
    if (dataCustomer.user) {
      const { error: erroProfile } = await supabase.from('users').insert({
        id: dataCustomer.user.id, // Garante que o ID da tabela seja o mesmo do Auth
        auth_uuid: dataCustomer.user.id,
        name: name.value,
        email: email.value,
        phone: phone.value,
        status: 'active',
        role: 'customer' // Grafia correta
      });

      if (erroProfile) {
        // Se a inserção do perfil falhar, é uma boa prática deletar o usuário criado no Auth para evitar inconsistências.
        // Isso requer uma chamada de admin, idealmente em uma Edge Function.
        errorMessage.value = `Erro ao criar perfil do cliente: ${erroProfile.message}`;
        setTimeout(() => { errorMessage.value = ''; }, 3000);
        return;
      }
      
      console.log('Cliente criado com sucesso:', dataCustomer);
      showPassword.value = true;
    }
  }

  return { name, email, phone, password, errorMessage, createCustomer, showPassword };
}