<script setup>
import { defineProps, defineEmits, onMounted, ref, reactive } from 'vue';
import { SupabaseService } from '../../services/serviceSupabase';
import { WapiWebhooks } from '../../services/wapiWebhooks';

const props = defineProps({
  instanceId: { type: String, required: true },
  token: { type: String, required: true }
});
const emit = defineEmits(['close']);

const supabaseService = new SupabaseService();
const isLoading = ref(true);
const isSaving = ref(false);
const statusMessage = ref({ text: '', type: '' });
const originalData = ref(null);
const formWebhooks = reactive({
  whenConnection: '',
  whenDisconnection: '',
  whenToSend: '',
  whenToReceive: ''
});

async function fetchUserAndInstance() {
  try {
    isLoading.value = true;
    statusMessage.value = { text: '', type: '' };
    const data = await supabaseService.getUserAndInstanceById(props.instanceId);
    if (data && data.connection) {
      originalData.value = data;
      formWebhooks.whenConnection = data.connection.instance_webhook_connected || '';
      formWebhooks.whenDisconnection = data.connection.instance_webhook_disconnected || '';
      // 👇 Nome da coluna de envio/delivery confirmado
      formWebhooks.whenToSend = data.connection.instance_webhook_delivery_message || '';
      formWebhooks.whenToReceive = data.connection.instance_webhook_receice_message || '';
    } else {
      throw new Error("A instância especificada não foi encontrada.");
    }
  } catch (error) {
    console.error("Falha ao buscar dados da instância:", error);
    statusMessage.value = { text: 'Erro ao carregar dados. Verifique o console ou tente novamente.', type: 'error' };
  } finally {
    isLoading.value = false;
  }
}

// Dentro de AdmConnectionSettings.vue

async function handleSave() {
  isSaving.value = true;
  statusMessage.value = { text: '', type: '' };
  
  const tasks = [];
  const originalWebhooks = originalData.value.connection;

  const webhookMapping = {
    whenConnection: { method: 'whenConnection', dbField: 'instance_webhook_connected' },
    whenDisconnection: { method: 'whenDisconnection', dbField: 'instance_webhook_disconnected' },
    whenToSend: { method: 'whenToSend', dbField: 'instance_webhook_delivery_message' },
    whenToReceive: { method: 'whenToReceive', dbField: 'instance_webhook_receice_message' }
  };

  for (const key in webhookMapping) {
    const { method, dbField } = webhookMapping[key];
    if (formWebhooks[key] !== (originalWebhooks[dbField] || '')) {
      const newUrl = formWebhooks[key];
      
      // A instância da classe agora cuida de TUDO (API externa + banco de dados)
      const wapi = new WapiWebhooks(props.instanceId, props.token, newUrl);

      // Adicionamos apenas UMA tarefa, que fará as duas coisas em sequência.
      tasks.push(wapi[method]());
    }
  }

  if (tasks.length === 0) {
    statusMessage.value = { text: 'Nenhuma alteração para salvar.', type: 'info' };
    isSaving.value = false; 
    return;
  }

  try {
    await Promise.all(tasks);
    statusMessage.value = { text: 'Webhooks atualizados com sucesso!', type: 'success' };
    await fetchUserAndInstance();
  } catch (error) {
    console.error("Falha ao salvar webhooks:", error);
    statusMessage.value = { text: `Erro ao salvar: ${error.message}`, type: 'error' };
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  fetchUserAndInstance();
});
</script>

<template>
  <div class="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
      
      <div v-if="isLoading" class="text-center p-10">
        <p class="text-gray-500">Carregando configurações...</p>
      </div>

      <div v-else-if="!originalData && statusMessage.type === 'error'" class="p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Erro</h3>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong class="font-bold">Falha!</strong>
          <span class="block sm:inline">{{ statusMessage.text }}</span>
        </div>
        <div class="flex justify-end mt-4">
            <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded-sm cursor-pointer hover:bg-gray-300/80">Fechar</button>
        </div>
      </div>

      <template v-else>
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800 mb-2">Configuração de Webhooks: {{ originalData.user.name }}</h3>
          <p class="text-sm text-gray-500">
            Instância: <code class="font-semibold text-indigo-600">{{ props.instanceId }}</code>
          </p>
          <p class="text-sm text-gray-500">
            Token: <code class="font-semibold text-indigo-600">{{ props.token }}</code>
          </p>
        </div>
        
        <form class="p-6 overflow-y-auto" @submit.prevent="handleSave">
          <div class="space-y-6">
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <label class="block text-md font-semibold text-gray-800">Webhook de Conexão</label>
              <p class="text-sm font-medium text-gray-500 mt-2">URL Atual:</p>
              <code class="text-xs text-gray-600 bg-gray-200 p-2 rounded-md block w-full truncate">{{ originalData.connection.instance_webhook_connected || 'Nenhuma URL configurada' }}</code>
              <p class="text-sm font-medium text-gray-500 mt-3">Nova URL:</p>
              <input type="url" v-model="formWebhooks.whenConnection" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
               <label class="block text-md font-semibold text-gray-800">Webhook de Desconexão</label>
               <p class="text-sm font-medium text-gray-500 mt-2">URL Atual:</p>
               <code class="text-xs text-gray-600 bg-gray-200 p-2 rounded-md block w-full truncate">{{ originalData.connection.instance_webhook_disconnected || 'Nenhuma URL configurada' }}</code>
               <p class="text-sm font-medium text-gray-500 mt-3">Nova URL:</p>
               <input type="url" v-model="formWebhooks.whenDisconnection" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
             </div>

            <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
               <label class="block text-md font-semibold text-gray-800">Webhook de Envio de Mensagem</label>
               <p class="text-sm font-medium text-gray-500 mt-2">URL Atual:</p>
               <code class="text-xs text-gray-600 bg-gray-200 p-2 rounded-md block w-full truncate">{{ originalData.connection.instance_webhook_delivery_message || 'Nenhuma URL configurada' }}</code>
               <p class="text-sm font-medium text-gray-500 mt-3">Nova URL:</p>
               <input type="url" v-model="formWebhooks.whenToSend" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
             </div>

            <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
               <label class="block text-md font-semibold text-gray-800">Webhook de Recebimento de Mensagem</label>
               <p class="text-sm font-medium text-gray-500 mt-2">URL Atual:</p>
               <code class="text-xs text-gray-600 bg-gray-200 p-2 rounded-md block w-full truncate">{{ originalData.connection.instance_webhook_receice_message || 'Nenhuma URL configurada' }}</code>
               <p class="text-sm font-medium text-gray-500 mt-3">Nova URL:</p>
               <input type="url" v-model="formWebhooks.whenToReceive" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
             </div>
          </div>
        </form>

        <div class="p-4 bg-gray-50 border-t border-gray-200 mt-auto">
          <div v-if="statusMessage.text && originalData" class="text-sm text-center mb-3 p-2 rounded-md" 
            :class="{
              'bg-green-100 text-green-800': statusMessage.type === 'success',
              'bg-red-100 text-red-800': statusMessage.type === 'error',
              'bg-blue-100 text-blue-800': statusMessage.type === 'info'
            }">
            {{ statusMessage.text }}
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded-sm cursor-pointer hover:bg-gray-300/80">Fechar</button>
            <button @click="handleSave" :disabled="isSaving" class="px-4 py-2 bg-blue-300 hover:bg-blue-300/80 rounded-sm cursor-pointer">
              {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>