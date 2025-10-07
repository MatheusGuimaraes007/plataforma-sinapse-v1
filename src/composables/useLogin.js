// Arquivo: src/composables/useLogin.js

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './useSupabase';
import { SupabaseService } from '../services/serviceSupabase';

export function useLogin() {
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const router = useRouter();
  const supabaseService = new SupabaseService();

  async function login() {
    errorMessage.value = '';
    if (!email.value || !password.value) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      return;
    }

    try {
      // Passo 1: Autenticar
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });

      if (authError) {
        throw new Error('Email ou senha inválidos.');
      }

      if (authData.user) {
        // Passo 2: Buscar perfil para pegar a role
        const userProfile = await supabaseService.getUserProfile(authData.user.id);
        if (!userProfile) {
          throw new Error('Perfil de usuário não encontrado.');
        }

        // Armazena a role para as guardas de rota
        localStorage.setItem('userRole', userProfile.role);

        // Passo 3: Redirecionar
        if (userProfile.role === 'adm-sinapse') {
          router.push('/admDashboard');
        } else if (userProfile.role === 'customer') {
          router.push('/costumerNumberConnection');
        } else {
          throw new Error('Função (role) de usuário desconhecida.');
        }
      }
    } catch (error) {
      console.error('Erro no processo de login:', error);
      errorMessage.value = error.message;
      await supabase.auth.signOut();
      localStorage.removeItem('userRole');
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    router.push('/');
  }

  return { email, password, errorMessage, login, logout };
}