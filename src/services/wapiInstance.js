export class Wapi {
  constructor() {
    this.apiKey = import.meta.env.VITE_WAPI_KEY;
    this.createInstanceUrl = import.meta.env.VITE_ROUTE_CREATE_INSTANCE;
    this.deleteInstanceUrl = import.meta.env.VITE_ROUTE_DELETE_INSTANCE;
    this.getAllInstancesUrl = import.meta.env.VITE_ROUTE_GET_ALL_INSTANCES;
    this.connectionInstanceByQRCodeUrl = import.meta.env.VITE_ROUTE_CONNECTION_INSTANCE_QR_CODE;
    this.connectInstanceByCodeUrl = import.meta.env.VITE_ROUTE_CONNECTION_INSTANCE_CODE;
  }
  async createInstance(instanceName, rejectCalls, callMessage) {
    try {
      const response = await fetch(this.createInstanceUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          instanceName: instanceName,
          rejectCalls: rejectCalls,
          callMessage: callMessage
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || 'Falha ao criar instância'}`);
      }
      return await response.json(); 
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error; 
    }
  }
  async deleteInstance(instanceId) {
    try {
      const response = await fetch(`${this.deleteInstanceUrl}?instanceId=${instanceId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || 'Falha ao deletar instância'}`);
      }
      return await response.json(); 
    }catch(error) {
      console.error('Erro ao deletar instância:', error);
      throw error; 
    }
  }
  async getAllInstances(pageSize = 10, page = 1) {
    try {
      const response = await fetch(`${this.getAllInstancesUrl}?pageSize=${pageSize}&page=${page}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || 'Falha ao encontrar instâncias'}`);
      }
      return await response.json();
    } catch(error) {
      console.error('Erro ao encontrar instâncias:', error);
      throw error; 
    }
  }

  async connectionInstanceByQRCode(instanceId, instanceToken) {
    try {
      const response = await fetch(`${this.connectionInstanceByQRCodeUrl}?instanceId=${instanceId}&image=disable`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${instanceToken}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || 'Falha ao gerar o qrcode'}`);
      }
      return await response.json();
    }catch(error) {
      console.error('Erro ao gerar qrcode', error);
      throw error; 
    }
  }
  async connectInstanceByCode(instanceId, instanceToken, phoneNumber) {
    try {
      const response = await fetch(`${this.connectInstanceByCodeUrl}?instanceId=${instanceId}&phoneNumber={${phoneNumber}}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${instanceToken}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || 'Falha ao gerar o código de conexão'}`);
      }
      return await response.json();
    }catch(error) {
      console.error('Erro ao conectar instância pelo código', error);
    }
  }
}