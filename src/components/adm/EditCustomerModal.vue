<script setup>
import { ref, reactive, onMounted } from 'vue';
import { SupabaseService } from '../../services/serviceSupabase';

const props = defineProps({
  customer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'customer-updated']);

const supabaseService = new SupabaseService();
const isSaving = ref(false);
const errorMessage = ref('');

// Usamos 'reactive' para o formulário
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  role: '',
  status: ''
});

// Quando o componente é montado, preenche o formulário com os dados do cliente
onMounted(() => {
  if (props.customer) {
    formData.name = props.customer.name;
    formData.email = props.customer.email;
    formData.phone = props.customer.phone;
    formData.role = props.customer.role;
    formData.status = props.customer.status;
  }
});

async function handleUpdate() {
  isSaving.value = true;
  errorMessage.value = '';
  try {
    await supabaseService.updateCustomer(props.customer.id, formData);
    emit('customer-updated');
  } catch (error) {
    errorMessage.value = `Erro ao atualizar: ${error.message}`;
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
      <form @submit.prevent="handleUpdate">
        <div class="p-6 border-b">
          <h3 class="text-xl font-bold text-gray-800">Editar Cliente</h3>
          <p class="text-sm text-gray-500">ID: {{ customer.id }}</p>
        </div>

        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label for="edit-name" class="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" id="edit-name" v-model="formData.name" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label for="edit-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="edit-email" v-model="formData.email" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label for="edit-phone" class="block text-sm font-medium text-gray-700">Telefone</label>
            <input type="text" id="edit-phone" v-model="formData.phone" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="edit-role" class="block text-sm font-medium text-gray-700">Função (Role)</label>
              <select id="edit-role" v-model="formData.role" class="mt-1 w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                <option value="customer">Cliente</option>
                <option value="adm-sinapse">Admin</option>
              </select>
            </div>
            <div>
              <label for="edit-status" class="block text-sm font-medium text-gray-700">Status</label>
              <select id="edit-status" v-model="formData.status" class="mt-1 w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
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
              {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>