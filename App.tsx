import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Search } from 'lucide-react';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { Order, OrderFormData, OrderStatus } from './types';

// Constants
const STORAGE_KEY = 'internal_orders_data';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedOrders = JSON.parse(saved);
        // Ensure backward compatibility by adding default status if missing
        const migratedOrders = parsedOrders.map((o: any) => ({
          ...o,
          status: o.status || 'Pendente'
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
      .filter(order => 
        order.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by Date Descending (Newest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
  }, [orders, searchTerm]);

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
      head: [['Data', 'Nº Enc.', 'Org.', 'Artigo / Serviço', 'Qtd.', 'Cliente', 'Secção', 'Estado']],
      body: filteredOrders.map(order => [
        new Date(order.date).toLocaleDateString('pt-PT'),
        order.orderNumber || '',
        order.isOrganicRecycled ? 'Sim' : '',
        order.item,
        order.quantity || '',
        order.client,
        order.section,
        order.status || 'Pendente'
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { cellWidth: 15, halign: 'center' } // Small column for Organic flag
      },
      headStyles: { fillColor: [14, 165, 233] }, // primary-500 color
      alternateRowStyles: { fillColor: [240, 249, 255] }, // primary-50
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
      fontStyle: 'bold', 
      fillColor: [245, 247, 250], // Light Gray for labels
      textColor: [55, 65, 81],
      halign: 'left'
    };
    
    const valueStyle = {
      fontStyle: 'normal',
      textColor: [0, 0, 0]
    };

    const tableBody = [
      // Row 1: Data | Nº Encomenda
      [
        { content: 'DATA', styles: labelStyle },
        { content: new Date(order.date).toLocaleDateString('pt-PT'), styles: valueStyle },
        { content: 'Nº ENCOMENDA', styles: labelStyle },
        { content: order.orderNumber || '-', styles: { ...valueStyle, fontStyle: 'bold', fontSize: 11 } }
      ],
      // Row 2: Cliente | Secção
      [
        { content: 'CLIENTE', styles: labelStyle },
        { content: order.client, styles: valueStyle },
        { content: 'SECÇÃO', styles: labelStyle },
        { content: order.section, styles: valueStyle }
      ],
      // Row 3: Artigo (Full Width)
      [
        { content: 'ARTIGO / SERVIÇO', styles: labelStyle },
        { content: order.item, colSpan: 3, styles: { ...valueStyle, minCellHeight: 20, valign: 'middle' } }
      ],
      // Row 4: Quantidade (Extended since Invoice is removed)
      [
        { content: 'QUANTIDADE', styles: labelStyle },
        { content: order.quantity || '-', colSpan: 3, styles: valueStyle }
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
            textColor: isOrganic ? [22, 163, 74] : [0, 0, 0],
            fontStyle: isOrganic ? 'bold' : 'normal'
          } 
        }
      ]
    ];

    autoTable(doc, {
      startY: 40,
      body: tableBody,
      theme: 'grid',
      styles: {
        lineColor: [200, 200, 200],
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
    doc.setTextColor(80, 80, 80);
    doc.text('REGISTO DE ENTREGAS / FATURAS', 14, finalY + 12);

    // Create 10 empty rows
    const emptyRows = Array(10).fill(['', '']);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Quantidade', 'Fatura']],
      body: emptyRows,
      theme: 'grid',
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        fontSize: 10,
        minCellHeight: 10, // Adjusted for 10 rows
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [50, 50, 50],
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento gerado automaticamente pelo Gestor de Encomendas.', 105, 285, { align: 'center' });

    doc.save(`encomenda_${order.orderNumber || 'sem_numero'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        totalOrders={orders.length} 
        onExport={handleExportPDF} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <OrderForm 
            onAddOrder={handleAddOrder} 
          />
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 outline-none"
            />
            {searchTerm && (
               <button 
                 onClick={() => setSearchTerm('')}
                 className="text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
               >
                 Limpar
               </button>
            )}
          </div>

          <OrderList 
            orders={filteredOrders} 
            onDelete={handleDeleteOrder} 
            onExportOrder={handleExportOrder}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>
    </div>
  );
}

export default App;