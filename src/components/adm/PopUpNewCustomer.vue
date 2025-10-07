<script setup>
import { ref } from 'vue';
// 👇 1. CORREÇÃO: Nome do arquivo e da função importada
import { useAdmCustomers } from '../../composables/useAdmCustumers';
import { usePopUp } from '../../composables/usePopUp';

const { phone, email, name, errorMessage, createCustomer, showPassword, password } = usePopUp();

// 👇 2. CORREÇÃO: Nome da função chamada e da variável extraída
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
    <div v-if="!showPassword" class="bg-white p-6 rounded-lg w-[40%] shadow-lg shadow-snpDarkBlue">
      <h1 class="text-2xl mb-5">Cadastro de Cliente</h1>
      <form @submit.prevent="createCustomer">
        <label for="name">Name</label>
        <input type="text" id="name" v-model.trim="name" class="border px-4 py-2 w-full mb-4 rounded-2xl" />
        <label for="email">Email</label>
        <input type="email" id="email" v-model.trim="email" class="border px-4 py-2 w-full mb-4 rounded-2xl" />
        <label for="phone">Telefone</label>
        <input 
          type="text" 
          id="phone" 
          v-model.trim="phone" 
          @input="sanitizePhone" 
          placeholder="19998625722"
          class="border px-4 py-2 w-full mb-4 rounded-2xl" 
        />
        <div class="flex justify-end">
          <button type="button" @click="togglePopUpNewCustomer" class="px-4 py-2 bg-gray-300 rounded mr-2 cursor-pointer">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Salvar</button>
        </div>
        <div v-if="errorMessage" class="mt-3 bg-red-400 rounded-2xl px-4 py-1">
          <span>{{ errorMessage }}</span>
        </div>
      </form>
    </div>
    <div v-if="showPassword" class="bg-white p-6 rounded-lg w-[40%] shadow-lg shadow-snpDarkBlue flex flex-col">
      <div class="flex flex-col mb-4">
        <h1 class="text-2xl mb-4">Dados do usuário</h1>
        <div class="flex flex-col gap-2">
          <span>Nome: {{ name }}</span>
          <span>Email: {{ email }}</span>
          <span>Telefone: {{ phone }}</span>
          <span>Senha: {{ password }}</span>
          <span class="font-bold mt-3 bg-blue-100 p-3 rounded-md">Copie a senha antes de fechar, ela só aparecerá uma vez</span>
        </div>
      </div>
      <button 
        type="button" 
        @click="copyPasswordToClipboard" 
        class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
      >
        Copiar Senha
      </button>
      <button type="button" @click="togglePopUpNewCustomer" class="px-4 py-2 bg-gray-300 rounded mt-2 cursor-pointer">Fechar</button>
    </div>
  </div>
</template>