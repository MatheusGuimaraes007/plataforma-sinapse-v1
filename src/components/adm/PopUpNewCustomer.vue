<script setup>
import { ref } from 'vue';
import { useAdmCustomers } from '../../composables/useAdmCustomers.js';
import { usePopUp } from '../../composables/usePopUp.js';

const { phone, email, name, errorMessage, createCustomer, showPassword, password } = usePopUp();

const { togglePopUpNewCustomer } = useAdmCustomers();

const sanitizePhone = () => {
  let value = phone.value.replace(/\D/g, '');
  value = value.slice(0, 11);
  phone.value = value;
};

const copyPasswordToClipboard = async () => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(password.value);
      alert('Senha copiada com sucesso! ✔️');
    } else {
      alert('Seu navegador não suporta a cópia automática. Por favor, copie a senha manualmente.');
    }
  } catch (err) {
    console.error('Erro ao copiar: ', err);
    alert('Erro ao tentar copiar a senha. ❌');
  }
};
</script>

<template>
  <div class="fixed inset-0 z-40 bg-black/85 flex items-center justify-center">
    <div v-if="!showPassword" class="bg-white p-6 rounded-lg w-[40%] shadow-lg">
      <h1 class="text-2xl mb-5">Cadastro de Cliente</h1>
      <form @submit.prevent="createCustomer">
        <label for="name">Nome</label>
        <input type="text" id="name" v-model.trim="name" class="border px-4 py-2 w-full mb-4 rounded-md" />
        <label for="email">Email</label>
        <input type="email" id="email" v-model.trim="email" class="border px-4 py-2 w-full mb-4 rounded-md" />
        <label for="phone">Telefone</label>
        <input 
          type="text" 
          id="phone" 
          v-model.trim="phone" 
          @input="sanitizePhone" 
          placeholder="19998625722"
          class="border px-4 py-2 w-full mb-4 rounded-md" 
        />
        <div class="flex justify-end">
          <button type="button" @click="togglePopUpNewCustomer" class="px-4 py-2 bg-gray-300 rounded mr-2 cursor-pointer">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Salvar</button>
        </div>
        <div v-if="errorMessage" class="mt-3 bg-red-100 text-red-700 rounded-md px-4 py-2">
          <span>{{ errorMessage }}</span>
        </div>
      </form>
    </div>
    
    <div v-if="showPassword" class="bg-white p-6 rounded-lg w-[40%] shadow-lg flex flex-col">
      <div class="flex flex-col mb-4">
        <h1 class="text-2xl mb-4">Dados do usuário</h1>
        <div class="flex flex-col gap-2 p-4 bg-gray-50 rounded-md border">
          <p><strong>Nome:</strong> {{ name }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
          <p><strong>Telefone:</strong> {{ phone }}</p>
          <p><strong>Senha:</strong> <code class="bg-gray-200 p-1 rounded">{{ password }}</code></p>
          <span class="font-bold mt-3 bg-blue-100 text-blue-800 p-3 rounded-md text-sm">
            Copie a senha antes de fechar, ela só aparecerá uma vez!
          </span>
        </div>
      </div>
      <button 
        type="button" 
        @click="copyPasswordToClipboard" 
        class="w-full px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-700"
      >
        Copiar Senha
      </button>
      <button type="button" @click="togglePopUpNewCustomer" class="w-full px-4 py-2 bg-gray-200 rounded mt-2 cursor-pointer hover:bg-gray-300">
        Fechar
      </button>
    </div>
  </div>
</template>