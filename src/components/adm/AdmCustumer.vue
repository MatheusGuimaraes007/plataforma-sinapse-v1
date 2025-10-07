<script setup>
import SideMenu from './SideMenuAdm.vue';
import PopUpNewCustomer from './PopUpNewCustomer.vue';
import { ref, onMounted } from 'vue';
import { useAdmCustumers } from '../../composables/useAdmCustumers';

const { togglePopUpNewCustomer, popUpNewCustomer, customers, errorMessage, fetchCustumers } = useAdmCustumers();

onMounted(() => {
    fetchCustumers();
});

function editCustomer(customer) {
  console.log('Editar cliente:', customer);
}

function deleteCustomer(customer) {
  console.log('Excluir cliente:', customer);
}
</script>

<template>
<div class="flex h-screen bg-gray-50">
  <SideMenu />
  <PopUpNewCustomer v-if="popUpNewCustomer" @customer-created="fetchCustomers" />
  
  <div class="flex-1 p-6 lg:p-10 overflow-auto"> 
    
    <div class="flex justify-between items-center mb-8">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold text-gray-800">Clientes Sinapse</h1>
        <button @click="fetchCustomers" class="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Atualizar lista">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4l-4 4M4 20l4-4" />
          </svg>
        </button>
      </div>
      <button @click="togglePopUpNewCustomer" class="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
        Cadastrar Cliente
      </button>
    </div>

    <div class="shadow-md rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table class="min-w-full">
        
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">#</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telefone</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-gray-200">
          
          <tr 
            v-for="(customer, index) in customers" 
            :key="customer.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
              {{ index + 1 }}
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
              <div class="truncate" :title="customer.name">{{ customer.name }}</div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              <div class="truncate" :title="customer.email">{{ customer.email }}</div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ customer.phone }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-4">
                <button @click="editCustomer(customer)" class="text-indigo-600 hover:text-indigo-900" title="Editar Cliente">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                  </svg>
                </button>
                <button @click="deleteCustomer(customer)" class="text-red-600 hover:text-red-900" title="Excluir Cliente">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          
        </tbody>
      </table>
      
      <div v-if="!customers || customers.length === 0" class="p-6 text-center text-gray-500">
        Nenhum cliente cadastrado.
      </div>
      
    </div>
    
  </div>
</div>
</template>