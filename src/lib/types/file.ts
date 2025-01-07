export interface FileUrlCache {
  [key: string]: {
    url: string;
    expires: number;
  };
}

export type SortField = 'name' | 'label' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type?: string;
  label?: string | null;
  storage_path: string;
  created_at: string;
}