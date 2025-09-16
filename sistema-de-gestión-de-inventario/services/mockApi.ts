import { Asset, Location, Category, Nomenclature, AssetStatus, Agent, InventoryHistory, Role } from '../types';
import { IInventoryRepository, LoginResponse } from './IInventoryRepository';

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const mockLocations: Location[] = [
  { id: 'loc-1', name: 'Aula 1' },
  { id: 'loc-2', name: 'Aula 2' },
  { id: 'loc-3', name: 'Biblioteca' },
  { id: 'loc-4', name: 'Dirección' },
  { id: 'loc-5', name: 'Laboratorio de Ciencias' },
  { id: 'loc-6', name: 'Depósito' },
];

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Mobiliario' },
  { id: 'cat-2', name: 'Equipamiento Informático' },
  { id: 'cat-3', name: 'Material Didáctico' },
  { id: 'cat-4', name: 'Equipamiento Deportivo' },
];

const mockNomenclatures: Nomenclature[] = [
    { code: 'MOB-SIL-001', name: 'Silla de Plástico Azul'},
    { code: 'MOB-MES-001', name: 'Mesa de Alumno'},
    { code: 'EQI-COM-001', name: 'Computadora de Escritorio'},
    { code: 'EQI-PRO-001', name: 'Proyector Multimedia'},
];

const mockRoles: Role[] = [
    { id: '1', name: 'Administrador' },
    { id: '2', name: 'Agente' },
    { id: '3', name: 'Supervisor' },
];

let agents: Agent[] = [
    { id: 'AGENT-001', nombre: 'Pérez', apellido: 'Juan', dni: '12345678', rol: 'administrador' },
    { id: 'AGENT-002', nombre: 'Gómez', apellido: 'María', dni: '87654321', rol: 'agente' },
    { id: 'AGENT-003', nombre: 'Rodríguez', apellido: 'Carlos', dni: '11223344', rol: 'agente' },
];

let mockAssets: Asset[] = [
  {
    id: 'ASSET-001',
    name: 'Silla de Plástico Azul',
    description: 'Silla de plástico azul para alumnos de primaria.',
    serialNumber: 'SN-001',
    nomenclatureCode: 'MOB-SIL-001',
    categoryId: 'cat-1',
    locationId: 'loc-1',
    agenteId: 'AGENT-002', // Asignado a María Gómez
    purchasePrice: 25,
    purchaseDate: '2022-03-15',
    currentStatus: AssetStatus.BUENO,
    currentValue: 20,
    images: ['https://picsum.photos/seed/ASSET-001/400/300'],
    history: [
      { year: 2023, date: '2023-11-20', status: AssetStatus.BUENO, value: 20, locationId: 'loc-1', user: 'admin', observations: 'Sin novedad.' },
      { year: 2022, date: '2022-11-18', status: AssetStatus.MUY_BUENO, value: 25, locationId: 'loc-1', user: 'admin', observations: 'Recién comprado.' },
    ],
  },
  {
    id: 'ASSET-002',
    name: 'Computadora de Escritorio',
    description: 'PC de escritorio con monitor, teclado y mouse.',
    serialNumber: 'SN-002',
    nomenclatureCode: 'EQI-COM-001',
    categoryId: 'cat-2',
    locationId: 'loc-3',
    agenteId: 'AGENT-001', // Asignado a Juan Pérez
    purchasePrice: 800,
    purchaseDate: '2021-08-01',
    currentStatus: AssetStatus.REGULAR,
    currentValue: 450,
    images: ['https://picsum.photos/seed/ASSET-002/400/300'],
    history: [
        { year: 2023, date: '2023-11-20', status: AssetStatus.REGULAR, value: 450, locationId: 'loc-3', user: 'admin', observations: 'El ventilador hace ruido.' },
        { year: 2022, date: '2022-11-18', status: AssetStatus.BUENO, value: 600, locationId: 'loc-3', user: 'admin', observations: 'Funciona bien.' },
        { year: 2021, date: '2021-11-15', status: AssetStatus.MUY_BUENO, value: 800, locationId: 'loc-3', user: 'admin', observations: 'Instalación inicial.' },
    ],
  },
  {
    id: 'ASSET-003',
    name: 'Proyector Multimedia',
    description: 'Proyector para aulas, marca Epson.',
    serialNumber: 'SN-003',
    nomenclatureCode: 'EQI-PRO-001',
    categoryId: 'cat-2',
    locationId: 'loc-5',
    agenteId: 'AGENT-002', // Asignado a María Gómez
    purchasePrice: 600,
    purchaseDate: '2023-01-10',
    currentStatus: AssetStatus.MALO,
    currentValue: 300,
    images: ['https://picsum.photos/seed/ASSET-003/400/300'],
    history: [
       { year: 2023, date: '2023-11-20', status: AssetStatus.MALO, value: 300, locationId: 'loc-5', user: 'admin', observations: 'La lámpara se quemó. No da imagen.' },
    ],
  },
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `ASSET-${String(i + 4).padStart(3, '0')}`,
    name: 'Mesa de Alumno',
    description: 'Mesa bipersonal de madera.',
    serialNumber: `SN-MESA-${i+1}`,
    nomenclatureCode: 'MOB-MES-001',
    categoryId: 'cat-1',
    locationId: i < 14 ? 'loc-1' : 'loc-2',
    agenteId: 'AGENT-003', // Asignado a Carlos Rodríguez
    purchasePrice: 60,
    purchaseDate: '2023-02-20',
    currentStatus: AssetStatus.MUY_BUENO,
    currentValue: 60,
    images: [`https://picsum.photos/seed/ASSET-${i+4}/400/300`],
    history: [
       { year: 2023, date: '2023-11-20', status: AssetStatus.MUY_BUENO, value: 60, locationId: i < 14 ? 'loc-1' : 'loc-2', user: 'admin', observations: 'Sin novedad.' },
    ],
  })),
];

