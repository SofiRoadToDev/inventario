import React, { useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Asset, Agent, Location, Category } from '../types';
import { Card, Spinner, Button } from './ui';


interface AssetsByAgentReportProps {
  assets: Asset[];
  agents: Agent[];
  locations: Location[];
  categories: Category[];
  loading: boolean;
}

const AssetsByAgentReport: React.FC<AssetsByAgentReportProps> = ({ assets, agents, locations, categories, loading }) => {
  const assetsGroupedByAgent = useMemo(() => {
    const grouped: { [key: string]: Asset[] } = {};
    assets.forEach(asset => {
      const agentId = asset.agenteId || 'unassigned'; // Group unassigned assets
      if (!grouped[agentId]) {
        grouped[agentId] = [];
      }
      grouped[agentId].push(asset);
    });
    return grouped;
  }, [assets]);

  const getAgentName = (agentId: string) => {
    if (agentId === 'unassigned') return 'Sin Agente Asignado';
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.nombre} ${agent.apellido}` : 'Agente Desconocido';
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Ubicación Desconocida';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoría Desconocida';
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Bienes por Agente", 14, 16);

    Object.keys(assetsGroupedByAgent).forEach(agentId => {
      const agentName = getAgentName(agentId);
      const agentAssets = assetsGroupedByAgent[agentId];
      
      doc.autoTable({
        head: [['ID', 'Nombre', 'Categoría', 'Ubicación', 'Estado']],
        body: agentAssets.map(asset => [
          asset.id,
          asset.name,
          getCategoryName(asset.categoryId),
          getLocationName(asset.locationId),
          asset.currentStatus
        ]),
        startY: (doc as any).lastAutoTable.finalY + 10,
        didDrawPage: (data) => {
          doc.text(agentName, data.settings.margin.left, 15);
        }
      });
    });

    doc.save("reporte-bienes-por-agente.pdf");
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reporte: Bienes por Agente</h1>
        <Button onClick={generatePdf} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Descargar PDF
        </Button>
      </div>

      {loading ? <Spinner /> : (
        Object.keys(assetsGroupedByAgent).length === 0 ? (
          <Card><p className="text-center text-gray-500 dark:text-gray-400">No hay bienes registrados o asignados a agentes.</p></Card>
        ) : (
          Object.keys(assetsGroupedByAgent).sort((a, b) => getAgentName(a).localeCompare(getAgentName(b))).map(agentId => (
            <Card key={agentId} className="mb-6">
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4">{getAgentName(agentId)} ({assetsGroupedByAgent[agentId].length} bienes)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Categoría</th>
                      <th className="px-6 py-3">Ubicación</th>
                      <th className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsGroupedByAgent[agentId].map(asset => (
                      <tr key={asset.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-6 py-4 font-mono text-xs">{asset.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{asset.name}</td>
                        <td className="px-6 py-4">{getCategoryName(asset.categoryId)}</td>
                        <td className="px-6 py-4">{getLocationName(asset.locationId)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${asset.currentStatus === 'Muy Bueno' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {asset.currentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )
      )}
    </div>
  );
};

export default AssetsByAgentReport;