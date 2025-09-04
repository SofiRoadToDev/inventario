import React, { useState, useMemo } from 'react';
import { Agent } from '../types';
import { Button, Card, Input, Modal, Spinner } from './ui';
import { PlusIcon, EditIcon, SearchIcon, TrashIcon } from './Icons';
import repository from '../services/repositoryFactory';
import { useToast } from '../contexts/ToastContext';

interface AgentsPageProps {
  agents: Agent[];
  loading: boolean;
  onAgentAdded: (agent: Agent) => void;
  onAgentUpdated: (agent: Agent) => void;
  onAgentDeleted: (agentId: string) => void;
}

const AgentForm: React.FC<{
    agent?: Agent | null;
    onClose: () => void;
    onSave: (agent: Agent) => void;
}> = ({ agent, onClose, onSave }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        apellido: agent?.apellido || '',
        nombre: agent?.nombre || '',
        dni: agent?.dni || '',
        rol: agent?.rol || 'agente',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (agent) {
                const updatedAgent = await repository.updateAgent(agent.id, formData);
                onSave(updatedAgent);
                showToast('Agente actualizado exitosamente', 'success');
            } else {
                const newAgent = await repository.createAgent(formData);
                onSave(newAgent);
                showToast('Agente creado exitosamente', 'success');
            }
        } catch (error: any) {
            console.error('Error saving agent:', error);
            showToast(`Error al guardar agente: ${error.message || error}`, 'error');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Apellido" id="apellido" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} required />
            <Input label="Nombre" id="nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <Input label="DNI" id="dni" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} required />
            <Input label="Rol" id="rol" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} required />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
            </div>
        </form>
    );
};

const AgentsPage: React.FC<AgentsPageProps> = ({ agents, loading, onAgentAdded, onAgentUpdated, onAgentDeleted }) => {
  const { showToast } = useToast();
  const [modalState, setModalState] = useState<{ type: null | 'edit' | 'add' | 'delete'; agent: Agent | null }>({ type: null, agent: null });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const searchMatch = agent.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.dni.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [agents, searchTerm]);

  const handleSave = (savedAgent: Agent) => {
      if(modalState.type === 'edit') {
        onAgentUpdated(savedAgent);
      } else {
        onAgentAdded(savedAgent);
      }
      closeModal();
  };

  const handleDelete = async () => {
    if (modalState.type === 'delete' && modalState.agent) {
        try {
            await repository.deleteAgent(modalState.agent.id);
            onAgentDeleted(modalState.agent.id);
            showToast('Agente eliminado exitosamente', 'success');
            closeModal();
        } catch (error: any) {
            console.error('Error deleting agent:', error);
            showToast(`Error al eliminar agente: ${error.message || error}`, 'error');
        }
    }
  };

  const openModal = (type: 'edit' | 'add' | 'delete', agent: Agent | null = null) => {
    setModalState({ type, agent });
  };
  
  const closeModal = () => {
    setModalState({ type: null, agent: null });
  };

  const modalTitle = {
      edit: `Editar Agente: ${modalState.agent?.nombre} ${modalState.agent?.apellido}`,
      add: 'Registrar Nuevo Agente',
      delete: 'Confirmar Eliminación'
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Agentes</h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative md:col-span-2 lg:col-span-1">
                <Input 
                    id="search"
                    placeholder="Buscar por nombre, apellido, DNI..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
             <Button onClick={() => openModal('add')}><PlusIcon className="h-4 w-4"/> Registrar Agente</Button>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Apellido</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">DNI</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgents.map(agent => (
                            <tr key={agent.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{agent.apellido}</td>
                                <td className="px-6 py-4">{agent.nombre}</td>
                                <td className="px-6 py-4">{agent.dni}</td>
                                <td className="px-6 py-4">{agent.rol}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <button onClick={() => openModal('edit', agent)} className="p-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => openModal('delete', agent)} className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
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
        size={'md'}
      >
        {(modalState.type === 'add' || modalState.type === 'edit') && <AgentForm agent={modalState.agent} onClose={closeModal} onSave={handleSave} />}
        {modalState.type === 'delete' && (
            <div className="space-y-4">
                <p>¿Estás seguro de que quieres eliminar al agente <strong>{modalState.agent?.nombre} {modalState.agent?.apellido}</strong>? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                    <Button type="button" variant="danger" onClick={handleDelete}>Eliminar</Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentsPage;
