export interface WarehouseType {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export type OperatingHours = '24_7' | 'business_hours' | 'custom';

export interface CustomHours {
  monday?: { open: string; close: string; };
  tuesday?: { open: string; close: string; };
  wednesday?: { open: string; close: string; };
  thursday?: { open: string; close: string; };
  friday?: { open: string; close: string; };
  saturday?: { open: string; close: string; };
  sunday?: { open: string; close: string; };
}

export interface WarehouseFeature {
  id: string;
  name: string;
  type: 'accessibility' | 'equipment' | 'security' | 'custom';
  icon?: string;
  custom_value?: string;
}

export interface WarehouseService {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricing_type: 'hourly_rate' | 'per_unit' | 'ask_quote';
  hourly_rate_cents?: number;
  unit_rate_cents?: number;
  unit_type?: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  owner_id: string;
  type_id: string;
  name: string;
  description: string | null;
  size_m2: number;
  price_per_m2_cents: number;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: OperatingHours;
  custom_hours?: CustomHours;
  features: WarehouseFeature[];
  services: WarehouseService[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type?: WarehouseType;
  images?: WarehouseImage[];
}

export interface WarehouseImage {
  id: string;
  warehouse_id: string;
  url: string;
  order: number;
  created_at: string;
}

export interface WarehouseFormData {
  name: string;
  type_id: string;
  description: string;
  size_m2: number | '';
  price_per_m2_cents: number | '';
  address: string;
  city: string;
  country: string;
  postal_code: string;
  operating_hours: OperatingHours;
  custom_hours?: CustomHours;
  features: { id: string; custom_value?: string; }[];
  services: { 
    id: string;
    price_per_hour_cents?: number;
    price_per_unit_cents?: number;
    unit_type?: string;
    notes?: string;
  }[];
  images: { url: string; order: number }[];
}