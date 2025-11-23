import React from 'react';
import { Trash2, FileDown, Leaf } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderListProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onExportOrder: (order: Order) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onDelete, onExportOrder, onStatusChange }) => {
  // Define minimum rows to simulate a full sheet page
  const minRows = 15;
  const emptyRows = Math.max(0, minRows - orders.length);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Em Curso': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Concluído': return 'bg-green-50 text-green-700 border-green-200';
      case 'Anulado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-400 shadow-sm select-none flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm cursor-default font-sans">
          <thead>
            <tr className="bg-gray-100">
              {/* Row Header (Excel-like row numbers column header) */}
              <th className="w-12 border border-gray-400 px-1 py-1 text-center font-bold text-gray-500 bg-gray-200 select-none text-xs">
                #
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider w-32">
                Data
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider w-24">
                Nº Enc.
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider w-10 text-center">
                <Leaf className="w-3.5 h-3.5 mx-auto text-green-600" />
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider min-w-[200px]">
                Artigo / Serviço
              </th>
              <th className="border border-gray-400 px-3 py-1 text-center font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider w-24">
                Qtd.
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider">
                Cliente
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider">
                Comercial
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider">
                Secção
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider w-32">
                Estado
              </th>
              <th className="w-24 border border-gray-400 px-2 py-1 text-center font-bold text-gray-700 bg-gray-100 text-xs uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="hover:bg-blue-50 group transition-colors">
                <td className="border border-gray-300 bg-gray-50 text-center text-gray-500 text-xs font-mono py-1 select-none">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 whitespace-nowrap">
                  {new Date(order.date).toLocaleDateString('pt-PT')}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 font-mono text-xs font-semibold whitespace-nowrap">
                  {order.orderNumber || '-'}
                </td>
                <td className="border border-gray-300 px-1 py-1 text-center">
                  {order.isOrganicRecycled && (
                    <Leaf className="w-3.5 h-3.5 mx-auto text-green-600 fill-green-50" />
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 whitespace-normal break-words max-w-xs sm:max-w-md">
                  {order.item}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 text-center font-mono whitespace-nowrap">
                  {order.quantity || '-'}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 whitespace-nowrap">
                  {order.client}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 whitespace-nowrap">
                  {order.commercial}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-900 whitespace-nowrap">
                  {order.section}
                </td>
                <td className="border border-gray-300 px-1 py-1 text-center">
                  <select
                    value={order.status || 'Pendente'}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`block w-full py-0.5 pl-2 pr-6 border rounded text-xs font-medium cursor-pointer focus:ring-1 focus:ring-offset-0 focus:ring-blue-500 appearance-none ${getStatusColor(order.status || 'Pendente')}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.2rem center`,
                      backgroundSize: `1.2em 1.2em`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Curso">Em Curso</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Anulado">Anulado</option>
                  </select>
                </td>
                <td className="border border-gray-300 px-1 py-1 text-center bg-white">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportOrder(order);
                      }}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded inline-flex items-center justify-center transition-colors"
                      title="Exportar PDF Individual"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(order.id);
                      }}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded inline-flex items-center justify-center transition-colors"
                      title="Eliminar linha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Render empty rows to simulate a spreadsheet grid */}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 bg-gray-50 text-center text-gray-300 text-xs font-mono py-1 select-none">
                  {orders.length + i + 1}
                </td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
                <td className="border border-gray-300 px-3 py-1 h-8"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-100 border-t border-gray-300 px-3 py-1.5 flex items-center justify-between text-xs font-medium text-gray-600">
        <div className="flex items-center gap-2">
           <div className="bg-white border border-gray-300 px-3 py-1 text-green-700 shadow-sm rounded-t-sm -mb-2.5 relative top-1 font-bold">
             Dados
           </div>
           <div className="px-3 py-1 hover:bg-gray-200 cursor-pointer rounded text-gray-400">
             +
           </div>
        </div>
        <div>
          Contagem: {orders.length}
        </div>
      </div>
    </div>
  );
};