// Arquivo: src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../composables/useSupabase";

// Importações dos componentes
import Login from '../components/Login.vue'
import AdmDashboard from "../components/adm/AdmDashboard.vue";
import AdmCustomer from "../components/adm/AdmCustomer.vue";
import admConnectionWhatsApp from "../components/adm/admConnectionWhatsApp.vue";
import CostumerNumberConnection from "../components/costumers/CustumerNumberConnection.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  // --- ROTAS DE ADMIN ---
  {
    path: '/admDashboard',
    name: 'admDashboard',
    component: AdmDashboard,
    meta: { requiresAuth: true, role: 'adm-sinapse' } // Protegida e para admins
  },
  {
    path: '/admCustomers', // Corrigido de 'admCostomers'
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
    meta: { requiresAuth: true, role: 'customer' } // Protegida e para clientes
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Guarda de Navegação Global ---
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const userIsLoggedIn = !!session;
  const userRole = localStorage.getItem('userRole');

  // Se a rota requer autenticação e o usuário não está logado
  if (to.meta.requiresAuth && !userIsLoggedIn) {
    next({ name: 'Login' });
  } 
  // Se a rota requer uma role específica e o usuário não tem essa role
  else if (to.meta.role && userRole !== to.meta.role) {
    // Redireciona para a página inicial dele ou para o login
    if (userRole === 'adm-sinapse') {
      next({ name: 'admDashboard' });
    } else if (userRole === 'customer' || userRole === 'costumer') {
      next({ name: 'costumerNumberConnection' });
    } else {
      next({ name: 'Login' });
    }
  }
  // Se o usuário está logado e tenta acessar a página de Login, redireciona
  else if (to.name === 'Login' && userIsLoggedIn) {
    if (userRole === 'adm-sinapse') {
      next({ name: 'admDashboard' });
    } else {
      next({ name: 'costumerNumberConnection' });
    }
  }
  // Se tudo estiver ok, permite a navegação
  else {
    next();
  }
});

export default router;