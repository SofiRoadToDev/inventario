import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Asset, Location, AssetStatus } from '../types';
import { Card } from './ui';
import { Spinner } from './ui';

interface DashboardPageProps {
  assets: Asset[];
  locations: Location[];
  loading: boolean;
  theme: 'light' | 'dark';
}

const statusColors: { [key in AssetStatus]?: string } = {
    [AssetStatus.REGULAR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [AssetStatus.MALO]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const DashboardPage: React.FC<DashboardPageProps> = ({ assets, locations, loading, theme }) => {
  if (loading) {
    return <div className="p-8"><Spinner /></div>;
  }
  
  const textColor = theme === 'dark' ? '#e5e7eb' : '#374151'; // gray-200, gray-700
  const gridColor = theme === 'dark' ? '#374151' : '#d1d5db'; // gray-700, gray-300

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const attentionRequired = assets.filter(a => a.currentStatus === AssetStatus.REGULAR || a.currentStatus === AssetStatus.MALO);

  const assetsByLocation = locations.map(loc => ({
    name: loc.name,
    Bienes: assets.filter(a => a.locationId === loc.id).length,
  }));

  const historicalValueData = assets
    .flatMap(asset => asset.history.map(h => ({ year: h.year, value: h.value })))
    .reduce((acc, curr) => {
        const yearData = acc.find(item => item.year === curr.year);
        if (yearData) {
            yearData.Valor += curr.value;
        } else {
            acc.push({ year: curr.year, Valor: curr.value });
        }
        return acc;
    }, [] as { year: number; Valor: number; }[])
    .sort((a, b) => a.year - b.year);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard de Control- Inventario EET 3107 " Juana Azurduy de Padilla"</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total de Bienes</h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalAssets}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Valor Total del Inventario</h3>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">{`$${totalValue.toLocaleString('es-MX')}`}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Bienes que Requieren Atención</h3>
          <p className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">{attentionRequired.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-96">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Bienes por Ubicación</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={assetsByLocation} margin={{ top: 5, right: 20, left: -10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`}}
                cursor={{ fill: theme === 'dark' ? 'rgba(156, 163, 175, 0.1)' : 'rgba(209, 213, 219, 0.3)'}}
              />
              <Legend wrapperStyle={{ color: textColor }} />
              <Bar dataKey="Bienes" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-96">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Depreciación Histórica del Inventario</h3>
           <ResponsiveContainer width="100%" height="90%">
            <LineChart data={historicalValueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="year" tick={{ fill: textColor }}/>
              <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tick={{ fill: textColor }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`}}
                labelStyle={{ color: textColor }}
              />
              <Legend wrapperStyle={{ color: textColor }}/>
              <Line type="monotone" dataKey="Valor" stroke={theme === 'dark' ? '#34d399' : '#10b981'} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      <Card>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Lista de Bienes que Requieren Atención</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Nombre</th>
                        <th scope="col" className="px-6 py-3">Estado</th>
                        <th scope="col" className="px-6 py-3">Ubicación</th>
                    </tr>
                </thead>
                <tbody>
                    {attentionRequired.length > 0 ? attentionRequired.map(asset => (
                        <tr key={asset.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{asset.id}</td>
                            <td className="px-6 py-4">{asset.name}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[asset.currentStatus]}`}>
                                {asset.currentStatus}
                               </span>
                            </td>
                            <td className="px-6 py-4">{locations.find(l => l.id === asset.locationId)?.name || 'N/A'}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="text-center py-4">No hay bienes que requieran atención.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;