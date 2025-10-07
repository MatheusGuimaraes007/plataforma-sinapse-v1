import { supabase } from "../composables/useSupabase";

export class SupabaseService {
  constructor() {
  }

  async getAllUsers() {
    const {data, error} = await supabase.from('users').select('*');
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
    return data;
  }

  async getAllInstances() {
    const {data, error} = await supabase.from('connections_wpp').select('*');
    if (error) {
      console.error('Erro ao buscar conexões:', error);
      throw error;
    }
    return data;
  }

  async getUserAndInstanceById(instanceId) {
    const { data, error } = await supabase
      .from('connections_wpp')
      .select('*, users(*)') // Faz o join com a tabela de usuários
      .eq('instance_id', instanceId)
      .single(); 

    if (error) {
      console.error('Erro ao buscar conexão e usuário:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Reestrutura o retorno para manter o formato { user, connection }
    const { users: userData, ...connectionData } = data;
    
    return { user: userData, connection: connectionData };
  }

  async getAllUsersWithInstances() {
    const {data: connections, error: errorConnections} = await supabase.from('connections_wpp').select('*');
    if (errorConnections) {
      console.error('Erro ao buscar conexões:', errorConnections);
      throw errorConnections;
    }
    const userIds = connections.map(conn => conn.user_id);
    const {data: users, error: errorUsers} = await supabase.from('users').select('*').in('id', userIds);
    if (errorUsers) {
      console.error('Erro ao buscar usuários:', errorUsers);
      throw errorUsers;
    }
    const usersMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});
    console.log('olha', connections.map(conn => ({
      connection: conn,
      user: usersMap[conn.user_id] || null
    })))
    return connections.map(conn => ({
      connection: conn,
      user: usersMap[conn.user_id] || null
    }));
  }
  async updateWebhookUrl(instanceId, columnName, newUrl) {
    const updateData = { [columnName]: newUrl };
    const { data, error } = await supabase
      .from('connections_wpp')
      .update(updateData)
      .eq('instance_id', instanceId)
      .select(); 
    if (error) {
      console.error(`Erro ao atualizar o webhook na coluna ${columnName}:`, error);
      throw error;
    }
    console.log(`Webhook da coluna ${columnName} atualizado com sucesso.`);
    return data;
  }
  async insertNewInstance(instanceData) {
    // O método insert do Supabase espera um array de objetos
    const { data, error } = await supabase
      .from('connections_wpp')
      .insert([instanceData])
      .select();

    if (error) {
      console.error('Erro ao inserir nova instância:', error);
      throw error;
    }

    console.log('Nova instância inserida no Supabase com sucesso.', data);
    return data;
  }
  async deleteInstance(instanceId) {
    const { data, error } = await supabase
      .from('connections_wpp')
      .delete()
      .eq('instance_id', instanceId);

    if (error) {
      console.error(`Erro ao deletar a instância ${instanceId}:`, error);
      throw error;
    }

    console.log(`Instância ${instanceId} deletada do Supabase com sucesso.`);
    return data;
  }
  async updateCustomer(userId, updatedData) {
    const { data, error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error(`Erro ao atualizar o usuário ${userId}:`, error);
      throw error;
    }

    console.log(`Usuário ${userId} atualizado com sucesso.`);
    return data;
  }
    async deleteUserFromTable(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error(`Erro ao deletar usuário da tabela 'users':`, error);
      throw new Error(`Falha ao deletar registro do usuário: ${error.message}`);
    }
    console.log(`Usuário ${userId} deletado da tabela 'users' com sucesso.`);
    return true;
  }
  async deleteUserFromAuth(auth_uuid) {
    // Esta é uma simulação de como seria a chamada em uma Edge Function.
    // Para funcionar no cliente, o 'supabase' client precisaria da service_role key.
    const { data, error } = await supabase.auth.admin.deleteUser(auth_uuid);

    if (error) {
      console.error(`Erro ao deletar usuário do Supabase Auth:`, error);
      // Adiciona uma mensagem mais amigável para o erro comum de permissão
      if (error.message.includes("permission denied")) {
        throw new Error("Permissão negada para deletar usuário do Auth. Esta operação deve ser feita no backend (Edge Function) com privilégios de administrador.");
      }
      throw new Error(`Falha ao deletar usuário da autenticação: ${error.message}`);
    }
    
    console.log(`Usuário ${auth_uuid} deletado do Supabase Auth com sucesso.`);
    return data;
  }
   async getUserProfile(authId) {
    const { data, error } = await supabase
      .from('users')
      .select('*') // Pega todos os dados, incluindo a 'role'
      .eq('auth_uuid', authId)
      .single(); // Espera apenas um resultado

    if (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
    return data;
  }
  async getInstancesByUserId(userId) {
    const { data, error } = await supabase
      .from('connections_wpp')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar instâncias do usuário:', error);
      throw error;
    }
    return data;
  }
}