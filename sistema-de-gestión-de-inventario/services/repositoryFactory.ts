
import { IInventoryRepository } from "./IInventoryRepository";
import { NodeApiRepository } from "./NodeApiRepository";
import { mockApiRepository } from "./mockApi";

const apiSource = import.meta.env.VITE_API_SOURCE;

let repository: IInventoryRepository;

if (apiSource === "NODE_API") {
  repository = new NodeApiRepository();
} else {
  // Por defecto, o si VITE_API_SOURCE es 'MOCK' o no está definida
  repository = mockApiRepository;
}

export default repository;
