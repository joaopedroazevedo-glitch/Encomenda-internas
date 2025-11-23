import React, { useState } from 'react';
import { PlusCircle, Calendar, User, Box, Layers, Hash } from 'lucide-react';
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
    section: ''
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
      section: ''
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sectionOptions = [
    "Jacquard",
    "Cordão",
    "Tinturaria",
    "Calandra",
    "Estamparia/Ponteiras",
    "Expedição"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-primary-500" />
        Nova Encomenda
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Field */}
        <div className="space-y-1">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Client Field */}
        <div className="space-y-1">
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
              placeholder="Ex: Cliente A"
              value={formData.client}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Section Field */}
        <div className="space-y-1">
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
              className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors appearance-none bg-gray-50 text-gray-900"
            >
              <option value="" disabled>Selecione</option>
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quantity Field */}
        <div className="space-y-1">
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
              placeholder="Ex: 10"
              value={formData.quantity}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Item/Service Field - Full Width on bottom line */}
        <div className="space-y-1 md:col-span-4">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-4 flex justify-end pt-2">
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