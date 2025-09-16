
import { Agent, Asset, AssetStatus, Role, Category, Location, Nomenclature } from "../types";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface IInventoryRepository {
  login(email: string, password: string): Promise<LoginResponse>;

  getAgents(): Promise<Agent[]>;
  createAgent(agent: Omit<Agent, "id">): Promise<Agent>;
  getAgentById(id: string): Promise<Agent & { assets: Asset[] }>;
  updateAgent(id: string, agent: Omit<Agent, "id">): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;

  getRoles(): Promise<Role[]>;
  getLocations(): Promise<Location[]>;
  getCategories(): Promise<Category[]>;
  getNomenclatures(): Promise<Nomenclature[]>;

  getAssets(status?: AssetStatus, agentId?: string): Promise<Asset[]>;
  createAsset(asset: Omit<Asset, "id" | "history">): Promise<Asset>;
  getAssetById(id: string): Promise<Asset>;
  updateAsset(id: string, asset: Omit<Asset, "id" | "history">): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  getAssetsByAgentReport(): Promise<any[]>;
  uploadFile(file: File): Promise<string>;

  createCategory(name: string): Promise<Category>;
  createLocation(name: string): Promise<Location>;
  createNomenclature(nomenclature: {code: string, name: string}): Promise<Nomenclature>;
  createRole(name: string): Promise<Role>;
  

  updateNomenclature(id:number, nomenclature: {code: string, name: string}):Promise<Nomenclature>;
  updateLocation(id:number, name:string):Promise<Location>;
  updateCategory(id:string, name:string):Promise<Category>;
  updateRole(id:number, name:string):Promise<Role>;

  deleteCategory(idToDelete: number): Promise<Category>;
  deleteLocation(idToDelete: number): Promise<Location>;
  deleteNomenclature(idToDelete: string): Promise<Nomenclature>;
  deleteRole(idToDelete: number): Promise<Role>;
}
