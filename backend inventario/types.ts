
export enum AssetStatus {
  // Mapea directamente a los estados de la API, pero con etiquetas en español para la UI.
  ACTIVO = 'Activo',
  EN_REPARACION = 'En Reparación',
  BAJA = 'De Baja',
}

export interface InventoryHistory {
  year: number;
  date: string;
  status: AssetStatus;
  value: number;
  locationId: string;
  user: string;
  observations: string;
}

export interface Agent {
  id: string;
  name: string;
  lastName : string;
  dni?:string;
  rolId?: string;
}

export interface Asset {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  value: number;
  purchaseDate?: string;
  status: AssetStatus;
  imageUrls: string[]; 
  agentId?: string;
  locationId?: string;
  categoryId?:string;
  nomenclatureId?: string;
  history: InventoryHistory[];
}

export interface Category {
  id: string;
  name: string;
  description?:string;
}

export interface Location {
  id: string;
  name: string;
  description?:string;
}

export interface Nomenclature {
  id: string;
  code: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}
