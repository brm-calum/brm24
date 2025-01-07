export type InquiryPriority = boolean;

export interface InquiryFormData {
  warehouseId: string;
  startDate: Date;
  endDate: Date;
  spaceNeeded: number | '';
  message: string;
}

export interface Conversation {
  inquiry_id: string;
  warehouse_name: string;
  inquirer_first_name: string;
  inquirer_last_name: string;
  status: string;
  thread_status: string;
  created_at: string;
  updated_at: string;
  is_priority: boolean;
  responses?: any[];
  unread_count?: number;
}