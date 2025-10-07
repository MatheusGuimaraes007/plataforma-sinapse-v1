// Arquivo: src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../composables/useSupabase";

import Login from '../components/Login.vue';
import AdmDashboard from "../components/adm/AdmDashboard.vue";
import AdmCustomer from "../components/adm/AdmCustomer.vue";
import admConnectionWhatsApp from "../components/adm/admConnectionWhatsApp.vue";
import CostumerNumberConnection from "../components/costumers/CustumerNumberConnection.vue";

const routes = [
  { path: '/', name: 'Login', component: Login },
  // --- ROTAS DE ADMIN ---
  {
    path: '/admDashboard',
    name: 'admDashboard',
    component: AdmDashboard,
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admCustomers', // Nome da rota e path corrigidos
    name: 'admCustomers',
    component: AdmCustomer,
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admConnectionWhatsApp',
    name: 'admConnectionWhatsApp',
    component: admConnectionWhatsApp,
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  // --- ROTA DE CLIENTE ---
  {
    path: '/costumerNumberConnection',
    name: 'costumerNumberConnection',
    component: CostumerNumberConnection,
    meta: { requiresAuth: true, role: 'customer' } // CORRIGIDO AQUI
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// // --- Guarda de Navegação Global ---
// router.beforeEach(async (to, from, next) => {
//   const { data: { session } } = await supabase.auth.getSession();
//   const userIsLoggedIn = !!session;
//   const userRole = localStorage.getItem('userRole');

//   if (to.meta.requiresAuth && !userIsLoggedIn) {
//     next({ name: 'Login' });
//   } 
//   else if (to.meta.role && userRole !== to.meta.role) {
//     if (userRole === 'adm-sinapse') {
//       next({ name: 'admDashboard' });
//     } else if (userRole === 'customer') { // CORRIGIDO AQUI
//       next({ name: 'costumerNumberConnection' });
//     } else {
//       next({ name: 'Login' });
//     }
//   }
//   else if (to.name === 'Login' && userIsLoggedIn) {
//     if (userRole === 'adm-sinapse') {
//       next({ name: 'admDashboard' });
//     } else {
//       next({ name: 'costumerNumberConnection' });
//     }
//   }
//   else {
//     next();
//   }
// });

export default router;