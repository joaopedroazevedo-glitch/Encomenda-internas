import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { Order, OrderFormData } from './types';

// Constants
const STORAGE_KEY = 'internal_orders_data';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
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
      invoiceNumber: '', // Default to empty
      ...data
    };
    // Add to top of list
    setOrders(prev => [newOrder, ...prev]);
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
      head: [['Data', 'Nº Enc.', 'Nº Fatura', 'Artigo / Serviço', 'Qtd.', 'Cliente', 'Secção']],
      body: orders.map(order => [
        new Date(order.date).toLocaleDateString('pt-PT'),
        order.orderNumber || '',
        order.invoiceNumber || '',
        order.item,
        order.quantity || '',
        order.client,
        order.section
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233] }, // primary-500 color
      alternateRowStyles: { fillColor: [240, 249, 255] }, // primary-50
    });

    doc.save(`encomendas_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Export single order to PDF
  const handleExportOrder = (order: Order) => {
    const doc = new jsPDF();
    
    // Add Company/App Header
    doc.setFillColor(14, 165, 233); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Encomenda Interna', 105, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Order Info Box
    const startY = 50;
    const lineHeight = 10;
    
    // Draw box for details
    // Increased height to 110 to accommodate description on new lines
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, startY - 5, 182, 110);

    // Details content
    doc.setFont('helvetica', 'bold');
    doc.text('Número da Encomenda:', 20, startY + (lineHeight * 0));
    doc.setFont('helvetica', 'normal');
    doc.text(order.orderNumber || '-', 80, startY + (lineHeight * 0));

    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 20, startY + (lineHeight * 1));
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(order.date).toLocaleDateString('pt-PT'), 80, startY + (lineHeight * 1));

    doc.setFont('helvetica', 'bold');
    doc.text('Nº Fatura:', 20, startY + (lineHeight * 2));
    doc.setFont('helvetica', 'normal');
    doc.text(order.invoiceNumber || '-', 80, startY + (lineHeight * 2));

    doc.line(20, startY + (lineHeight * 2.5), 180, startY + (lineHeight * 2.5)); // Separator

    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 20, startY + (lineHeight * 3.5));
    doc.setFont('helvetica', 'normal');
    doc.text(order.client, 80, startY + (lineHeight * 3.5));

    doc.setFont('helvetica', 'bold');
    doc.text('Secção:', 20, startY + (lineHeight * 4.5));
    doc.setFont('helvetica', 'normal');
    doc.text(order.section, 80, startY + (lineHeight * 4.5));

    doc.setFont('helvetica', 'bold');
    doc.text('Quantidade:', 20, startY + (lineHeight * 5.5));
    doc.setFont('helvetica', 'normal');
    doc.text(order.quantity || '-', 80, startY + (lineHeight * 5.5));

    doc.line(20, startY + (lineHeight * 6.5), 180, startY + (lineHeight * 6.5)); // Separator

    // Item/Service moved to a dedicated section at the bottom to allow text wrapping
    doc.setFont('helvetica', 'bold');
    doc.text('Artigo / Serviço:', 20, startY + (lineHeight * 7.5));
    doc.setFont('helvetica', 'normal');
    
    // Use splitTextToSize to wrap long text within the box width (approx 170 units)
    const splitItem = doc.splitTextToSize(order.item, 170);
    doc.text(splitItem, 20, startY + (lineHeight * 8.5));

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento gerado automaticamente.', 105, 280, { align: 'center' });

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
          <OrderList 
            orders={orders} 
            onDelete={handleDeleteOrder} 
            onExportOrder={handleExportOrder}
          />
        </div>
      </main>
    </div>
  );
}

export default App;