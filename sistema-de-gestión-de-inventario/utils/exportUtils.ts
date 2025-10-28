import { Asset, Category, Location } from "../types";



export const handleExportCSV = (assets: Asset[], selectedYear: number, locations: Location[], categories: Category[]) => {
    const reportAssets = assets.filter(a => a.history.some(h => h.year === selectedYear));
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombre,Codigo Nomenclador,Categoria,Ubicacion,Estado,Valor\n";
    
    reportAssets.forEach(asset => {
        const historyEntry = asset.history.find(h => h.year === selectedYear) || asset.history[0];
        const row = [
            asset.id,   
            `"${asset.name}"`,
            asset.nomenclaturaId || 'N/A',
            `"${categories.find(c => c.id === asset.categoryId)?.name || 'N/A'}"`,
            `"${locations.find(l => l.id === historyEntry.locationId)?.name || 'N/A'}"`,
            historyEntry.status,
            historyEntry.value
        ].join(",");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_inventario_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

export const handleExportPDF = (assets: Asset[], selectedYear: number, locations: Location[], categories: Category[]) => {
    const doc = new (window as any).jspdf.jsPDF();
    const reportAssets = assets.filter(a => a.history.some(h => h.year === selectedYear));

    doc.text(`Reporte de Inventario - Ejercicio ${selectedYear}`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["ID", "Nombre", "Cód. Nomen.", "Categoría", "Ubicación", "Estado", "Valor"];
    const tableRows: any[] = [];

    reportAssets.forEach(asset => {
        const historyEntry = asset.history.find(h => h.year === selectedYear) || asset.history[0];
        const assetData = [
            asset.id,
            asset.name,
            asset.nomenclaturaId,
            categories.find(c => c.id === asset.categoryId)?.name || 'N/A',
            locations.find(l => l.id === historyEntry.locationId)?.name || 'N/A',
            historyEntry.status,
            `$${historyEntry.value.toLocaleString()}`
        ];
        tableRows.push(assetData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`reporte_inventario_${selectedYear}.pdf`);
  };
