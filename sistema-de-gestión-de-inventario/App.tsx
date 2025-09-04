import React, { useState, useEffect, useCallback } from 'react';
import { Asset, Category, Location, Nomenclature, Agent } from './types';
import { DashboardIcon, AssetsIcon, MobileIcon, ReportsIcon, CatalogIcon, SunIcon, MoonIcon, UsersIcon, ReportIcon, MenuIcon, XIcon, LogoutIcon } from './components/Icons';
import DashboardPage from './components/DashboardPage';
import AssetsPage from './components/AssetsPage';
import MobileFlow from './components/MobileFlow';
import CatalogsAndReportsPage from './components/CatalogsAndReportsPage';
import AgentsPage from './components/AgentsPage';
import AssetsByAgentReport from './components/AssetsByAgentReport';
import repository from './services/repositoryFactory';
import { mockApiRepository } from './services/mockApi'; // Import mock specific methods
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import LoginPage from './components/LoginPage';

type Page = 'dashboard' | 'assets' | 'mobile' | 'catalogs_reports' | 'agents' | 'assets_by_agent_report';
type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nomenclatures, setNomenclatures] = useState<Nomenclature[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch core data from the repository
      const [assetsData, agentsData] = await Promise.all([
        repository.getAssets(),
        repository.getAgents(),
      ]);
      setAssets(assetsData);
      setAgents(agentsData);

      // Fetch additional mock data if using mock repository
      if (import.meta.env.VITE_API_SOURCE !== 'NODE_API') {
        const [locationsData, categoriesData, nomenclaturesData] = await Promise.all([
            mockApiRepository.fetchLocations(),
            mockApiRepository.fetchCategories(),
            mockApiRepository.fetchNomenclatures(),
        ]);
        setLocations(locationsData);
        setCategories(categoriesData);
        setNomenclatures(nomenclaturesData);
      }

    } catch (error: any) {
      console.error('Failed to fetch initial data:', error);
      showToast(`Error al cargar datos iniciales: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleAssetAdded = (newAssetOrAssets: Asset | Asset[]) => {
      if (Array.isArray(newAssetOrAssets)) {
          setAssets(prev => [...prev, ...newAssetOrAssets]);
      } else {
          setAssets(prev => [...prev, newAssetOrAssets]);
      }
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
      setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const handleAgentAdded = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent]);
  };

  const handleAgentUpdated = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const handleAgentDeleted = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const handleCatalogUpdate = (type: 'locations' | 'categories' | 'nomenclatures', data: any) => {
    switch (type) {
        case 'locations':
            setLocations(data);
            break;
        case 'categories':
            setCategories(data);
            break;
        case 'nomenclatures':
            setNomenclatures(data);
            break;
    }
    console.log(`Updated ${type}:`, data);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage assets={assets} locations={locations} loading={loading} theme={theme} />;
      case 'assets':
        return (
          <AssetsPage
            assets={assets}
            locations={locations}
            categories={categories}
            nomenclatures={nomenclatures}
            agents={agents}
            loading={loading}
            onAssetAdded={handleAssetAdded}
            onAssetUpdated={handleAssetUpdated}
          />
        );
      case 'mobile':
        return <MobileFlow locations={locations} onUpdateAsset={handleAssetUpdated} />;
      case 'catalogs_reports':
        return (
          <CatalogsAndReportsPage
            assets={assets}
            locations={locations}
            categories={categories}
            nomenclatures={nomenclatures}
            roles={[]}
            loading={loading}
            onCatalogUpdate={handleCatalogUpdate}
          />
        );
      case 'agents':
        return <AgentsPage agents={agents} loading={loading} onAgentAdded={handleAgentAdded} onAgentUpdated={handleAgentUpdated} onAgentDeleted={handleAgentDeleted} />;
      case 'assets_by_agent_report':
        return <AssetsByAgentReport assets={assets} agents={agents} locations={locations} categories={categories} loading={loading} />;
      default:
        return <DashboardPage assets={assets} locations={locations} loading={loading} theme={theme} />;
    }
  };

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ icon, label, isActive, onClick }) => (
    <li
      onClick={() => { onClick(); setSidebarOpen(false); }}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700/50 hover:text-blue-700 dark:hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Cargando autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="relative min-h-screen md:flex">
      {/* Botón de menú móvil */}
      <div className="bg-gray-800 text-gray-100 flex justify-between md:hidden">
        <a href="#" className="block p-4 text-white font-bold">Inventario</a>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-4 focus:outline-none focus:bg-gray-700">
          {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`z-30 bg-white dark:bg-gray-800 shadow-md flex flex-col w-64 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Inventario</h1>
        </div>
        <nav className="flex-grow p-4">
          <ul>
            <NavItem icon={<DashboardIcon className="h-6 w-6" />} label="Dashboard" isActive={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
            <NavItem icon={<AssetsIcon className="h-6 w-6" />} label="Gestión de Bienes" isActive={currentPage === 'assets'} onClick={() => setCurrentPage('assets')} />
            <NavItem icon={<UsersIcon className="h-6 w-6" />} label="Gestión de Agentes" isActive={currentPage === 'agents'} onClick={() => setCurrentPage('agents')} />
            <NavItem icon={<MobileIcon className="h-6 w-6" />} label="Flujo Móvil" isActive={currentPage === 'mobile'} onClick={() => setCurrentPage('mobile')} />
            <NavItem icon={<ReportsIcon className="h-6 w-6" />} label="Reportes y Catálogos" isActive={currentPage === 'catalogs_reports'} onClick={() => setCurrentPage('catalogs_reports')} />
            <NavItem icon={<ReportIcon className="h-6 w-6" />} label="Bienes por Agente" isActive={currentPage === 'assets_by_agent_report'} onClick={() => setCurrentPage('assets_by_agent_report')} />
          </ul>
        </nav>
        <div className="p-4 flex justify-center">
          <img src="/logo.png" alt="Logo" className="w-32 h-auto" />
        </div>
        <div className="p-4 border-t dark:border-gray-700">
           <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              <span className="ml-2 text-sm font-medium">Cambiar Tema</span>
           </button>
           <button 
              onClick={logout}
              className="w-full flex items-center justify-center p-2 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span className="ml-2 text-sm font-medium">Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </AuthProvider>
);

export default App;