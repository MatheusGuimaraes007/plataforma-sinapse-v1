// Arquivo: src/composables/useAdmCustomers.js

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './useSupabase';

const popUpNewCustomer = ref(false);

export function useAdmCustomers() { 
    const router = useRouter(); 
    const customers = ref([]);
    const errorMessage = ref('');

    const togglePopUpNewCustomer = () => {
        popUpNewCustomer.value = !popUpNewCustomer.value;
    }; 

    async function fetchCustomers() { 
        const { data: dataCustomers, error: errorCustomers } = await supabase.from('users').select('*');
        
        if (errorCustomers) {
            errorMessage.value = 'Erro ao buscar clientes. Tente novamente.';
            setTimeout(() => {
                errorMessage.value = '';
            }, 2000);
            throw errorCustomers;
        }

        customers.value = dataCustomers;
        console.log('Clientes buscados com sucesso:', dataCustomers);
    }

    return { 
        popUpNewCustomer, 
        togglePopUpNewCustomer,
        customers,
        errorMessage,
        fetchCustomers 
    };
}