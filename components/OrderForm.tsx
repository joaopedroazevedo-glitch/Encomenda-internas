import React, { useState } from 'react';
import { PlusCircle, Calendar, User, Box, Layers, Hash, Leaf, Briefcase } from 'lucide-react';
import { OrderFormData } from '../types';

interface OrderFormProps {
  onAddOrder: (data: OrderFormData) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onAddOrder }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    date: new Date().toISOString().split('T')[0],
    item: '',
    quantity: '',
    client: '',
    commercial: '',
    section: '',
    isOrganicRecycled: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.client || !formData.section) return;
    
    onAddOrder(formData);
    
    setFormData(prev => ({
      ...prev,
      item: '',
      quantity: '',
      client: '',
      commercial: '',
      section: '',
      isOrganicRecycled: false
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const sectionOptions = [
    "Jacquard",
    "Cordão",
    "Tinturaria",
    "Calandra",
    "Estamparia/Ponteiras",
    "Expedição"
  ];

  const commercialOptions = [
    "Carlos Almeida",
    "Cristiana",
    "Fátima",
    "Francisca",
    "Francisco",
    "Isabel",
    "Jorge",
    "Luís Pereira",
    "Manuel Costa",
    "Marisa"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-primary-500" />
        Nova Encomenda
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Date Field - Col Span 2 */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="date" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Data
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="block w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Client Field - Col Span 3 */}
        <div className="space-y-1 md:col-span-3">
          <label htmlFor="client" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Cliente
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="client"
              name="client"
              required
              placeholder="Nome do Cliente"
              value={formData.client}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Commercial Field - Col Span 3 */}
        <div className="space-y-1 md:col-span-3">
          <label htmlFor="commercial" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Comercial
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="commercial"
              name="commercial"
              value={formData.commercial}
              onChange={handleChange}
              className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors appearance-none bg-white text-gray-900 text-ellipsis overflow-hidden"
            >
              <option value="">Selecione...</option>
              {commercialOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Section Field - Col Span 2 */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="section" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Secção
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="section"
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              className="block w-full pl-10 pr-6 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors appearance-none bg-white text-gray-900 text-ellipsis overflow-hidden"
            >
              <option value="" disabled>Selecione</option>
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quantity Field - Col Span 2 */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Quantidade
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              placeholder="Qtd"
              value={formData.quantity}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Item/Service Field - Col Span 9 */}
        <div className="space-y-1 md:col-span-9">
          <label htmlFor="item" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Artigo / Serviço
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Box className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="item"
              name="item"
              required
              placeholder="Descrição do artigo ou serviço..."
              value={formData.item}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Organic/Recycled Checkbox - Col Span 3 */}
        <div className="md:col-span-3 flex items-end pb-2">
          <div className="flex items-center h-10 w-full p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isOrganicRecycled: !prev.isOrganicRecycled }))}>
            <input
              type="checkbox"
              id="isOrganicRecycled"
              name="isOrganicRecycled"
              checked={formData.isOrganicRecycled}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="isOrganicRecycled" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none flex items-center gap-1.5 font-medium">
              <Leaf className={`w-4 h-4 ${formData.isOrganicRecycled ? 'text-green-600' : 'text-gray-400'}`} />
              Orgânico/Reciclado
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-12 flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar Registo
          </button>
        </div>
      </form>
    </div>
  );
};