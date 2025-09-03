
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Asset, Location, AssetStatus } from '../types';
import { Button, Card, Input, Select, Spinner, Textarea } from './ui';
import {moc} from '../services/mockApi';

declare const Html5Qrcode: any;

interface MobileFlowProps {
  locations: Location[];
  onUpdateAsset: (asset: Asset) => void;
}

const MobileFlow: React.FC<MobileFlowProps> = ({ locations, onUpdateAsset }) => {
  const [view, setView] = useState<'scanner' | 'form' | 'success'>('scanner');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrScannerRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    status: AssetStatus.BUENO,
    value: 0,
    locationId: '',
    observations: ''
  });
  
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    console.log(`QR Scanned: ${decodedText}`);
    setLoading(true);
    setError('');
    try {
        const asset = await api.fetchAssetById(decodedText);
        if (asset) {
            setScannedAsset(asset);
            setFormData({
                status: asset.currentStatus,
                value: asset.currentValue,
                locationId: asset.locationId,
                observations: ''
            });
            setView('form');
            // Desactivar la cámara cuando se encuentra un código QR válido
            stopCamera();
        } else {
            setError(`Bien con ID "${decodedText}" no encontrado.`);
        }
    } catch (err) {
        setError('Error al buscar el bien. Intente de nuevo.');
    } finally {
        setLoading(false);
    }
  }, []);

  const startCamera = () => {
    setError('');
    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5Qrcode("qr-reader");
    }

    qrScannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        // prevent multiple callbacks if scanning is fast
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
          handleScanSuccess(decodedText);
        }
      },
      (errorMessage: string) => { /* ignore errors */ }
    ).then(() => {
      setIsCameraActive(true);
    }).catch((err: any) => {
      setError("No se pudo iniciar la cámara. Verifique los permisos.");
      console.error("Unable to start scanning.", err);
    });
  };

  const stopCamera = () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      qrScannerRef.current.stop().then(() => {
        setIsCameraActive(false);
      }).catch((err: any) => {
        console.warn("QR scanner stop failed.", err);
      });
    }
  };

  useEffect(() => {
    // Inicializar el scanner pero no activar la cámara automáticamente
    if (view === 'scanner') {
      Html5Qrcode.getCameras().then((devices: any[]) => {
        if (!devices || devices.length === 0) {
          setError("No se encontraron cámaras en este dispositivo.");
        }
      }).catch(err => {
        setError("Error al acceder a las cámaras.");
      });
    }

    // Limpiar al desmontar
    return () => {
      stopCamera();
    };
  }, [view, handleScanSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scannedAsset) return;
      setLoading(true);
      try {
          const updatedAsset = await api.addInventoryRecord(scannedAsset.id, {
              year: new Date().getFullYear(),
              status: formData.status,
              value: Number(formData.value),
              locationId: formData.locationId,
              observations: formData.observations
          });
          onUpdateAsset(updatedAsset);
          setView('success');
      } catch (err) {
          setError('Error al guardar el inventario.');
      } finally {
          setLoading(false);
      }
  }

  const resetFlow = () => {
      setScannedAsset(null);
      setError('');
      setView('scanner');
  }

  if (view === 'scanner') {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Escanear Código QR</h2>
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"></div>
            {loading && <div className="mt-4"><Spinner /></div>}
            {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
            
            <div className="mt-4 flex flex-col space-y-2">
              {isCameraActive ? (
                <Button 
                  variant="danger" 
                  className="w-full" 
                  onClick={stopCamera}
                >
                  Desactivar Cámara
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={startCamera}
                >
                  Activar Cámara
                </Button>
              )}
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {isCameraActive 
                  ? "Apunte la cámara al código QR pegado en el bien." 
                  : "Activa la cámara para escanear un código QR."}
              </p>
              
              <Button 
                variant="secondary" 
                className="mt-2" 
                onClick={() => handleScanSuccess('ASSET-002')}
              >
                Simular Escaneo (Bien Regular)
              </Button>
            </div>
        </Card>
      </div>
    );
  }

  if (view === 'form' && scannedAsset) {
      return (
          <div className="p-4 flex flex-col items-center">
              <Card className="w-full max-w-md">
                <button onClick={resetFlow} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">&larr; Volver a escanear</button>
                <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">{scannedAsset.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-4">{scannedAsset.id}</p>
                <img src={scannedAsset.images[0]} alt={scannedAsset.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-semibold dark:text-gray-200">Actualizar Inventario ({new Date().getFullYear()})</h3>
                    <Select label="Estado" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as AssetStatus})}>
                         {Object.values(AssetStatus).filter(s => ![AssetStatus.PENDIENTE_BAJA, AssetStatus.DADO_DE_BAJA].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Input label="Valor Actualizado" type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})}/>
                    <Select label="Ubicación Física" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                         {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                    <Textarea label="Observaciones" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})}/>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Spinner /> : `Guardar Inventario ${new Date().getFullYear()}`}
                    </Button>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                </form>
              </Card>
          </div>
      )
  }

  if (view === 'success') {
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                 <h2 className="text-2xl font-bold mt-4 dark:text-gray-100">¡Éxito!</h2>
                 <p className="text-gray-600 dark:text-gray-300 mt-2">El inventario para <strong className="dark:text-white">{scannedAsset?.name}</strong> ha sido actualizado correctamente.</p>
                 <Button onClick={resetFlow} className="mt-6 w-full">Escanear Siguiente Bien</Button>
            </Card>
        </div>
      )
  }

  return <Spinner />;
};

export default MobileFlow;
