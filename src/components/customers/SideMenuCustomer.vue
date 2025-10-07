<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLogin } from '../../composables/useLogin';
import { supabase } from '../../composables/useSupabase';

const { logout } = useLogin();
const route = useRoute();
const userName = ref('Cliente'); // Valor padrão

// Busca o nome do usuário logado ao montar o componente
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.user_metadata && user.user_metadata.full_name) {
    userName.value = user.user_metadata.full_name;
  }
});

const isActive = (path) => route.path === path;
</script>

<template>
  <aside class="fixed md:static inset-y-0 left-0 h-screen w-72 bg-white text-white flex flex-col z-40 md:translate-x-0 shadow-lg">
    <div class="p-4 border-b border-gray-200">
      <h1 class="text-xl md:text-2xl font-bold text-snpDarkBlue truncate" :title="userName">
        {{ userName }}
      </h1>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link
        to="/customerNumberConnection"
        class="block px-4 py-2 rounded-lg transition text-snpDarkBlue font-semibold"
        :class="isActive('/costumerNumberConnection') ? 'bg-snpLightBlue/30' : 'hover:bg-gray-100'"
      >
        Minhas Conexões
      </router-link>
    </nav>
    <div class="p-4 border-t border-gray-100">
      <button @click="logout" class="w-full px-3 py-2 rounded bg-snpDarkBlue text-white font-medium hover:bg-snpDarkBlue/90 cursor-pointer transition">
        Sair
      </button>
    </div>
  </aside>
</template>