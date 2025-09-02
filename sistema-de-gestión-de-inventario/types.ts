
export enum AssetStatus {
  MUY_BUENO = 'Muy Bueno',
  BUENO = 'Bueno',
  REGULAR = 'Regular',
  MALO = 'Malo',
  PENDIENTE_BAJA = 'Pendiente de Baja',
  DADO_DE_BAJA = 'Dado de Baja',
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
  apellido: string;
  nombre: string;
  dni: string;
  rol: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  serialNumber: string;
  nomenclatureCode: string;
  categoryId: string;
  locationId: string;
  agenteId?: string; // Nuevo campo para el agente responsable
  purchasePrice: number;
  purchaseDate: string;
  currentStatus: AssetStatus;
  currentValue: number;
  images: string[];
  history: InventoryHistory[];
  writeOffReason?: string;
  writeOffPhotos?: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Nomenclature {
    code: string;
    name: string;
}

export interface Role {
    id: string;
    name: string;
}
