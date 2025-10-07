import { ref } from 'vue';
import {supabase} from './useSupabase';

export function usePopUp() {
  const name = ref('');
  const email = ref('');
  const phone = ref('');
  const errorMessage = ref('');
  const password = ref('');
  const showPassword = ref(false);

  async function createCustomer() {
    errorMessage.value = '';
    if(!name.value || !email.value || !phone.value) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 2000)
      console.log(errorMessage.value)
      return;
    }
    password.value = Math.random().toString(36);
    const {data: dataCustomer, error: errorCustomer} = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        first_name: name.value,
        phone: phone.value
      }
    })
    if(errorCustomer) {
      errorMessage.value = 'Erro ao criar cliente. Verifique as informações.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 2000)
      return;
  }
    const {data: dataProfile, error: erroProfile} = await supabase.from('users').insert({
      name: name.value,
      email: email.value,
      phone: phone.value,
      auth_uuid: dataCustomer.user.id,
      status: 'active',
      role: 'costumer'
    })
    if(erroProfile) {
      errorMessage.value = 'Erro ao criar perfil do cliente. Tente novamente.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 2000)
      return;
    }
    console.log('Cliente criado com sucesso:', dataCustomer, dataProfile);
    showPassword.value = true;
}
  return {name, email, phone, password, errorMessage, createCustomer, showPassword};

}