import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Asset, Category, Location, AssetStatus, Nomenclature, Agent } from '../types';
import { Button, Card, Input, Select, Modal, Spinner, Textarea } from './ui';
import { PlusIcon, EditIcon, QRIcon, ViewIcon, SearchIcon, XIcon, CameraIcon, UploadIcon } from './Icons';
import repository from '../services/repositoryFactory';
import { useToast } from '../contexts/ToastContext';

interface AssetsPageProps {
  assets: Asset[];
  locations: Location[];
  categories: Category[];
  nomenclatures: Nomenclature[];
  agents: Agent[]; // Nuevo prop para la lista de agentes
  loading: boolean;
  onAssetAdded: (asset: Asset | Asset[]) => void;
  onAssetUpdated: (asset: Asset) => void;
}

const statusColors: { [key in AssetStatus]: string } = {
    [AssetStatus.MUY_BUENO]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [AssetStatus.BUENO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [AssetStatus.REGULAR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [AssetStatus.MALO]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [AssetStatus.PENDIENTE_BAJA]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    [AssetStatus.DADO_DE_BAJA]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const AssetDetailView: React.FC<{ asset: Asset; locations: Location[]; categories: Category[]; agents: Agent[] }> = ({ asset, locations, categories, agents }) => {
    const qrCodeValue = asset.id;
    const printRef = React.useRef<HTMLDivElement>(null);
    const assignedAgent = agents.find(a => a.id === asset.agenteId);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const printableArea = printContent.innerHTML;
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printableArea;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        }
    };

    return (
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {asset.images.map((img, index) => <img key={index} src={img} alt={`${asset.name} ${index+1}`} className="rounded-lg object-cover w-full h-40"/>)}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><strong className="text-gray-900 dark:text-gray-100">ID:</strong> {asset.id}</div>
                <div><strong className="text-gray-900 dark:text-gray-100">Código Nomenclador:</strong> {asset.nomenclatureCode}</div>
                <div><strong className="text-gray-900 dark:text-gray-100">Categoría:</strong> {categories.find(c => c.id === asset.categoryId)?.name}</div>
                <div><strong className="text-gray-900 dark:text-gray-100">Ubicación:</strong> {locations.find(l => l.id === asset.locationId)?.name}</div>
                {assignedAgent && <div><strong className="text-gray-900 dark:text-gray-100">Agente Responsable:</strong> {assignedAgent.nombre} {assignedAgent.apellido}</div>}
                <div><strong className="text-gray-900 dark:text-gray-100">Fecha de Compra:</strong> {asset.purchaseDate}</div>
                <div><strong className="text-gray-900 dark:text-gray-100">Precio de Compra:</strong> ${asset.purchasePrice.toLocaleString()}</div>
                <div><strong className="text-gray-900 dark:text-gray-100">Valor Actual:</strong> ${asset.currentValue.toLocaleString()}</div>
                <div className="flex items-center gap-2"><strong className="text-gray-900 dark:text-gray-100">Estado Actual:</strong> 
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[asset.currentStatus]}`}>
                        {asset.currentStatus}
                    </span>
                </div>
            </div>
            
            <div className="pt-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Código QR</h4>
                <div className="flex items-center gap-6 p-4 border dark:border-gray-700 rounded-lg" ref={printRef}>
                    <div className="p-2 bg-white rounded-md">
                        <QRCodeSVG value={qrCodeValue} size={128} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg dark:text-gray-100">{asset.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{qrCodeValue}</p>
                    </div>
                </div>
                 <Button onClick={handlePrint} className="mt-4">Imprimir QR</Button>
            </div>

            <div>
                <h4 className="font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">Historial de Trazabilidad</h4>
                <div className="overflow-x-auto max-h-60 border dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr className="text-left text-gray-600 dark:text-gray-300">
                                <th className="p-2 font-semibold">Año</th>
                                <th className="p-2 font-semibold">Fecha</th>
                                <th className="p-2 font-semibold">Estado</th>
                                <th className="p-2 font-semibold">Valor</th>
                                <th className="p-2 font-semibold">Ubicación</th>
                                <th className="p-2 font-semibold">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {asset.history.map((h, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-2">{h.year}</td>
                                    <td className="p-2">{h.date}</td>
                                    <td className="p-2">{h.status}</td>
                                    <td className="p-2">${h.value.toLocaleString()}</td>
                                    <td className="p-2">{locations.find(l => l.id === h.locationId)?.name}</td>
                                    <td className="p-2">{h.user}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


const AssetForm: React.FC<{
    asset?: Asset | null;
    onClose: () => void;
    onSave: (asset: Asset) => void;
    locations: Location[];
    categories: Category[];
    nomenclatures: Nomenclature[];
    agents: Agent[]; // Nuevo prop
}> = ({ asset, onClose, onSave, locations, categories, nomenclatures, agents }) => {
    const [formData, setFormData] = useState({
        name: asset?.name || '',
        description: asset?.description || '',
        serialNumber: asset?.serialNumber || '',
        nomenclatureCode: asset?.nomenclatureCode || '',
        categoryId: asset?.categoryId || '',
        locationId: asset?.locationId || '',
        agenteId: asset?.agenteId || '', // Nuevo campo
        purchasePrice: asset?.purchasePrice || 0,
        purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
        currentStatus: asset?.currentStatus || AssetStatus.BUENO,
        currentValue: asset?.currentValue || 0,
        images: asset?.images || [], // Inicializar como array vacío
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(asset?.images[0] || null);

    const handleNomenclatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedNomenclature = nomenclatures.find(n => n.code === e.target.value);
        setFormData(prev => ({
            ...prev,
            nomenclatureCode: selectedNomenclature?.code || '',
            name: selectedNomenclature?.name || prev.name
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const { showToast } = useToast();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for image upload logic
        let imageUrl = formData.images.length > 0 ? formData.images[0] : null;
        if (selectedFile) {
            try {
                imageUrl = await repository.uploadFile(selectedFile);
                showToast('Imagen subida exitosamente', 'success');
            } catch (uploadError: any) {
                console.error('Error uploading image:', uploadError);
                showToast(`Error al subir imagen: ${uploadError.message || uploadError}`, 'error');
                return; // Stop form submission if image upload fails
            }
        }

        const assetData = { 
            ...formData, 
            purchasePrice: Number(formData.purchasePrice),
            currentValue: Number(formData.purchasePrice), // Asumimos que el valor actual es el de compra al crear/editar
            images: imageUrl ? [imageUrl] : [], // Save the mock URL
        };

        try {
            if (asset) {
                const updatedAsset = await repository.updateAsset(asset.id, assetData);
                onSave(updatedAsset);
                showToast('Activo actualizado exitosamente', 'success');
            } else {
                const newAsset = await repository.createAsset(assetData);
                onSave(newAsset);
                showToast('Activo creado exitosamente', 'success');
            }
        } catch (error: any) {
            console.error('Error saving asset:', error);
            showToast(`Error al guardar activo: ${error.message || error}`, 'error');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <Select label="Código Nomenclador (Autocompleta Nombre)" id="nomenclatureCode" value={formData.nomenclatureCode} onChange={handleNomenclatureChange} required>
                <option value="">Seleccione un nomenclador</option>
                {nomenclatures.map(n => <option key={n.code} value={n.code}>{n.code} - {n.name}</option>)}
            </Select>
            <Input label="Nombre del Bien" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required readOnly={!!formData.nomenclatureCode} className={formData.nomenclatureCode ? 'bg-gray-100 dark:bg-gray-600' : ''}/>
            <Textarea label="Descripción" id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Input label="Número de Serie" id="serialNumber" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Categoría" id="categoryId" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                    <option value="">Seleccione categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                 <Select label="Ubicación Inicial" id="locationId" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} required>
                    <option value="">Seleccione ubicación</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
                <Select label="Agente Responsable" id="agenteId" value={formData.agenteId} onChange={e => setFormData({...formData, agenteId: e.target.value})}>
                    <option value="">Seleccione un agente</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                </Select>
                <Input label="Precio de Compra" id="purchasePrice" type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} required />
                <Input label="Fecha de Compra" id="purchaseDate" type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} required />
                <Select label="Estado Inicial" id="currentStatus" value={formData.currentStatus} onChange={e => setFormData({...formData, currentStatus: e.target.value as AssetStatus})} required>
                    {Object.values(AssetStatus).filter(s => ![AssetStatus.PENDIENTE_BAJA, AssetStatus.DADO_DE_BAJA].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
             </div>

             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen del Bien</label>
                {imagePreview && (
                    <div className="mt-2">
                        <img src={imagePreview} alt="Vista previa" className="max-w-xs h-auto rounded-md shadow-md" />
                    </div>
                )}
                <div className="flex gap-2">
                    <label htmlFor="file-upload" className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 cursor-pointer">
                        <UploadIcon className="h-5 w-5 mr-2" /> Subir Imagen
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                    </label>
                    <label htmlFor="camera-capture" className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 cursor-pointer">
                        <CameraIcon className="h-5 w-5 mr-2" /> Tomar Foto
                        <input id="camera-capture" type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="sr-only" />
                    </label>
                </div>
            </div>

             <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                 <Button type="submit" variant="primary">Guardar</Button>
             </div>
        </form>
    );
};

const BatchAddForm: React.FC<{
    onClose: () => void;
    onSave: (assets: Asset[]) => void;
    locations: Location[];
    categories: Category[];
    nomenclatures: Nomenclature[];
    agents: Agent[]; // Nuevo prop
}> = ({ onClose, onSave, locations, categories, nomenclatures, agents }) => {
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serialNumber: '',
        nomenclatureCode: '',
        categoryId: '',
        locationId: '',
        agenteId: '', // Nuevo campo
        purchasePrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        currentStatus: AssetStatus.MUY_BUENO,
        currentValue: 0,
    });

    const handleNomenclatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedNomenclature = nomenclatures.find(n => n.code === e.target.value);
        setFormData(prev => ({
            ...prev,
            nomenclatureCode: selectedNomenclature?.code || '',
            name: selectedNomenclature?.name || prev.name
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const assetData = { ...formData, purchasePrice: Number(formData.purchasePrice), currentValue: Number(formData.purchasePrice) };
        try {
            const newAssets = await Promise.all(Array.from({ length: quantity }).map(() => repository.createAsset(assetData)));
            onSave(newAssets);
            showToast(`Se crearon ${quantity} bienes exitosamente`, 'success');
        } catch (error: any) {
            console.error('Error creating batch assets:', error);
            showToast(`Error al crear bienes en lote: ${error.message || error}`, 'error');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Define los datos una vez para crear múltiples bienes idénticos con IDs y QRs únicos.</p>
             <Input label="Cantidad a Crear" type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} min="1" required />
             <Select label="Código Nomenclador (Autocompleta Nombre)" id="nomenclatureCode" value={formData.nomenclatureCode} onChange={handleNomenclatureChange} required>
                <option value="">Seleccione un nomenclador</option>
                {nomenclatures.map(n => <option key={n.code} value={n.code}>{n.code} - {n.name}</option>)}
            </Select>
            <Input label="Nombre del Bien" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required readOnly={!!formData.nomenclatureCode} className={formData.nomenclatureCode ? 'bg-gray-100 dark:bg-gray-600' : ''}/>
            <Textarea label="Descripción" id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Input label="Número de Serie (se generará para cada activo)" id="serialNumber" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Categoría" id="categoryId" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                    <option value="">Seleccione categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                 <Select label="Ubicación" id="locationId" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} required>
                    <option value="">Seleccione ubicación</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
                <Select label="Agente Responsable" id="agenteId" value={formData.agenteId} onChange={e => setFormData({...formData, agenteId: e.target.value})}>
                    <option value="">Seleccione un agente</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                </Select>
                <Input label="Precio de Compra (Unitario)" id="purchasePrice" type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} required />
                <Input label="Fecha de Compra" id="purchaseDate" type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} required />
             </div>
             <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                 <Button type="submit" variant="primary">Crear {quantity} Bienes</Button>
             </div>
        </form>
    );
};


const AssetsPage: React.FC<AssetsPageProps> = ({ assets, locations, categories, nomenclatures, agents, loading, onAssetAdded, onAssetUpdated }) => {
  const [modalState, setModalState] = useState<{ type: null | 'detail' | 'edit' | 'add' | 'batchAdd'; asset: Asset | null }>({ type: null, asset: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', location: '', category: '' });

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const searchMatch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.id.toLowerCase().includes(searchTerm.toLowerCase()) || asset.nomenclatureCode.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.status ? asset.currentStatus === filters.status : true;
      const locationMatch = filters.location ? asset.locationId === filters.location : true;
      const categoryMatch = filters.category ? asset.categoryId === filters.category : true;
      return searchMatch && statusMatch && locationMatch && categoryMatch;
    });
  }, [assets, searchTerm, filters]);

  const handleSave = (savedAsset: Asset) => {
      if(modalState.type === 'edit') {
        onAssetUpdated(savedAsset);
      } else {
        onAssetAdded(savedAsset);
      }
      closeModal();
  };

  const handleBatchSave = (savedAssets: Asset[]) => {
      onAssetAdded(savedAssets);
      closeModal();
  }

  const openModal = (type: 'detail' | 'edit' | 'add' | 'batchAdd', asset: Asset | null = null) => {
    setModalState({ type, asset });
  };
  
  const closeModal = () => {
    setModalState({ type: null, asset: null });
  };

  const modalTitle = {
      detail: `Detalle del Bien: ${modalState.asset?.name}`,
      edit: `Editar Bien: ${modalState.asset?.name}`,
      add: 'Registrar Nuevo Bien',
      batchAdd: 'Alta en Lote de Bienes',
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Bienes</h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative md:col-span-2 lg:col-span-1">
                <Input 
                    id="search"
                    placeholder="Buscar por nombre, ID, código..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>
            <Select id="filter-status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} label="Filtrar por Estado">
                <option value="">Todos los Estados</option>
                {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select id="filter-location" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} label="Filtrar por Ubicación">
                <option value="">Todas las Ubicaciones</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
            <Select id="filter-category" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} label="Filtrar por Categoría">
                <option value="">Todas las Categorías</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
             <Button onClick={() => openModal('batchAdd')} variant="secondary"><PlusIcon className="h-4 w-4"/> Alta en Lote</Button>
             <Button onClick={() => openModal('add')}><PlusIcon className="h-4 w-4"/> Registrar Bien</Button>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Ubicación</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-mono text-xs">{asset.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{asset.name}</td>
                                <td className="px-6 py-4">{categories.find(c => c.id === asset.categoryId)?.name}</td>
                                <td className="px-6 py-4">{locations.find(l => l.id === asset.locationId)?.name}</td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[asset.currentStatus]}`}>
                                    {asset.currentStatus}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <button onClick={() => openModal('detail', asset)} className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"><ViewIcon className="h-5 w-5" /></button>
                                        <button onClick={() => openModal('edit', asset)} className="p-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400"><EditIcon className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </Card>

      <Modal 
        isOpen={modalState.type !== null} 
        onClose={closeModal} 
        title={modalState.type ? modalTitle[modalState.type] : ''}
        size={modalState.type === 'detail' || modalState.type === 'edit' || modalState.type === 'add' || modalState.type === 'batchAdd' ? 'xl' : 'sm'}
      >
        {modalState.type === 'detail' && modalState.asset && <AssetDetailView asset={modalState.asset} locations={locations} categories={categories} agents={agents} />}
        {(modalState.type === 'add' || modalState.type === 'edit') && <AssetForm asset={modalState.asset} onClose={closeModal} onSave={handleSave} locations={locations} categories={categories} nomenclatures={nomenclatures} agents={agents} />}
        {modalState.type === 'batchAdd' && <BatchAddForm onClose={closeModal} onSave={handleBatchSave} locations={locations} categories={categories} nomenclatures={nomenclatures} agents={agents} />}
      </Modal>
    </div>
  );
};

export default AssetsPage;