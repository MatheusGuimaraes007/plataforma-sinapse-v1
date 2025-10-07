// Arquivo: src/composables/useAdmCustomers.js (recomendo renomear o arquivo também)

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './useSupabase';

// Corrigido para 'Customer'
const popUpNewCustomer = ref(false);

// Corrigido para 'Customers'
export function useAdmCustomers() { 
    const router = useRouter(); 
    const customers = ref([]); // Corrigido para 'customers'
    const errorMessage = ref('');

    const togglePopUpNewCustomer = () => {
        popUpNewCustomer.value = !popUpNewCustomer.value;
    }; 

    // 👇 NOME DA FUNÇÃO CORRIGIDO AQUI
    async function fetchCustomers() { 
        const { data: dataCustomers, error: errorCustomers } = await supabase.from('users').select('*');
        
        if (errorCustomers) {
            errorMessage.value = 'Erro ao buscar clientes. Tente novamente.';
            setTimeout(() => {
                errorMessage.value = '';
            }, 2000);
            throw errorCustomers;
        }

        customers.value = dataCustomers; // Corrigido para 'customers'
        console.log('Clientes buscados com sucesso:', dataCustomers);
    }

    return { 
        popUpNewCustomer, 
        togglePopUpNewCustomer,
        customers, // Corrigido para 'customers'
        errorMessage,
        // 👇 NOME DA PROPRIEDADE CORRIGIDO AQUI
        fetchCustomers 
    };
}