const generateId = () => Math.random().toString(36).substr(2, 9);

class MockApiRepository implements IInventoryRepository {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log("MOCK API: Logging in...");
    if (email === 'sofi@gmail.com' && password === 'sofi2025') {
      const user = { id: 1, name: 'Sofi Mock', email: 'sofi@gmail.com' };
      return new Promise(resolve => setTimeout(() => resolve({ token: MOCK_TOKEN, user }), 300));
    }
    return Promise.reject('Invalid mock credentials');
  }

  async getAgents(): Promise<Agent[]> {
    console.log("MOCK API: Fetching all agents...");
    return new Promise(resolve => setTimeout(() => resolve([...agents]), 300));
  }

  async createAgent(agentData: Omit<Agent, 'id'>): Promise<Agent> {
    console.log("MOCK API: Creating agent...");
    const newAgent: Agent = {
      ...agentData,
      id: `AGENT-${generateId().toUpperCase()}`,
    };
    agents.push(newAgent);
    return new Promise(resolve => setTimeout(() => resolve(newAgent), 300));
  }

  async getAgentById(id: string): Promise<Agent & { assets: Asset[] }> {
    console.log(`MOCK API: Fetching agent by id ${id}...`);
    const agent = agents.find(a => a.id === id);
    if (!agent) {
      return Promise.reject('Agent not found');
    }
    const assets = mockAssets.filter(a => a.agenteId === id);
    return new Promise(resolve => setTimeout(() => resolve({ ...agent, assets }), 300));
  }

  async updateAgent(id: string, updatedAgentData: Omit<Agent, 'id'>): Promise<Agent> {
    console.log(`MOCK API: Updating agent ${id}...`);
    const index = agents.findIndex(agent => agent.id === id);
    if (index > -1) {
      agents[index] = { ...agents[index], ...updatedAgentData };
      return new Promise(resolve => setTimeout(() => resolve(agents[index]), 300));
    }
    return Promise.reject('Agent not found');
  }

  async deleteAgent(id: string): Promise<void> {
    console.log(`MOCK API: Deleting agent ${id}...`);
    agents = agents.filter(agent => agent.id !== id);
    return new Promise(resolve => setTimeout(() => resolve(), 300));
  }

  async getAssets(status?: AssetStatus, agentId?: string): Promise<Asset[]> {
    console.log("MOCK API: Fetching all assets...");
    let filteredAssets = [...mockAssets];
    if (status) {
        filteredAssets = filteredAssets.filter(a => a.currentStatus === status);
    }
    if (agentId) {
        filteredAssets = filteredAssets.filter(a => a.agenteId === agentId);
    }
    return new Promise(resolve => setTimeout(() => resolve(filteredAssets), 500));
  }

  async createAsset(assetData: Omit<Asset, 'id' | 'history'>): Promise<Asset> {
    console.log("MOCK API: Adding new asset...");
    const newAsset: Asset = {
      ...assetData,
      id: `ASSET-${String(mockAssets.length + 1).padStart(3, '0')}`,
      history: [{
          year: new Date().getFullYear(),
          date: new Date().toISOString().split('T')[0],
          status: assetData.currentStatus,
          value: assetData.currentValue,
          locationId: assetData.locationId,
          user: 'admin',
          observations: 'Alta inicial del bien.'
      }]
    };
    mockAssets.push(newAsset);
    return new Promise(resolve => setTimeout(() => resolve(newAsset), 500));
  }

  async getAssetById(id: string): Promise<Asset> {
    console.log(`MOCK API: Fetching asset by id ${id}...`);
    const asset = mockAssets.find(a => a.id === id);
    if (asset) {
        return new Promise(resolve => setTimeout(() => resolve(asset), 300));
    }
    return Promise.reject("Asset not found");
  }

  async updateAsset(id: string, updateData: Omit<Asset, 'id' | 'history'>): Promise<Asset> {
    console.log(`MOCK API: Updating asset ${id}...`);
    let asset = mockAssets.find(a => a.id === id);
    if(asset) {
        asset = { ...asset, ...updateData };
        mockAssets = mockAssets.map(a => a.id === id ? asset! : a);
        return new Promise(resolve => setTimeout(() => resolve(asset!), 500));
    }
    return Promise.reject("Asset not found");
  }

  async deleteAsset(id: string): Promise<void> {
    console.log(`MOCK API: Deleting asset ${id}...`);
    mockAssets = mockAssets.filter(a => a.id !== id);
    return new Promise(resolve => setTimeout(() => resolve(), 500));
  }

  async getAssetsByAgentReport(): Promise<any[]> {
      console.log("MOCK API: Fetching assets by agent report...");
      const report = agents.map(agent => ({
          ...agent,
          assets: mockAssets.filter(asset => asset.agenteId === agent.id)
      }));
      return new Promise(resolve => setTimeout(() => resolve(report), 700));
  }

  async getRoles(): Promise<Role[]> {
      console.log("MOCK API: Fetching roles...");
      return new Promise(resolve => setTimeout(() => resolve([...mockRoles]), 200));
  }

  async uploadFile(file: File): Promise<string> {
    console.log(`MOCK API: Uploading file ${file.name}...`);
    // Simulate file upload and return a mock URL
    return new Promise(resolve => setTimeout(() => resolve(`https://mock-cdn.com/uploads/${Date.now()}-${file.name}`), 500));
  }

  // These methods are not part of IInventoryRepository but are used internally by App.tsx
  // They will be removed from the exported class, but their data will remain.
  public fetchCategories(): Promise<Category[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockCategories]), 200));
  }

  public fetchLocations(): Promise<Location[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockLocations]), 200));
  }

  public fetchNomenclatures(): Promise<Nomenclature[]> {
      return new Promise(resolve => setTimeout(() => resolve([...mockNomenclatures]), 200));
  }
}

export const mockApiRepository = new MockApiRepository();