// Arquivo: src/composables/useLogin.js

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './useSupabase';
import { SupabaseService } from '../services/serviceSupabase'; // Importar nosso serviço

export function useLogin() {
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const router = useRouter();
  const supabaseService = new SupabaseService(); // Instanciar o serviço

  async function login() {
    errorMessage.value = '';
    if (!email.value || !password.value) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      return;
    }

    try {
      // Passo 1: Autenticar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });

      if (authError) {
        console.log(email.value, password.value)
        throw new Error('Email ou senha inválidos.');
      }

      if (authData.user) {
        // Passo 2: Buscar o perfil do usuário na nossa tabela 'users' para pegar a role
        const userProfile = await supabaseService.getUserProfile(authData.user.id);

        if (!userProfile) {
          throw new Error('Perfil de usuário não encontrado.');
        }

        // Armazenar a role no localStorage para uso nas guardas de rota
        localStorage.setItem('userRole', userProfile.role);

        // Passo 3: Redirecionar com base na role
        if (userProfile.role === 'adm-sinapse') {
          router.push('/admDashboard');
        } else if (userProfile.role === 'customer' || userProfile.role === 'costumer') { // Aceita ambas as grafias
          router.push('/costumerNumberConnection'); // Rota para clientes
        } else {
          throw new Error('Função (role) de usuário desconhecida.');
        }
      }
    } catch (error) {
      console.error('Erro no processo de login:', error);
      errorMessage.value = error.message;
      await supabase.auth.signOut(); // Garante que o usuário seja deslogado em caso de erro no meio do processo
      localStorage.removeItem('userRole');
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    router.push('/');
    console.log('Usuário deslogado.');
  }

  return { email, password, errorMessage, login, logout };
}