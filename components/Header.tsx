import React from 'react';
import { Package, FileText } from 'lucide-react';

interface HeaderProps {
  totalOrders: number;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ totalOrders, onExport }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Encomendas Internas</h1>
            <p className="text-sm text-gray-500">Gestão de pedidos e serviços</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:block text-sm text-gray-500 mr-2">
            Total: <span className="font-semibold text-gray-900">{totalOrders}</span> registos
          </div>
          <button
            onClick={onExport}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>
    </header>
  );
};