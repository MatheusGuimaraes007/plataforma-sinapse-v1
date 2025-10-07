import { SupabaseService } from "./serviceSupabase";

export class WapiWebhooks {
  constructor(instanceId, token, urlValue) {
    this.instanceId = instanceId;
    this.token = token;
    this.urlValue = urlValue; 
    
    // 1. Instancia o SupabaseService para que possamos usá-lo aqui dentro
    this.supabaseService = new SupabaseService();

    // Endpoints da API externa
    this.whenConnectionUrl = import.meta.env.VITE_ROUTE_WHEN_CONNECTION;
    this.whenDisconnectionUrl = import.meta.env.VITE_ROUTE_WHEN_DISCONNECTION;
    this.whenToSendUrl = import.meta.env.VITE_ROUTE_WHEN_TO_SEND;
    this.whenToReceiveUrl = import.meta.env.VITE_ROUTE_WHEN_TO_RECEIVE;
  }

  /**
   * Método privado que orquestra a atualização.
   * @private
   * @param {string} endpointUrl - A URL da API externa.
   * @param {string} actionName - Um nome para logs de erro.
   * @param {string} dbColumnName - O nome da coluna no banco de dados Supabase.
   */
  async #makeWebhookRequest(endpointUrl, actionName, dbColumnName) {
    const url = `${endpointUrl}?instanceId=${this.instanceId}`;
    try {
      // --- PASSO 1: Atualizar a API externa ---
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({
          value: this.urlValue
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP na API externa: ${response.status} - ${errorData.message}`);
      }
      
      const apiResponseData = await response.json();
      console.log(`Webhook (${actionName}) atualizado com sucesso na API externa.`);

      // --- PASSO 2: Atualizar o banco de dados Supabase ---
      // Esta etapa só executa se o Passo 1 foi bem-sucedido.
      await this.supabaseService.updateWebhookUrl(this.instanceId, dbColumnName, this.urlValue);

      return apiResponseData; // Retorna a resposta da API externa
      
    } catch(error) {
      console.error(`Falha ao configurar webhook (${actionName}):`, error);
      throw error;
    }
  }

  async whenConnection() {
    // Passa o nome da coluna correspondente no banco de dados
    return this.#makeWebhookRequest(
      this.whenConnectionUrl, 
      'Conexão',
      'instance_webhook_connected' 
    );
  }
  
  async whenDisconnection() {
    return this.#makeWebhookRequest(
      this.whenDisconnectionUrl, 
      'Desconexão',
      'instance_webhook_disconnected'
    );
  }

  async whenToSend() {
    return this.#makeWebhookRequest(
      this.whenToSendUrl, 
      'Envio de Mensagem',
      'instance_webhook_delivery_message'
    );
  }

  async whenToReceive() {
    return this.#makeWebhookRequest(
      this.whenToReceiveUrl, 
      'Recebimento de Mensagem',
      'instance_webhook_receice_message'
    );
  }
}