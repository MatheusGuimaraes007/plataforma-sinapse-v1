<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// 1. Estado reativo para controlar a abertura/fechamento do menu (mobile)
const isMenuOpen = ref(false); 

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Lógica de rota ativa
const route = useRoute();
const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <header class="md:hidden flex items-center justify-between px-4 py-3 text-white bg-snpLightBlue cursor-pointer">
    <button @click="toggleMenu" class="focus:outline-none cursor-pointer" :aria-label="isMenuOpen ? 'Fechar menu' : 'Abrir menu'">
      <svg v-if="isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </header>

  <aside
    :class="{
      // Em mobile, 'esconde' o menu, a menos que isMenuOpen seja true
      '-translate-x-full': !isMenuOpen,
      'translate-x-0': isMenuOpen
    }"
    class="fixed md:static inset-y-0 left-0 h-screen w-72 md:w-[20%] bg-white text-white
           flex flex-col transform transition-transform duration-200 ease-out z-40
           md:translate-x-0" >
    <div class="p-4 border-b border-white/10">
      <h1 class="text-xl md:text-2xl font-semibold text-snpDarkBlue">Nome Sinapser
        </h1>
    </div>
    <nav class="flex-1 p-4 space-y-1">
      <router-link
        to="/admDashboard"
        class="block px-3 py-1 rounded transition bg-snpLightBlue/30"
        :class="isActive('/contatos') ? 'bg-white/15' : 'hover:bg-snpLightBlue/50'"
      >
        <span class="text-snpDarkBlue">Dashboard</span>
      </router-link>
      <router-link
        to="/admCostumers"
        class="block px-3 py-1 rounded transition bg-snpLightBlue/30"
        :class="isActive('/contatos') ? 'bg-white/15' : 'hover:bg-snpLightBlue/50'"
      >
        <span class="l text-snpDarkBlue">Clientes</span>
      </router-link>
      <router-link
        to="/admPanel"
        class="block px-3 py-1 rounded transition bg-snpLightBlue/30"
        :class="isActive('/contatos') ? 'bg-white/15' : 'hover:bg-snpLightBlue/50'"
      >
        <span class="text-snpDarkBlue">Painel Administrativo</span>
      </router-link>
      <router-link
        to="/admConnectionWhatsApp"
        class="block px-3 py-1 rounded transition bg-snpLightBlue/30"
        :class="isActive('/contatos') ? 'bg-white/15' : 'hover:bg-snpLightBlue/50'"
      >
        <span class="text-snpDarkBlue">Conexões WhatsApp</span>
      </router-link>
    </nav>
    <div class="p-4 gap-1 flex">
      <button
        class="w-[40%] px-3 py-2 rounded bg-snpDarkBlue text-white font-medium 
                hover:bg-snpDarkBlue/90 cursor-pointer transition"
      >
        Sair
      </button>
    </div>
  </aside>

  <div
    v-if="isMenuOpen"
    @click="toggleMenu"
    class="fixed inset-0 bg-black/30 z-30 md:hidden"
  />
</template>