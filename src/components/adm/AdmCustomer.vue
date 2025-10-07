<script setup>
import SideMenu from './SideMenuAdm.vue';
import PopUpNewCustomer from './PopUpNewCustomer.vue';
import EditCustomerModal from './EditCustomerModal.vue';
import { ref, onMounted } from 'vue';
import { useAdmCustomers } from '../../composables/useAdmCustomers';
import { SupabaseService } from '../../services/serviceSupabase';

const { togglePopUpNewCustomer, popUpNewCustomer, customers, fetchCustomers } = useAdmCustomers();
const supabaseService = new SupabaseService();

// --- Estado dos Modais ---
const customerToEdit = ref(null);
const customerToDelete = ref(null);
const isDeleting = ref(false);
const deleteError = ref('');

onMounted(() => {
    fetchCustomers();
});

// --- Funções de Edição ---
function openEditModal(customer) {
  customerToEdit.value = customer;
}
function closeEditModal() {
  customerToEdit.value = null;
}
async function handleCustomerUpdated() {
  closeEditModal();
  await fetchCustomers();
}

// --- Funções de Exclusão ---
function openDeleteConfirm(customer) {
  deleteError.value = '';
  customerToDelete.value = customer;
}
function closeDeleteConfirm() {
  customerToDelete.value = null;
}
async function confirmDelete() {
  if (!customerToDelete.value) return;

  isDeleting.value = true;
  deleteError.value = '';
  const customer = customerToDelete.value;

  try {
    // Passo 1: Deletar da tabela 'users'
    await supabaseService.deleteUserFromTable(customer.id);

    // Passo 2: Deletar do Supabase Auth
    // ATENÇÃO: A falha aqui é esperada se a service_role key não estiver no cliente.
    await supabaseService.deleteUserFromAuth(customer.auth_uuid);

    closeDeleteConfirm();
    await fetchCustomers();
  } catch (error) {
    console.error("Falha ao excluir o cliente:", error);
    deleteError.value = error.message;
  } finally {
    isDeleting.value = false;
  }
}

// --- Funções Utilitárias ---
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Corrigido para retornar a data formatada
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert('ID copiado para a área de transferência!');
  } catch (err) {
    console.error('Falha ao copiar:', err);
    alert('Não foi possível copiar o ID.');
  }
}
</script>

<template>
<div class="flex h-screen bg-gray-50">
  <SideMenu />
  <PopUpNewCustomer v-if="popUpNewCustomer" @customer-created="fetchCustomers" />
  <EditCustomerModal v-if="customerToEdit" :customer="customerToEdit" @close="closeEditModal" @customer-updated="handleCustomerUpdated" />

  <div v-if="customerToDelete" class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
          <p class="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir permanentemente o cliente 
            <strong class="text-red-600">{{ customerToDelete.name }}</strong>? 
            Esta ação removerá o usuário do sistema de autenticação e não pode ser desfeita.
          </p>
          <div v-if="deleteError" class="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            <strong>Erro:</strong> {{ deleteError }}
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 flex justify-end gap-3 rounded-b-lg">
          <button @click="closeDeleteConfirm" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="confirmDelete" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">
            {{ isDeleting ? 'Excluindo...' : 'Sim, Excluir' }}
          </button>
        </div>
      </div>
    </div>
  
  <div class="flex-1 p-6 lg:p-10 overflow-auto"> 
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Clientes Sinapse</h1>
       <div class="flex items-center gap-4">
        <button @click="fetchCustomers" class="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Atualizar lista">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4l-4 4M4 20l4-4" /></svg>
        </button>
        <button @click="togglePopUpNewCustomer" class="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          Cadastrar Cliente
        </button>
      </div>
    </div>

    <div class="shadow-md rounded-xl border border-gray-200 bg-white overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">#</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telefone</th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Função</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(customer, index) in customers" :key="customer.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 text-sm min-w-[250px]">
              <div class="font-semibold text-gray-800 truncate" :title="customer.name">{{ customer.name }}</div>
              <div class="text-gray-500 truncate" :title="customer.email">{{ customer.email }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 font-mono">
              <div class="flex items-center gap-2">
                <span :title="customer.id">{{ customer.id.substring(0, 8) }}...</span>
                <button @click="copyToClipboard(customer.id)" class="text-gray-400 hover:text-indigo-600" title="Copiar ID completo">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ customer.phone }}</td>
            <td class="px-6 py-4 text-center">
               <span class="px-2.5 py-1 text-xs font-bold rounded-full" :class="customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-gray-800'">
                {{ customer.status === 'active' ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-1 text-xs font-bold rounded-full capitalize" :class="customer.role === 'adm-sinapse' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'">
                {{ customer.role === 'adm-sinapse' ? 'Admin' : 'Cliente' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-4">
                <button @click="openEditModal(customer)" class="text-indigo-600 hover:text-indigo-900" title="Editar Cliente">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                </button>
                <button @click="openDeleteConfirm(customer)" class="text-red-600 hover:text-red-900" title="Excluir Cliente">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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