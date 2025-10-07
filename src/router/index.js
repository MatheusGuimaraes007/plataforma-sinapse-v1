import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../composables/useSupabase";

// Importações dos componentes
import Login from '../components/Login.vue';
import AdmDashboard from "../components/adm/AdmDashboard.vue";
import AdmCustomer from "../components/adm/AdmCustomer.vue";
import admConnectionWhatsApp from "../components/adm/admConnectionWhatsApp.vue";
// 👇 CORRIGIDO: Nome do componente e caminho padronizado
import CustomerNumberConnection from "../components/customers/CustomerNumberConnection.vue";

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
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admCustomers',
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
    // 👇 CORRIGIDO: path e name padronizados
    path: '/customerNumberConnection',
    name: 'customerNumberConnection',
    component: CustomerNumberConnection,
    meta: { requiresAuth: true, role: 'customer' }
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

  if (to.meta.requiresAuth && !userIsLoggedIn) {
    next({ name: 'Login' });
  } 
  else if (to.meta.role && userRole !== to.meta.role) {
    if (userRole === 'adm-sinapse') {
      next({ name: 'admDashboard' });
    } else if (userRole === 'customer') {
      // 👇 CORRIGIDO: Redirecionamento para o nome de rota correto
      next({ name: 'customerNumberConnection' });
    } else {
      next({ name: 'Login' });
    }
  }
  else if (to.name === 'Login' && userIsLoggedIn) {
    if (userRole === 'adm-sinapse') {
      next({ name: 'admDashboard' });
    } else {
       // 👇 CORRIGIDO: Redirecionamento para o nome de rota correto
      next({ name: 'customerNumberConnection' });
    }
  }
  else {
    next();
  }
});

export default router;