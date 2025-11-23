export interface Order {
  id: string;
  date: string;
  orderNumber: string;
  invoiceNumber: string;
  item: string;
  quantity: string;
  client: string;
  section: string;
  isOrganicRecycled?: boolean;
}

export type OrderFormData = Omit<Order, 'id' | 'orderNumber' | 'invoiceNumber'>;