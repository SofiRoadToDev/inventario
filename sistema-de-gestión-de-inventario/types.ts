
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
  apellido: string;
  departamento?: string;
  dni?: string; // DNI es opcional en la API
  rol: string; // El name del rol
  roleId?: string; // ID del rol
}

export interface Asset {
  id: string;
  name: string;
  descripcion?: string;
  numeroSerie: string;
  valorCompra: number;
  fechaCompra: string;
  estadoActual: AssetStatus;
  imagenes: string[]; // La API usa imageUrl (singular), la UI puede manejar múltiples
  agenteId?: string;
  ubicacionId?: string;
  categoryId?:string;
  nomenclaturaId?: string;
  history: InventoryHistory[];
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
  id: string;
  codigo: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}
