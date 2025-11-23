import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Search, User, X, Box, Activity } from 'lucide-react';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { Order, OrderFormData, OrderStatus } from './types';

// Constants
const STORAGE_KEY = 'internal_orders_data';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Separate search states
  const [searchClient, setSearchClient] = useState('');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedOrders = JSON.parse(saved);
        // Ensure backward compatibility by adding default status and commercial if missing
        const migratedOrders = parsedOrders.map((o: any) => ({
          ...o,
          status: o.status || 'Pendente',
          commercial: o.commercial || ''
        }));
        setOrders(migratedOrders);
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // Calculate next order number
  const getNextOrderNumber = (): string => {
    // Since we renumber on delete, the next number is simply length + 1
    return (orders.length + 1).toString();
  };

  const handleAddOrder = (data: OrderFormData) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: getNextOrderNumber(), // Auto-generate
      status: 'Pendente', // Default status
      ...data
    };
    // Add to top of list
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Tem a certeza que pretende eliminar este registo?')) {
      setOrders(prev => {
        // 1. Filter out the deleted item
        const filtered = prev.filter(o => o.id !== id);
        
        // 2. Renumber remaining orders to ensure sequence (nº - 1 behavior)
        // Assuming 'prev' is ordered Newest -> Oldest (as per handleAddOrder)
        // The last item in array is Order #1. The first item is Order #Length.
        // Formula: New Order Number = Total Items - Index
        
        const reordered = filtered.map((order, index) => ({
          ...order,
          orderNumber: (filtered.length - index).toString()
        }));

        return reordered;
      });
    }
  };

  // Compute filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Filter by Client
        const clientMatch = order.client.toLowerCase().includes(searchClient.toLowerCase());
        
        // Filter by Order Number
        const numberMatch = !searchOrderNumber || (order.orderNumber && order.orderNumber.includes(searchOrderNumber));
        
        // Filter by Status
        const statusMatch = !searchStatus || order.status === searchStatus;
        
        return clientMatch && numberMatch && statusMatch;
      })
      .sort((a, b) => {
        // Sort by Order Number Descending (Numeric)
        const numA = parseInt(a.orderNumber || '0', 10);
        const numB = parseInt(b.orderNumber || '0', 10);
        return numB - numA;
      });
  }, [orders, searchClient, searchOrderNumber, searchStatus]);

  // Export full list to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Relatório de Encomendas Internas', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString('pt-PT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Gerado em: ${dateStr}`, 14, 30);

    // Table
    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Nº Enc.', 'Org.', 'Artigo / Serviço', 'Qtd.', 'Cliente', 'Comercial', 'Secção', 'Estado']],
      body: filteredOrders.map(order => [
        new Date(order.date).toLocaleDateString('pt-PT'),
        order.orderNumber || '',
        order.isOrganicRecycled ? 'Sim' : '',
        order.item,
        order.quantity || '',
        order.client,
        order.commercial || '',
        order.section,
        order.status || 'Pendente'
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { cellWidth: 15, halign: 'center' } // Small column for Organic flag
      },
      headStyles: { fillColor: [14, 165, 233] as [number, number, number] }, // primary-500 color
      alternateRowStyles: { fillColor: [240, 249, 255] as [number, number, number] }, // primary-50
      // Highlight organic rows slightly green in the table body? Optional, but helpful.
      didParseCell: (data) => {
        const rowOrder = filteredOrders[data.row.index];
        if (rowOrder && rowOrder.isOrganicRecycled && data.section === 'body') {
           // Optional: Apply style to specific cells if needed
        }
      }
    });

    doc.save(`encomendas_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Export single order to PDF (Excel Grid Style)
  const handleExportOrder = (order: Order) => {
    const doc = new jsPDF();
    
    // Define Colors based on Organic status
    const isOrganic = order.isOrganicRecycled;
    
    // Blue: [14, 165, 233] (#0ea5e9)
    // Green: [22, 163, 74] (#16a34a)
    const primaryColor = isOrganic ? [22, 163, 74] : [14, 165, 233];
    const headerTitle = isOrganic ? 'ENCOMENDA (ORGÂNICO/RECICLADO)' : 'ENCOMENDA INTERNA';
    
    // 1. Header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    
    // 2. Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(headerTitle, 105, 18, { align: 'center' });
    
    // Reset defaults
    doc.setTextColor(0, 0, 0);
    
    // 3. Define Table Data (5 Rows Grid Style)
    // Using autoTable to draw a form-like grid
    
    const labelStyle = { 
      fontStyle: 'bold' as const, 
      fillColor: [245, 247, 250] as [number, number, number], // Light Gray for labels
      textColor: [55, 65, 81] as [number, number, number],
      halign: 'left' as const
    };
    
    const valueStyle = {
      fontStyle: 'normal' as const,
      textColor: [0, 0, 0] as [number, number, number]
    };

    const tableBody = [
      // Row 1: Data | Nº Encomenda
      [
        { content: 'DATA', styles: labelStyle },
        { content: new Date(order.date).toLocaleDateString('pt-PT'), styles: valueStyle },
        { content: 'Nº ENCOMENDA', styles: labelStyle },
        { content: order.orderNumber || '-', styles: { ...valueStyle, fontStyle: 'bold' as const, fontSize: 11 } }
      ],
      // Row 2: Cliente | Comercial
      [
        { content: 'CLIENTE', styles: labelStyle },
        { content: order.client, styles: valueStyle },
        { content: 'COMERCIAL', styles: labelStyle },
        { content: order.commercial || '-', styles: valueStyle }
      ],
      // Row 3: Secção | Quantidade
      [
        { content: 'SECÇÃO', styles: labelStyle },
        { content: order.section, styles: valueStyle },
        { content: 'QUANTIDADE', styles: labelStyle },
        { content: order.quantity || '-', styles: valueStyle }
      ],
      // Row 4: Artigo (Full Width)
      [
        { content: 'ARTIGO / SERVIÇO', styles: labelStyle },
        { content: order.item, colSpan: 3, styles: { ...valueStyle, minCellHeight: 20, valign: 'middle' as const } }
      ],
      // Row 5: Estado | Tipo
      [
        { content: 'ESTADO ATUAL', styles: labelStyle },
        { content: order.status || 'Pendente', styles: valueStyle },
        { content: 'TIPO', styles: labelStyle },
        { 
          content: isOrganic ? 'ORGÂNICO / RECICLADO' : 'PADRÃO', 
          styles: { 
            ...valueStyle, 
            textColor: (isOrganic ? [22, 163, 74] : [0, 0, 0]) as [number, number, number],
            fontStyle: (isOrganic ? 'bold' : 'normal') as 'bold' | 'normal'
          } 
        }
      ]
    ];

    autoTable(doc, {
      startY: 40,
      body: tableBody,
      theme: 'grid',
      styles: {
        lineColor: [200, 200, 200] as [number, number, number],
        lineWidth: 0.1,
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Label Col 1
        1: { cellWidth: 65 }, // Value Col 1
        2: { cellWidth: 40 }, // Label Col 2
        3: { cellWidth: 'auto' } // Value Col 2
      }
    });

    // Extra Table for Partial Deliveries (Requested: 2 cols, 10 rows)
    const finalY = (doc as any).lastAutoTable.finalY;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Changed to black
    doc.text('REGISTO DE ENTREGAS / FATURAS', 14, finalY + 12);

    // Create 10 empty rows
    const emptyRows = Array(10).fill(['', '']);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Quantidade', 'Fatura']],
      body: emptyRows,
      theme: 'grid',
      styles: {
        lineColor: [0, 0, 0] as [number, number, number], // Black lines
        textColor: [0, 0, 0] as [number, number, number], // Black text
        lineWidth: 0.1,
        fontSize: 10,
        minCellHeight: 10, // Adjusted for 10 rows
        halign: 'center',
        valign: 'middle' as const
      },
      headStyles: {
        fillColor: [255, 255, 255] as [number, number, number], // White background
        textColor: [0, 0, 0] as [number, number, number],       // Black text
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number]        // Black border
      }
    });

    // --- NEW: REF ARTIGO FRAME ---
    const finalY2 = (doc as any).lastAutoTable.finalY;
    
    // Draw frame
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.rect(14, finalY2 + 5, 182, 12); // x=14, y=after table + 5, width=182, height=12
    
    // Add Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("REFª ARTIGO:", 16, finalY2 + 12.5);
    // -----------------------------

    doc.save(`encomenda_${order.orderNumber || 'sem_numero'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header totalOrders={filteredOrders.length} onExport={handleExportPDF} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <OrderForm onAddOrder={handleAddOrder} />

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Pesquisar e Filtrar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Client Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por Cliente..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
              />
              {searchClient && (
                <button
                  onClick={() => setSearchClient('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Order Number Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nº Encomenda..."
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
              />
              {searchOrderNumber && (
                <button
                  onClick={() => setSearchOrderNumber('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors appearance-none bg-white text-gray-900"
              >
                <option value="">Todos os Estados</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Curso">Em Curso</option>
                <option value="Concluído">Concluído</option>
                <option value="Anulado">Anulado</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <OrderList 
          orders={filteredOrders} 
          onDelete={handleDeleteOrder}
          onExportOrder={handleExportOrder}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
}

export default App;