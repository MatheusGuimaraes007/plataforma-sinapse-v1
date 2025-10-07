import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../composables/useSupabase";

// --- IMPORTAÇÕES CORRIGIDAS ---
// Nomes dos arquivos agora correspondem exatamente (maiúsculas e minúsculas)
import Login from '../components/Login.vue';
import AdmPanel from "../components/adm/AdmPanel.vue";
import AdmCustomer from "../components/adm/AdmCustomer.vue";
import AdmDashboard from "../components/adm/AdmDashboard.vue";
import AdmConnectionWhatsApp from "../components/adm/AdmConnectionWhatsApp.vue";
import CustomerNumberConnection from "../components/customers/CustomerNumberConnection.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admPanel',
    name: 'admPanel',
    component: AdmPanel, // A variável já estava correta
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admCustomers',
    name: 'admCustomers',
    component: AdmCustomer,
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admDashboard',
    name: 'admDashboard',
    component: AdmDashboard,
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
    path: '/admConnectionWhatsApp',
    name: 'admConnectionWhatsApp',
    component: AdmConnectionWhatsApp, // A variável já estava correta
    meta: { requiresAuth: true, role: 'adm-sinapse' }
  },
  {
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

// A guarda de navegação já estava correta
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
      next({ name: 'customerNumberConnection' });
    } else {
      next({ name: 'Login' });
    }
  }
  else if (to.name === 'Login' && userIsLoggedIn) {
    if (userRole === 'adm-sinapse') {
      next({ name: 'admDashboard' });
    } else {
      next({ name: 'customerNumberConnection' });
    }
  }
  else {
    next();
  }
});

export default router;