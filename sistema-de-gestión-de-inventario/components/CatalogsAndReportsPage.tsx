import React, { useEffect, useState } from 'react';
import { Asset, Category, Location, Nomenclature, Role } from '../types';
import { Button, Card, Input, Select, Spinner, Modal } from './ui';
import { DownloadIcon, EditIcon, TrashIcon, PlusIcon } from './Icons';
import repository from '../services/repositoryFactory';
import { useToast } from '../contexts/ToastContext';
import { handleExportCSV, handleExportPDF } from '@/utils/exportUtils';

interface CatalogsAndReportsPageProps {
  assets: Asset[];
  locations: Location[];
  categories: Category[];
  nomenclatures: Nomenclature[];
  roles: Role[];
  onCatalogUpdate: (type: 'locations' | 'categories' | 'nomenclatures' | 'roles', data: any) => void;
}




const CatalogsAndReportsPage: React.FC<CatalogsAndReportsPageProps> = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [modalState, setModalState] = useState<{ type: null | 'add' | 'edit'; catalog: 'locations' | 'categories' | 'nomenclatures' | 'roles' | null; item: any | null }>({ type: null, catalog: null, item: null });
  const [newItemValue, setNewItemValue] = useState('');
  const [newNomenclature, setNewNomenclature] = useState({ code: '', name: '' });
  const { showToast } = useToast();
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  //DATOS DE API
  const [locations, setLocations] = useState<Location[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [nomenclatures, setNomenclatures] = useState<Nomenclature[]>([]);
    const [roles, setRoles] = useState<Role[]>([]); // Aquí declaras el estado para roles
    const [newItemName, setNewItemName] = useState('');
    const [activeCatalog, setActiveCatalog] = useState<string>('locations');


   useEffect(() => {
        const fetchData = async () => {
            try {
                // Asegúrate de que 'repository' esté definido y disponible en este scope.
                // Usamos Promise.all para ejecutar todas las peticiones en paralelo.
                const [
                    locationsData,
                    categoriesData,
                    nomenclaturesData,
                    rolesData
                ] = await Promise.all([
                    repository.getLocations(),
                    repository.getCategories(),
                    repository.getNomenclatures(),
                    repository.getRoles(),
                ]);

                // Actualizamos los estados con los datos recibidos.
                setLocations(locationsData);
                setCategories(categoriesData);
                setNomenclatures(nomenclaturesData);
                setRoles(rolesData); // Corregido: Se eliminó el punto y la lógica es correcta ahora.

            } catch (error) {
                console.error("Error fetching data:", error);
                //toast.error('Error al cargar los catálogos.');
            } finally {
                setCatalogsLoading(false);
            }
        };

        fetchData();
    }, []);


  

  const openModal = (type: 'add' | 'edit', catalog: 'locations' | 'categories' | 'nomenclatures' | 'roles', item: any = null) => {
    setModalState({ type, catalog, item });
    if (catalog === 'nomenclatures') {
      setNewNomenclature(item ? { code: item.code, name: item.name } : { code: '', name: '' });
    } else {
      setNewItemValue(item ? item.name : '');
    }
  };

  const closeModal = () => {
    setModalState({ type: null, catalog: null, item: null });
    setNewItemValue('');
    setNewNomenclature({ code: '', name: '' });
  };

  const handleSave = async () => {
    if (!modalState.catalog || !modalState.type) return;

    const { catalog, type, item } = modalState;

    try {
        if (type === 'add') {
            let newItem;
            if (catalog === 'locations') {
                if (!newItemValue.trim()) return;
                newItem = await repository.createLocation(newItemValue);
                setLocations([...locations, newItem]);
            } else if (catalog === 'categories') {
                if (!newItemValue.trim()) return;
                newItem = await repository.createCategory(newItemValue);
                setCategories([...categories, newItem]);
            } else if (catalog === 'nomenclatures') {
                if (!newNomenclature.code.trim() || !newNomenclature.name) return;
                newItem = await repository.createNomenclature(newNomenclature);
                setNomenclatures([...nomenclatures, newItem]);
            } else if (catalog === 'roles') {
                if (!newItemValue.trim()) return;
                newItem = await repository.createRole(newItemValue);
                setRoles([...roles, newItem]);
            }
            showToast('Elemento creado exitosamente', 'success');
        } else if (type === 'edit' && item) {
            let updatedItem: any;
            if (catalog === 'locations') {
                updatedItem = await repository.updateLocation(item.id, newItemValue);
                setLocations(locations.map(i => i.id === item.id ? updatedItem : i));
            } else if (catalog === 'categories') {
                updatedItem = await repository.updateCategory(item.id, newItemValue);
                setCategories(categories.map(i => i.id === item.id ? updatedItem : i));
            } else if (catalog === 'nomenclatures') {
                updatedItem = await repository.updateNomenclature(item.id, { code: newNomenclature.code.trim(), name: newNomenclature.name.trim() });
                setNomenclatures(nomenclatures.map(i => i.id === item.id ? updatedItem : i));
            } else if (catalog === 'roles') {
                updatedItem = await repository.updateRole(item.id, newItemValue);
                setRoles(roles.map(i => i.id === item.id ? updatedItem : i));
            }
            showToast('Elemento actualizado exitosamente', 'success');
        }
        closeModal();
    } catch (error: any) {
        console.error(`Error saving ${catalog}:`, error);
        showToast(`Error al guardar: ${error.message || error}`, 'error');
    }
  };

  const handleDelete = async (catalog: 'locations' | 'categories' | 'nomenclatures' | 'roles', itemToDelete: any) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.')) {
        try {
            const idToDelete = itemToDelete.id;
            if (catalog === 'locations') {
                await repository.deleteLocation(idToDelete);
                setLocations(locations.filter(i => i.id !== idToDelete));
            } else if (catalog === 'categories') {
                await repository.deleteCategory(idToDelete);
                setCategories(categories.filter(i => i.id !== idToDelete));
            } else if (catalog === 'nomenclatures') {
                await repository.deleteNomenclature(idToDelete);
                setNomenclatures(nomenclatures.filter(i => i.id !== idToDelete));
            } else if (catalog === 'roles') {
                await repository.deleteRole(idToDelete);
                setRoles(roles.filter(i => i.id !== idToDelete));
            }
            showToast('Elemento eliminado exitosamente', 'success');
        } catch (error: any) {
            console.error(`Error deleting ${catalog}:`, error);
            showToast(`Error al eliminar: ${error.message || error}`, 'error');
        }
    }
  };

  const catalogData = {
      locations,
      categories,
      nomenclatures,
      roles
  };

  
  const availableYears = [...new Set(assets.flatMap(a  => a.history.map(h => h.year)))].sort((a, b) => b - a);

  const getModalTitle = () => {
    if (!modalState.catalog) return '';
    const action = modalState.type === 'add' ? 'Agregar' : 'Editar';
    const catalogName = {
      locations: 'Ubicación',
      categories: 'Categoría',
      nomenclatures: 'Nomenclador',
      roles: 'Rol'
    }[modalState.catalog];
    return `${action} ${catalogName}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Catálogos y Reportes</h1>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('reports')} className={`${activeTab === 'reports' ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Generador de Reportes
          </button>
          <button onClick={() => setActiveTab('catalogs')} className={`${activeTab === 'catalogs' ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Gestión de Catálogos
          </button>
        </nav>
      </div>

      {loading ? <Spinner /> : (
        <>
        {activeTab === 'reports' && (
            <Card>
                <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Exportar Planilla de Presentación Anual</h2>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Select label="Seleccionar Año de Ejercicio" id="report-year" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </Select>
                    <div className="flex w-full md:w-auto md:pt-6 gap-2">
                      <Button onClick={handleExportCSV} variant="secondary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a CSV</Button>
                      <Button onClick={handleExportPDF} variant="primary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a PDF</Button>
                    </div>
                </div>
            </Card>
        )}

        {activeTab === 'catalogs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold dark:text-gray-100">Ubicaciones Físicas</h2>
                        <Button size="sm" onClick={() => openModal('add', 'locations')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                    </div>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {locations.map(loc => (
                            <li key={loc.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                <span>{loc.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('edit', 'locations', loc)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete('locations', loc)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold dark:text-gray-100">Categorías de Bienes</h2>
                        <Button size="sm" onClick={() => openModal('add', 'categories')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                    </div>
                     <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {categories.map(cat => (
                            <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                <span>{cat.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('edit', 'categories', cat)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete('categories', cat)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold dark:text-gray-100">Nomenclador</h2>
                        <Button size="sm" onClick={() => openModal('add', 'nomenclatures')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                    </div>
                     <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {nomenclatures.map(nom => (
                            <li key={nom.code} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                                <div>
                                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{nom.code}</span>
                                    <span className="ml-2">&rarr; {nom.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('edit', 'nomenclatures', nom)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete('nomenclatures', nom)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button className="mt-4 w-full" variant="secondary">Importar Excel</Button>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold dark:text-gray-100">Roles de Agente</h2>
                        <Button size="sm" onClick={() => openModal('add', 'roles')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                    </div>
                     <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {roles.map(role => (
                            <li key={role.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                <span>{role.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('edit', 'roles', role)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete('roles', role)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        )}
        </>
      )}

      <Modal 
        isOpen={modalState.type !== null}
        onClose={closeModal}
        title={getModalTitle()}
      >
        <div className="space-y-4">
            {modalState.catalog === 'nomenclatures' ? (
              <>
                <Input 
                    id="nomenclatureCode"
                    value={newNomenclature.code}
                    onChange={e => setNewNomenclature({ ...newNomenclature, code: e.target.value })}
                    placeholder="Código"
                    disabled={modalState.type === 'edit'}
                />
                <Input 
                    id="nomenclatureName"
                    value={newNomenclature.name}
                    onChange={e => setNewNomenclature({ ...newNomenclature, name: e.target.value })}
                    placeholder="Nombre del bien"
                />
              </>
            ) : (
              <Input 
                  id="newItem"
                  value={newItemValue}
                  onChange={e => setNewItemValue(e.target.value)}
                  placeholder={`Nombre de la ${modalState.catalog === 'locations' ? 'ubicación' : modalState.catalog === 'categories' ? 'categoría' : 'rol'}`}
              />
            )}
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default CatalogsAndReportsPage;


const handleExportCSV = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  exportToCSV(assets, categories, locations, selectedYear);
};

const handleExportPDF = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  exportToPDF(assets, categories, locations, selectedYear);
};

const handleSave = async () => {
  if (!modalState.catalog || !modalState.type) return;

  const { catalog, type, item } = modalState;

  try {
      if (type === 'add') {
          let newItem;
          if (catalog === 'locations') {
              if (!newItemValue.trim()) return;
              newItem = await repository.createLocation(newItemValue);
              setLocations([...locations, newItem]);
          } else if (catalog === 'categories') {
              if (!newItemValue.trim()) return;
              newItem = await repository.createCategory(newItemValue);
              setCategories([...categories, newItem]);
          } else if (catalog === 'nomenclatures') {
              if (!newNomenclature.code.trim() || !newNomenclature.name) return;
              newItem = await repository.createNomenclature(newNomenclature);
              setNomenclatures([...nomenclatures, newItem]);
          } else if (catalog === 'roles') {
              if (!newItemValue.trim()) return;
              newItem = await repository.createRole(newItemValue);
              setRoles([...roles, newItem]);
          }
          showToast('Elemento creado exitosamente', 'success');
      } else if (type === 'edit' && item) {
          let updatedItem: any;
          if (catalog === 'locations') {
              updatedItem = await repository.updateLocation(item.id, newItemValue);
              setLocations(locations.map(i => i.id === item.id ? updatedItem : i));
          } else if (catalog === 'categories') {
              updatedItem = await repository.updateCategory(item.id, newItemValue);
              setCategories(categories.map(i => i.id === item.id ? updatedItem : i));
          } else if (catalog === 'nomenclatures') {
              updatedItem = await repository.updateNomenclature(item.id, { code: newNomenclature.code.trim(), name: newNomenclature.name.trim() });
              setNomenclatures(nomenclatures.map(i => i.id === item.id ? updatedItem : i));
          } else if (catalog === 'roles') {
              updatedItem = await repository.updateRole(item.id, newItemValue);
              setRoles(roles.map(i => i.id === item.id ? updatedItem : i));
          }
          showToast('Elemento actualizado exitosamente', 'success');
      }
      closeModal();
  } catch (error: any) {
      console.error(`Error saving ${catalog}:`, error);
      showToast(`Error al guardar: ${error.message || error}`, 'error');
  }
};

const handleDelete = async (catalog: 'locations' | 'categories' | 'nomenclatures' | 'roles', itemToDelete: any) => {
  if (window.confirm('¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.')) {
      try {
          const idToDelete = itemToDelete.id;
          if (catalog === 'locations') {
              await repository.deleteLocation(idToDelete);
              setLocations(locations.filter(i => i.id !== idToDelete));
          } else if (catalog === 'categories') {
              await repository.deleteCategory(idToDelete);
              setCategories(categories.filter(i => i.id !== idToDelete));
          } else if (catalog === 'nomenclatures') {
              await repository.deleteNomenclature(idToDelete);
              setNomenclatures(nomenclatures.filter(i => i.id !== idToDelete));
          } else if (catalog === 'roles') {
              await repository.deleteRole(idToDelete);
              setRoles(roles.filter(i => i.id !== idToDelete));
          }
          showToast('Elemento eliminado exitosamente', 'success');
      } catch (error: any) {
          console.error(`Error deleting ${catalog}:`, error);
          showToast(`Error al eliminar: ${error.message || error}`, 'error');
      }
  }
};

const catalogData = {
    locations,
    categories,
    nomenclatures,
    roles
};


const availableYears = [...new Set(assets.flatMap(a  => a.history.map(h => h.year)))].sort((a, b) => b - a);

const getModalTitle = () => {
  if (!modalState.catalog) return '';
  const action = modalState.type === 'add' ? 'Agregar' : 'Editar';
  const catalogName = {
    locations: 'Ubicación',
    categories: 'Categoría',
    nomenclatures: 'Nomenclador',
    roles: 'Rol'
  }[modalState.catalog];
  return `${action} ${catalogName}`;
};

return (
  <div className="p-4 md:p-8 space-y-6">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Catálogos y Reportes</h1>

    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button onClick={() => setActiveTab('reports')} className={`${activeTab === 'reports' ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
          Generador de Reportes
        </button>
        <button onClick={() => setActiveTab('catalogs')} className={`${activeTab === 'catalogs' ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
          Gestión de Catálogos
        </button>
      </nav>
    </div>

    {loading ? <Spinner /> : (
      <>
      {activeTab === 'reports' && (
          <Card>
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Exportar Planilla de Presentación Anual</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                  <Select label="Seleccionar Año de Ejercicio" id="report-year" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                      {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </Select>
                  <div className="flex w-full md:w-auto md:pt-6 gap-2">
                    <Button onClick={handleExportCSV} variant="secondary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a CSV</Button>
                    <Button onClick={handleExportPDF} variant="primary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a PDF</Button>
                  </div>
              </div>
          </Card>
      )}

      {activeTab === 'catalogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold dark:text-gray-100">Ubicaciones Físicas</h2>
                      <Button size="sm" onClick={() => openModal('add', 'locations')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                  </div>
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {locations.map(loc => (
                          <li key={loc.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span>{loc.name}</span>
                              <div className="flex gap-2">
                                  <button onClick={() => openModal('edit', 'locations', loc)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                  <button onClick={() => handleDelete('locations', loc)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </Card>
              <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold dark:text-gray-100">Categorías de Bienes</h2>
                      <Button size="sm" onClick={() => openModal('add', 'categories')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                  </div>
                   <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {categories.map(cat => (
                          <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span>{cat.name}</span>
                              <div className="flex gap-2">
                                  <button onClick={() => openModal('edit', 'categories', cat)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                  <button onClick={() => handleDelete('categories', cat)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </Card>
               <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold dark:text-gray-100">Nomenclador</h2>
                      <Button size="sm" onClick={() => openModal('add', 'nomenclatures')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                  </div>
                   <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {nomenclatures.map(nom => (
                          <li key={nom.code} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                              <div>
                                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{nom.code}</span>
                                  <span className="ml-2">&rarr; {nom.name}</span>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => openModal('edit', 'nomenclatures', nom)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                  <button onClick={() => handleDelete('nomenclatures', nom)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
                  <Button className="mt-4 w-full" variant="secondary">Importar Excel</Button>
              </Card>
              <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold dark:text-gray-100">Roles de Agente</h2>
                      <Button size="sm" onClick={() => openModal('add', 'roles')}><PlusIcon className="h-4 w-4"/> Agregar</Button>
                  </div>
                   <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {roles.map(role => (
                          <li key={role.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span>{role.name}</span>
                              <div className="flex gap-2">
                                  <button onClick={() => openModal('edit', 'roles', role)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                  <button onClick={() => handleDelete('roles', role)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </Card>
          </div>
      )}
      </>
    )}

    <Modal 
      isOpen={modalState.type !== null}
      onClose={closeModal}
      title={getModalTitle()}
    >
      <div className="space-y-4">
          {modalState.catalog === 'nomenclatures' ? (
            <>
              <Input 
                  id="nomenclatureCode"
                  value={newNomenclature.code}
                  onChange={e => setNewNomenclature({ ...newNomenclature, code: e.target.value })}
                  placeholder="Código"
                  disabled={modalState.type === 'edit'}
              />
              <Input 
                  id="nomenclatureName"
                  value={newNomenclature.name}
                  onChange={e => setNewNomenclature({ ...newNomenclature, name: e.target.value })}
                  placeholder="Nombre del bien"
              />
            </>
          ) : (
            <Input 
                id="newItem"
                value={newItemValue}
                onChange={e => setNewItemValue(e.target.value)}
                placeholder={`Nombre de la ${modalState.catalog === 'locations' ? 'ubicación' : modalState.catalog === 'categories' ? 'categoría' : 'rol'}`}
            />
          )}
          <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
          </div>
      </div>
    </Modal>
  );
};

export default CatalogsAndReportsPage;


<Card>
    <h3 className="text-lg font-semibold mb-4">Exportar Inventario</h3>
    <div className="grid grid-cols-2 gap-4 mt-4">
        <Button onClick={handleExportCSV} variant="secondary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a CSV</Button>
        <Button onClick={handleExportPDF} variant="primary" className="w-full"><DownloadIcon className="h-4 w-4" /> Exportar a PDF</Button>
    </div>
</Card>
</TabsContent>
</div>
