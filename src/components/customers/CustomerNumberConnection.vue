<script setup>
import SideMenuCustomer from './SideMenuCustomer.vue';
import { ref, onMounted } from 'vue';
import { supabase } from '../../composables/useSupabase';
import { SupabaseService } from '../../services/serviceSupabase';
import { Wapi } from '../../services/wapiInstance';

// --- Instâncias dos Serviços ---
const supabaseService = new SupabaseService();
const wapiService = new Wapi();

// --- Estado do Componente ---
const userInstances = ref([]); // Lista de instâncias do usuário
const isLoading = ref(true);
const qrCodeBase64 = ref(null);
const isQrCodeLoading = ref(false);

// --- Funções do Modal de QR Code ---
async function generateQrCode(instance) {
  isQrCodeLoading.value = true;
  qrCodeBase64.value = null;
  try {
    const response = await wapiService.connectionInstanceByQRCode(instance.instance_id, instance.instance_token);
    if (response && response.qrcode) {
      qrCodeBase64.value = response.qrcode;
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

// --- Lógica de Busca de Dados ---
onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. Pega o usuário atualmente logado no Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 2. Usa o ID do usuário para buscar as instâncias associadas a ele
      const instances = await supabaseService.getInstancesByUserId(user.id);
      userInstances.value = instances;
      console.log('Instâncias do usuário encontradas:', instances);
    }
  } catch (error) {
    console.error("Erro ao buscar instâncias do usuário:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="h-screen flex bg-gray-50">
    <SideMenuCustomer />

    <div v-if="isQrCodeLoading || qrCodeBase64" class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center" @click.self="closeQrCodeModal">
      <div class="bg-white p-8 rounded-lg shadow-xl text-center">
        <h3 class="text-xl font-bold mb-4">Escaneie para Conectar</h3>
        <div v-if="isQrCodeLoading" class="py-10"><p>Gerando QR Code...</p></div>
        <div v-if="qrCodeBase64"><img :src="qrCodeBase64" alt="QR Code para conexão" class="mx-auto" /></div>
        <button @click="closeQrCodeModal" class="mt-6 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Fechar</button>
      </div>
    </div>

    <main class="flex-1 p-6 lg:p-10 overflow-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Minhas Conexões WhatsApp</h1>

      <div v-if="isLoading" class="text-center text-gray-500">
        Buscando suas instâncias...
      </div>

      <div v-else-if="userInstances.length === 0" class="bg-white p-8 rounded-xl shadow-md text-center text-gray-600">
        <h2 class="text-xl font-semibold">Nenhuma instância encontrada</h2>
        <p class="mt-2">Você ainda não possui nenhuma conexão de WhatsApp cadastrada.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="instance in userInstances" :key="instance.instance_id" 
             class="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-56 transition-shadow hover:shadow-xl">
          
          <div class="p-4 border-b border-gray-100 flex-shrink-0">
            <h3 class="font-bold text-lg text-gray-800 truncate" :title="instance.instance_name">
              {{ instance.instance_name || 'Instância Sem Nome' }}
            </h3>
          </div>
          <div class="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center flex-shrink-0 mt-auto">
            <button v-if="instance.status !== 'conected'" @click="generateQrCode(instance)" class="text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors">
              Conectar
            </button>
            <span class="ml-auto" :class="{
              'text-green-800 font-bold bg-green-100 px-2.5 py-1 rounded-full text-xs': instance.status === 'conected',
              'text-red-800 font-bold bg-red-100 px-2.5 py-1 rounded-full text-xs': instance.status !== 'conected'
            }">
              {{ instance.status === 'conected' ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>