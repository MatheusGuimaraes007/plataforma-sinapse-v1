import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {supabase} from './useSupabase';

export function useLogin() {
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const errorLogin = ref(false);
  const router = useRouter();
  async function login() {
    errorMessage.value = '';
    if(!email.value || !password.value) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      errorLogin.value = true;
      console.log(errorMessage.value)
      return;
    }
    const {data: dataAuth, error: errorAuth} = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (errorAuth) {
      errorMessage.value = 'Erro ao fazer login. Verifique suas credenciais.';
      errorLogin.value = true;
      console.log(errorMessage)
      return;
    }
    console.log('Login bem-sucedido:', dataAuth);
    errorLogin.value = false;
  }
  return {email, password, errorMessage, errorLogin, login};
}