<script setup>
import logoEscritaSinapse from '../assets/logoEscrita.svg'
import {ref} from 'vue'
import { useLogin } from '../composables/useLogin';

const { login, email, password, errorMessage } = useLogin();
const showPassword = ref(false);
</script>


<template>
  <div class="h-screen flex items-center justify-center flex-col">
    <img :src="logoEscritaSinapse" alt="Logo Varella"
         class="max-w-full h-auto w-52 sm:w-64 md:w-72 lg:w-80 xl:w-96" />
    <div class="py-4 px-6 shadow-2xl shadow-snpLightBlue rounded-2xl w-full max-w-md mt-5">
      <h2 class="text-2xl mb-6 text-center">Entrar na Plataforma</h2>
      <form @submit.prevent="login" class="flex flex-col">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="email">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Digite seu email"
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2" for="password">Senha</label>
          <input
          v-model="password"
            type="password"
            id="password"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Digite sua senha"
          />
        </div>
        <div class="flex flex-row items-center justify-between gap-x-4">
          <button
            type="submit"
            class="w-1/3 bg-snpDarkBlue text-white py-2 rounded hover:bg-blue-900 transition duration-200 cursor-pointer"
          >
            Entrar
          </button>
          <button
            type="button"
            class="w-2/3 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition duration-200 cursor-pointer"
          >
            Falar com equipe Sinapse
          </button>
        </div>
      </form>
    </div>

  </div>
</template>