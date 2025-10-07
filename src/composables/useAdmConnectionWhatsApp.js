// useAdmConnectionWhatsApp.js
import { ref } from "vue";
import { Wapi } from "../services/wapiInstance";


export function useAdmConnectionWhatsApp() {
 const connections = ref([]); 
 const responseWapi = ref({}) 
 const errorMessage = ref(""); 
 const successMessage = ref(""); 
 const wapi = new Wapi(); 

 
 async function fetchInstancesWithWapi(pageSize = 10, page = 1) {
  try {
   const apiResponse = await wapi.getAllInstances(pageSize, page);
   responseWapi.value = apiResponse;
   connections.value = apiResponse.data || []; 
   console.log("Instâncias buscadas com sucesso:", apiResponse);
  } catch (error) {
  }
 }


 return {connections, errorMessage, successMessage, responseWapi, fetchInstancesWithWapi};
}