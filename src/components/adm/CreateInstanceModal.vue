<script setup>
import { ref, reactive } from 'vue';
import { Wapi } from '../../services/wapiInstance';
import { SupabaseService } from '../../services/serviceSupabase';

// --- Props e Emits ---
const props = defineProps({
  users: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['close', 'instance-created']);

// --- Instâncias dos Serviços ---
const wapiService = new Wapi();
const supabaseService = new SupabaseService();

// --- Estado do Formulário e do Componente ---
const isSaving = ref(false);
const errorMessage = ref('');

const formData = reactive({
  instanceName: '',
  userId: null, // Guardará o ID do usuário selecionado
  rejectCalls: false
});

// --- Lógica de Submissão do Formulário ---
async function handleSubmit() {
  // Validação simples
  if (!formData.instanceName || !formData.userId) {
    errorMessage.value = 'Por favor, preencha o nome da instância e selecione um usuário.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    // Passo 1: Criar a instância na API externa (WAPI)
    console.log('Criando instância na API externa...');
    const wapiResponse = await wapiService.createInstance(
      formData.instanceName,
      formData.rejectCalls,
      'Esta chamada foi recusada.'
    );

    if (wapiResponse.error) {
      throw new Error(wapiResponse.message || 'Erro na API externa.');
    }

    console.log('Instância criada na WAPI:', wapiResponse);
    const { instanceId, token } = wapiResponse;
    const selectedUser = props.users.find(u => u.id === formData.userId);

    // Passo 2: Salvar a nova instância no banco de dados (Supabase)
    const instanceDataForDb = {
      instance_id: instanceId,
      instance_token: token,
      instance_name: formData.instanceName,
      apparent_name: selectedUser.name, // Usando o nome do usuário selecionado
      user_id: formData.userId,
      status: 'disconected',
      number_phone: 'not found'
      // Adicione outros campos com valores padrão se necessário
    };
    
    console.log('Salvando instância no Supabase:', instanceDataForDb);
    await supabaseService.insertNewInstance(instanceDataForDb);

    // Passo 3: Emitir evento de sucesso para o componente pai
    emit('instance-created');

  } catch (error) {
    console.error("Falha ao criar instância:", error);
    errorMessage.value = `Erro: ${error.message}`;
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg">
      <form @submit.prevent="handleSubmit">
        <div class="p-6 border-b">
          <h3 class="text-xl font-bold text-gray-800">Criar Nova Instância</h3>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label for="instanceName" class="block text-sm font-medium text-gray-700">Nome da Instância</label>
            <input 
              type="text" 
              id="instanceName"
              v-model="formData.instanceName"
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label for="user" class="block text-sm font-medium text-gray-700">Associar ao Usuário</label>
            <select 
              id="user"
              v-model="formData.userId"
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              required
            >
              <option :value="null" disabled>-- Selecione um usuário --</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox"
              id="rejectCalls"
              v-model="formData.rejectCalls"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label for="rejectCalls" class="ml-2 block text-sm text-gray-900">Rejeitar chamadas?</label>
          </div>

        </div>

        <div class="p-4 bg-gray-50 border-t flex flex-col items-end">
          <div v-if="errorMessage" class="w-full text-center text-sm text-red-700 bg-red-100 p-2 rounded-md mb-3">
            {{ errorMessage }}
          </div>
          <div class="flex gap-3">
            <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
              {{ isSaving ? 'Criando...' : 'Criar' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>