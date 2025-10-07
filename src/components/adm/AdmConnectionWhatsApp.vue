<script setup>
// NENHUMA MUDANÇA NO SCRIPT
import SideMenuAdm from './SideMenuAdm.vue';
import AdmConnectionSettings from './admConnectionSettings.vue';
import CreateInstanceModal from './CreateInstanceModal.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { SupabaseService } from '../../services/serviceSupabase';
import { Wapi } from '../../services/wapiInstance';

const wapiService = new Wapi();
const supabaseService = new SupabaseService();

const selectedConnection = ref(null);
const isCreateModalVisible = ref(false);
const qrCodeBase64 = ref(null);
const isQrCodeLoading = ref(false);
const instanceToDelete = ref(null);
const isDeleting = ref(false);

const allUsersWithConnections = ref([]);
const allUsers = ref([]);

function openSettings(item) {
  selectedConnection.value = item;
}
function closeSettings() {
  selectedConnection.value = null;
}
function openCreateModal() {
  isCreateModalVisible.value = true;
}
function closeCreateModal() {
  isCreateModalVisible.value = false;
}
async function handleInstanceCreated() {
  closeCreateModal();
  await fetchAllUsersWithInstances();
}
async function generateQrCode(item) {
  isQrCodeLoading.value = true;
  qrCodeBase64.value = null;
  const { instance_id, instance_token } = item.connection;
  try {
    const response = await wapiService.connectionInstanceByQRCode(instance_id, instance_token);
    if (response && response.qrcode) {
      qrCodeBase64.value = response.qrcode;
    } else {
      console.error("A resposta da API não continha a propriedade 'qrcode'.", response);
    }
  } catch (error) {
    console.error("Falha ao gerar o QR Code:", error);
  } finally {
    isQrCodeLoading.value = false;
  }
}
function closeQrCodeModal() {
  qrCodeBase64.value = null;
  isQrCodeLoading.value = false;
}
function openDeleteConfirm(item) {
  instanceToDelete.value = item;
}
function closeDeleteConfirm() {
  instanceToDelete.value = null;
}
async function confirmDelete() {
  if (!instanceToDelete.value) return;
  isDeleting.value = true;
  const instanceId = instanceToDelete.value.connection.instance_id;
  try {
    await wapiService.deleteInstance(instanceId);
    await supabaseService.deleteInstance(instanceId);
    closeDeleteConfirm();
    await fetchAllUsersWithInstances();
  } catch (error) {
    console.error(`Falha ao excluir a instância ${instanceId}:`, error);
  } finally {
    isDeleting.value = false;
  }
}

let intervalId = null;
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
const fetchAllUsersWithInstances = async () => {
  const formattedData = await supabaseService.getAllUsersWithInstances();
  allUsersWithConnections.value = formattedData;
};
const fetchAllUsers = async () => {
  allUsers.value = await supabaseService.getAllUsers();
};
onMounted(async () => {
  await fetchAllUsersWithInstances();
  await fetchAllUsers();
  intervalId = setInterval(fetchAllUsersWithInstances, TEN_MINUTES_IN_MS);
});
onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <SideMenuAdm />

    <AdmConnectionSettings v-if="selectedConnection" :instance-id="selectedConnection.connection.instance_id" :token="selectedConnection.connection.instance_token" @close="closeSettings" />
    <CreateInstanceModal v-if="isCreateModalVisible" :users="allUsers" @close="closeCreateModal" @instance-created="handleInstanceCreated" />
    <div v-if="isQrCodeLoading || qrCodeBase64" class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center" @click.self="closeQrCodeModal">
      <div class="bg-white p-8 rounded-lg shadow-xl text-center">
        <h3 class="text-xl font-bold mb-4">Escaneie para Conectar</h3>
        <div v-if="isQrCodeLoading" class="py-10"><p>Gerando QR Code...</p></div>
        <div v-if="qrCodeBase64"><img :src="qrCodeBase64" alt="QR Code para conexão" class="mx-auto" /></div>
        <button @click="closeQrCodeModal" class="mt-6 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Fechar</button>
      </div>
    </div>
    <div v-if="instanceToDelete" class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
          <p class="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir a instância <strong class="text-red-600">{{ instanceToDelete.connection.instance_name }}</strong> do usuário <strong>{{ instanceToDelete.user.name }}</strong>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div class="bg-gray-50 px-4 py-3 flex justify-end gap-3 rounded-b-lg">
          <button @click="closeDeleteConfirm" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button @click="confirmDelete" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">{{ isDeleting ? 'Excluindo...' : 'Excluir' }}</button>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 p-6 lg:p-10 overflow-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Status das Conexões</h1>
        <button @click="openCreateModal" class="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          Criar Instância
        </button>
      </div>
      
      <div class="flex-1"> 
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          
          <div v-for="item in allUsersWithConnections" :key="item.connection.instance_id" 
               class="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-64 transition-shadow hover:shadow-xl">
            
            <div class="p-4 border-b border-gray-100 flex justify-between items-start flex-shrink-0">
              <div>
                <h3 class="font-bold text-lg text-gray-800 truncate" :title="item.connection.instance_name">
                  {{ item.connection.instance_name || 'Instância Sem Nome' }}
                </h3>
                <p class="text-sm text-indigo-600 font-medium truncate" :title="item.user?.name">
                  {{ item.user ? item.user.name : 'Usuário Desconhecido' }}
                </p>
              </div>
              <div class="flex items-center gap-1 -mr-2">
                <button @click="openDeleteConfirm(item)" class="p-2 rounded-full hover:bg-red-100 group" title="Excluir Instância">
                  <svg class="h-5 w-5 text-gray-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button @click="openSettings(item)" class="p-2 rounded-full hover:bg-gray-100 group" title="Configurações">
                   <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </div>

            <div class="p-4 flex-grow space-y-3">
              <div>
                <span class="text-xs text-gray-400 font-semibold">Telefone</span>
                <p :class="{'text-red-500': item.connection.number_phone === 'not found'}" class="text-sm font-semibold text-gray-700">
                  {{ item.connection.number_phone !== 'not found' ? item.connection.number_phone : 'Não encontrado'}}
                </p>
              </div>
               <div>
                <span class="text-xs text-gray-400 font-semibold">ID da Instância</span>
                <p class="text-xs text-gray-500 font-mono truncate" :title="item.connection.instance_id">
                  {{ item.connection.instance_id }}
                </p>
              </div>
            </div>
            
            <div class="p-4 border-t border-gray-100 flex items-center flex-shrink-0">
              <button v-if="item.connection.status !== 'conected'" @click="generateQrCode(item)" class="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors">
                Gerar QR Code
              </button>
              <span class="ml-auto" :class="{
                  'text-green-800 font-bold bg-green-100 px-2.5 py-1 rounded-full text-xs': item.connection.status === 'conected',
                  'text-red-800 font-bold bg-red-100 px-2.5 py-1 rounded-full text-xs': item.connection.status !== 'conected'
                }">
                {{ item.connection.status === 'conected' ? 'Conectado' : 'Desconectado' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>