import { createRouter, createWebHistory } from "vue-router";
import Login from '../components/Login.vue'
import admPanel from "../components/adm/AdmPanel.vue";
import AdmCostumer from "../components/adm/AdmCustumer.vue";
import AdmDashboard from "../components/adm/AdmDashboard.vue";
import admConnectionWhatsApp from "../components/adm/admConnectionWhatsApp.vue";
import costumerNumberConnection from "../components/costumers/CustumerNumberConnection.vue";
import CostumerNumberConnection from "../components/costumers/CustumerNumberConnection.vue";
// import Contatos from "../components/Contatos.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admPanel',
    name: 'admPanel',
    component: admPanel,
  },
  {
    path: '/admCostumers',
    name: 'admCostumers',
    component: AdmCostumer,
  },
  {
    path: '/admDashboard',
    name: 'admDashboard',
    component: AdmDashboard,
  },
  {
    path: '/numberConnection',
    name: 'numberConnection',
    component: costumerNumberConnection,
  },
  {
    path: '/admConnectionWhatsApp',
    name: 'admConnectionWhatsApp',
    component: admConnectionWhatsApp,
  },
  {
    path: '/costumerNumberConnection',
    name: 'costumerNumberConnection',
    component: CostumerNumberConnection
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// // 🔹 Guard global
// router.beforeEach((to, from, next) => {
//   const user = localStorage.getItem('user'); // ou qualquer chave que você use no login

//   if (to.meta.requiresAuth && !user) {
//     // Se a rota exige login e não tem user no localStorage → redireciona
//     next({ name: 'Login' });
//   } else {
//     next(); // Continua
//   }
// });

export default router;