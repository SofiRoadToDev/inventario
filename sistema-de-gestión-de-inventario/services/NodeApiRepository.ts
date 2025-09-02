
import { Agent, Asset, AssetStatus } from "../types";
import { IInventoryRepository } from "./IInventoryRepository";
import axios from "axios";

const apiClient = axios.create({
  baseURL:  "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class NodeApiRepository implements IInventoryRepository {
  async getAgents(): Promise<Agent[]> {
    const response = await apiClient.get("/agents");
    return response.data.map(this.mapApiAgentToAgent);
  }

  async createAgent(agentData: Omit<Agent, "id">): Promise<Agent> {
    const response = await apiClient.post("/agents", this.mapAgentToApiAgent(agentData));
    return this.mapApiAgentToAgent(response.data);
  }

  async getAgentById(id: string): Promise<Agent & { assets: Asset[] }> {
    const response = await apiClient.get(`/agents/${id}`);
    const agent = this.mapApiAgentToAgent(response.data);
    const assets = response.data.assets.map(this.mapApiAssetToAsset);
    return { ...agent, assets };
  }

  async updateAgent(id: string, agentData: Omit<Agent, "id">): Promise<Agent> {
    const response = await apiClient.put(`/agents/${id}`, this.mapAgentToApiAgent(agentData));
    return this.mapApiAgentToAgent(response.data);
  }

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/agents/${id}`);
  }

  async getAssets(status?: AssetStatus, agentId?: string): Promise<Asset[]> {
    const params = { status, agentId };
    const response = await apiClient.get("/assets", { params });
    return response.data.map(this.mapApiAssetToAsset);
  }

  async createAsset(assetData: Omit<Asset, "id" | "history">): Promise<Asset> {
    const response = await apiClient.post("/assets", this.mapAssetToApiAsset(assetData));
    return this.mapApiAssetToAsset(response.data);
  }

  async getAssetById(id: string): Promise<Asset> {
    const response = await apiClient.get(`/assets/${id}`);
    return this.mapApiAssetToAsset(response.data);
  }

  async updateAsset(id: string, assetData: Omit<Asset, "id" | "history">): Promise<Asset> {
    const response = await apiClient.put(`/assets/${id}`, this.mapAssetToApiAsset(assetData));
    return this.mapApiAssetToAsset(response.data);
  }

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  }

  async getAssetsByAgentReport(): Promise<any[]> {
    const response = await apiClient.get("/reports/assets-by-agent");
    return response.data;
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post("/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.filePath;
  }

  // --- Mappers ---

  private mapApiAgentToAgent(apiAgent: any): Agent {
    return {
      id: apiAgent.id.toString(),
      apellido: apiAgent.name.split(' ').slice(1).join(' '),
      nombre: apiAgent.name.split(' ')[0],
      dni: 'N/A', // DNI no está en la API
      rol: apiAgent.department, // Usando department como rol
    };
  }

  private mapAgentToApiAgent(agent: Omit<Agent, "id">): any {
    return {
      name: `${agent.nombre} ${agent.apellido}`,
      department: agent.rol,
    };
  }

  private mapApiAssetToAsset(apiAsset: any): Asset {
    return {
      id: apiAsset.id.toString(),
      name: apiAsset.name,
      description: apiAsset.description || '',
      serialNumber: apiAsset.serialNumber,
      nomenclatureCode: 'N/A', // No está en la API
      categoryId: 'N/A', // No está en la API
      locationId: 'N/A', // No está en la API
      agenteId: apiAsset.agentId?.toString(),
      purchasePrice: parseFloat(apiAsset.value),
      purchaseDate: apiAsset.purchaseDate,
      currentStatus: this.mapApiStatusToAssetStatus(apiAsset.status),
      currentValue: parseFloat(apiAsset.value), // Usando el mismo valor de compra
      images: apiAsset.imageUrl ? [apiAsset.imageUrl] : [],
      history: [], // La API no provee historial
    };
  }

  private mapAssetToApiAsset(asset: Omit<Asset, "id" | "history">): any {
    return {
      name: asset.name,
      description: asset.description,
      serialNumber: asset.serialNumber,
      value: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      status: this.mapAssetStatusToApiStatus(asset.currentStatus),
      imageUrl: asset.images.length > 0 ? asset.images[0] : undefined,
      agentId: asset.agenteId ? parseInt(asset.agenteId) : undefined,
    };
  }

  private mapApiStatusToAssetStatus(status: string): AssetStatus {
    switch (status) {
      case 'active':
        return AssetStatus.BUENO;
      case 'in_repair':
        return AssetStatus.REGULAR;
      case 'decommissioned':
        return AssetStatus.DADO_DE_BAJA;
      default:
        return AssetStatus.REGULAR;
    }
  }

  private mapAssetStatusToApiStatus(status: AssetStatus): string {
        switch (status) {
            case AssetStatus.MUY_BUENO:
            case AssetStatus.BUENO:
                return 'active';
            case AssetStatus.REGULAR:
                return 'in_repair';
            case AssetStatus.PENDIENTE_BAJA:
            case AssetStatus.DADO_DE_BAJA:
            case AssetStatus.MALO:
                return 'decommissioned';
            default:
                return 'active';
        }
    }
}
