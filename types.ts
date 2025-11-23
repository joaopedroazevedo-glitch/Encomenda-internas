export type OrderStatus = 'Pendente' | 'Em Curso' | 'Concluído' | 'Anulado';

export interface Order {
  id: string;
  date: string;
  orderNumber: string;
  item: string;
  quantity: string;
  client: string;
  commercial: string;
  section: string;
  isOrganicRecycled?: boolean;
  status: OrderStatus;
}

export type OrderFormData = Omit<Order, 'id' | 'orderNumber' | 'status'>;