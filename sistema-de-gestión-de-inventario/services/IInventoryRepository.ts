
import { Agent, Asset, AssetStatus } from "../types";

export interface IInventoryRepository {
  getAgents(): Promise<Agent[]>;
  createAgent(agent: Omit<Agent, "id">): Promise<Agent>;
  getAgentById(id: string): Promise<Agent & { assets: Asset[] }>;
  updateAgent(id: string, agent: Omit<Agent, "id">): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;

  getAssets(status?: AssetStatus, agentId?: string): Promise<Asset[]>;
  createAsset(asset: Omit<Asset, "id" | "history">): Promise<Asset>;
  getAssetById(id: string): Promise<Asset>;
  updateAsset(id: string, asset: Omit<Asset, "id" | "history">): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  getAssetsByAgentReport(): Promise<any[]>;
  uploadFile(file: File): Promise<string>;
}
