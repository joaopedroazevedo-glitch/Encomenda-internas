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
      head: [['Data', 'Nº Enc.', 'Org.', 'Nº Fatura', 'Artigo / Serviço', 'Qtd.', 'Cliente', 'Secção']],
      body: orders.map(order => [
        new Date(order.date).toLocaleDateString('pt-PT'),
        order.orderNumber || '',
        order.isOrganicRecycled ? 'Sim' : '',
        order.invoiceNumber || '',
        order.item,
        order.quantity || '',
        order.client,
        order.section
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { cellWidth: 15, halign: 'center' } // Small column for Organic flag
      },
      headStyles: { fillColor: [14, 165, 233] }, // primary-500 color
      alternateRowStyles: { fillColor: [240, 249, 255] }, // primary-50
      // Highlight organic rows slightly green in the table body? Optional, but helpful.
      didParseCell: (data) => {
        const rowOrder = orders[data.row.index];
        if (rowOrder && rowOrder.isOrganicRecycled && data.section === 'body') {
           // Optional: Apply style to specific cells if needed
        }
      }
    });

    doc.save(`encomendas_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Export single order to PDF
  const handleExportOrder = (order: Order) => {
    const doc = new jsPDF();
    
    // Define Colors based on Organic status
    const isOrganic = order.isOrganicRecycled;
    
    // Blue: [14, 165, 233] (#0ea5e9)
    // Green: [22, 163, 74] (#16a34a)
    const primaryColor = isOrganic ? [22, 163, 74] : [14, 165, 233];
    const headerTitle = isOrganic ? 'Encomenda Interna (Orgânico/Reciclado)' : 'Encomenda Interna';
    
    // Header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(isOrganic ? 18 : 22); // Slightly smaller if title is longer
    doc.text(headerTitle, 105, 22, { align: 'center' });
    
    // Reset defaults
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    let y = 50;
    const leftMargin = 20;
    const contentWidth = 170;
    const lineHeight = 7;

    // --- Row 1: Basic Info ---
    doc.setFont('helvetica', 'bold');
    doc.text('Nº Encomenda:', leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.orderNumber || '-', leftMargin + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Data:', leftMargin + 80, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(order.date).toLocaleDateString('pt-PT'), leftMargin + 95, y);
    
    y += lineHeight * 2;

    // --- Row 2: Article (Dynamic Height) ---
    doc.setFont('helvetica', 'bold');
    doc.text('Artigo / Serviço:', leftMargin, y);
    
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    // Wrap text to width
    const splitItem = doc.splitTextToSize(order.item, contentWidth);
    doc.text(splitItem, leftMargin, y);
    
    // Calculate height consumed by text (approx 5-6 units per line in this font size)
    const textHeight = splitItem.length * 6; 
    
    y += textHeight + lineHeight; // Add some padding after text

    // --- Separator Line ---
    doc.setDrawColor(220, 220, 220);
    doc.line(leftMargin, y - 5, leftMargin + contentWidth, y - 5);
    y += 5;

    // --- Row 3: Client & Section ---
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.client, leftMargin + 20, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Secção:', leftMargin + 80, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.section, leftMargin + 100, y);
    
    y += lineHeight * 1.5;

    // --- Row 4: Quantity ---
    doc.setFont('helvetica', 'bold');
    doc.text('Quantidade:', leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.quantity || '-', leftMargin + 25, y);
    
    if (order.invoiceNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text('Nº Fatura:', leftMargin + 80, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.invoiceNumber, leftMargin + 105, y);
    }
    
    // Optional indicator in body
    if (isOrganic) {
      y += lineHeight * 1.5;
      doc.setTextColor(22, 163, 74); // Green text
      doc.setFont('helvetica', 'bolditalic');
      doc.text('* Artigo Orgânico / Reciclado', leftMargin, y);
      doc.setTextColor(0, 0, 0); // Reset
    }

    // Outer Border (Optional, drawing based on dynamic height)
    // We draw a rectangle from y=40 to current y + padding
    const boxStart = 40;
    const boxHeight = (y + 10) - boxStart;
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, boxStart, 182, boxHeight);

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