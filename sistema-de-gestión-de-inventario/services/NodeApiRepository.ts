
import { Agent, Asset, AssetStatus, LoginResponse } from "../types";
import { IInventoryRepository } from "./IInventoryRepository";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      // Error de respuesta del servidor (400-500)
      console.error('Error de API:', error.response.status, error.response.data);
      
      // Si es error 401 (no autorizado), redirigir al login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      console.error('Error de red:', error.request);
    } else {
      // Error en la configuración de la solicitud
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export class NodeApiRepository implements IInventoryRepository {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      console.error("Error en el login:", error);
      throw error;
    }
  }

  async getAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get("/agents");
      return response.data.map((agent: any) => this.mapApiAgentToAgent(agent));
    } catch (error) {
      console.error("Error al obtener agentes:", error);
      throw error;
    }
  }

  async createAgent(agentData: Omit<Agent, "id">): Promise<Agent> {
    try {
      const response = await apiClient.post("/agents", this.mapAgentToApiAgent(agentData));
      return this.mapApiAgentToAgent(response.data);
    } catch (error) {
      console.error("Error al crear agente:", error);
      throw error;
    }
  }

  async getAgentById(id: string): Promise<Agent & { assets: Asset[] }> {
    try {
      const response = await apiClient.get(`/agents/${id}`);
      const agent = this.mapApiAgentToAgent(response.data);
      const assets = response.data.assets ? 
        response.data.assets.map((asset: any) => this.mapApiAssetToAsset(asset)) : 
        [];
      return { ...agent, assets };
    } catch (error) {
      console.error(`Error al obtener agente con ID ${id}:`, error);
      throw error;
    }
  }

  async updateAgent(id: string, agentData: Omit<Agent, "id">): Promise<Agent> {
    try {
      const response = await apiClient.put(`/agents/${id}`, this.mapAgentToApiAgent(agentData));
      return this.mapApiAgentToAgent(response.data);
    } catch (error) {
      console.error(`Error al actualizar agente con ID ${id}:`, error);
      throw error;
    }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      await apiClient.delete(`/agents/${id}`);
    } catch (error) {
      console.error(`Error al eliminar agente con ID ${id}:`, error);
      throw error;
    }
  }

  async getAssets(status?: AssetStatus, agentId?: string): Promise<Asset[]> {
    try {
      const params: any = {};
      if (status) params.status = this.mapAssetStatusToApiStatus(status);
      if (agentId) params.agentId = agentId;
      
      const response = await apiClient.get("/assets", { params });
      return response.data.map((asset: any) => this.mapApiAssetToAsset(asset));
    } catch (error) {
      console.error("Error al obtener activos:", error);
      throw error;
    }
  }

  async createAsset(assetData: Omit<Asset, "id" | "history">): Promise<Asset> {
    try {
      const response = await apiClient.post("/assets", this.mapAssetToApiAsset(assetData));
      return this.mapApiAssetToAsset(response.data);
    } catch (error) {
      console.error("Error al crear activo:", error);
      throw error;
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      const response = await apiClient.get(`/assets/${id}`);
      return this.mapApiAssetToAsset(response.data);
    } catch (error) {
      console.error(`Error al obtener activo con ID ${id}:`, error);
      throw error;
    }
  }

  async updateAsset(id: string, assetData: Omit<Asset, "id" | "history">): Promise<Asset> {
    try {
      const response = await apiClient.put(`/assets/${id}`, this.mapAssetToApiAsset(assetData));
      return this.mapApiAssetToAsset(response.data);
    } catch (error) {
      console.error(`Error al actualizar activo con ID ${id}:`, error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await apiClient.delete(`/assets/${id}`);
    } catch (error) {
      console.error(`Error al eliminar activo con ID ${id}:`, error);
      throw error;
    }
  }

  async getAssetsByAgentReport(): Promise<any[]> {
    try {
      const response = await apiClient.get("/reports/assets-by-agent");
      return response.data;
    } catch (error) {
      console.error("Error al obtener reporte de activos por agente:", error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.filePath;
    } catch (error) {
      console.error("Error al subir archivo:", error);
      throw error;
    }
  }

  // --- Mappers ---

  private mapApiAgentToAgent(apiAgent: any): Agent {
    return {
      id: apiAgent.id.toString(),
      apellido: apiAgent.name.split(' ').slice(1).join(' '),
      nombre: apiAgent.name.split(' ')[0],
      dni: apiAgent.dni || 'N/A', // Si existe dni en la API lo usamos, sino 'N/A'
      rol: apiAgent.department, // Usando department como rol
    };
  }
  
  private mapAgentToApiAgent(agent: Omit<Agent, "id"> | Agent): any {
    return {
      name: `${agent.nombre} ${agent.apellido}`.trim(),
      department: agent.rol,
      dni: agent.dni
    };
  }
  
  private mapApiAssetToAsset(apiAsset: any): Asset {
    return {
      id: apiAsset.id.toString(),
      name: apiAsset.name,
      description: apiAsset.description || '',
      serialNumber: apiAsset.serialNumber,
      purchasePrice: parseFloat(apiAsset.value),
      currentValue: parseFloat(apiAsset.value),
      purchaseDate: apiAsset.purchaseDate,
      currentStatus: this.mapApiStatusToAssetStatus(apiAsset.status),
      images: apiAsset.imageUrl ? [apiAsset.imageUrl] : [],
      agentId: apiAsset.agentId?.toString(),
      locationId: apiAsset.locationId?.toString(),
      categoryId: apiAsset.categoryId?.toString(),
      nomenclatureId: apiAsset.nomenclatureId?.toString(),
      history: []
    };
  }
  
  private mapAssetToApiAsset(asset: Omit<Asset, "id" | "history"> | Asset): any {
    return {
      name: asset.name,
      description: asset.description,
      serialNumber: asset.serialNumber,
      value: asset.currentValue,
      purchaseDate: asset.purchaseDate,
      status: this.mapAssetStatusToApiStatus(asset.currentStatus),
      imageUrl: asset.images[0] || null,
      agentId: asset.agentId ? parseInt(asset.agentId) : null,
      locationId: asset.locationId ? parseInt(asset.locationId) : null,
      categoryId: asset.categoryId ? parseInt(asset.categoryId) : null,
      nomenclatureId: asset.nomenclatureId ? parseInt(asset.nomenclatureId) : null
    };
  }
  
  private mapApiStatusToAssetStatus(apiStatus: string): AssetStatus {
    const statusMap: Record<string, AssetStatus> = {
      'active': AssetStatus.ACTIVO,
      'in_repair': AssetStatus.EN_REPARACION,
      'decommissioned': AssetStatus.BAJA
    };
    return statusMap[apiStatus] || AssetStatus.ACTIVO;
  }
  
  private mapAssetStatusToApiStatus(status: AssetStatus): string {
    const statusMap: Record<AssetStatus, string> = {
      [AssetStatus.ACTIVO]: 'active',
      [AssetStatus.EN_REPARACION]: 'in_repair',
      [AssetStatus.BAJA]: 'decommissioned'
    };
    return statusMap[status] || 'active';
  }
}
