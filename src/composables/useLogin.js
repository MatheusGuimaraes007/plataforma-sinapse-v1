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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });

      if (authError) {
        throw new Error('Email ou senha inválidos.');
      }

      if (authData.user) {
        const userProfile = await supabaseService.getUserProfile(authData.user.id);
        if (!userProfile) {
          throw new Error('Perfil de usuário não encontrado.');
        }

        localStorage.setItem('userRole', userProfile.role);

        if (userProfile.role === 'adm-sinapse') {
          router.push({ name: 'admDashboard' });
        } else if (userProfile.role === 'customer') {
          // 👇 CORRIGIDO: Redireciona usando o NOME da rota
          router.push({ name: 'customerNumberConnection' });
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