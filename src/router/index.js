import { createRouter, createWebHistory } from "vue-router";
import Login from '../components/Login.vue'
// import Contatos from "../components/Contatos.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  }
  // {
  //   path: '/contatos',
  //   name: 'contatos',
  //   component: Contatos,
  //   // meta: { requiresAuth: true } // 🔹 Indica que precisa de login
  // }
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