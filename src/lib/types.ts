
export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export interface AppEntry {
  id: string;
  appName: string;
  packageName?: string;
  iconUrl?: string;
  screenshots?: string[];
  description: string;
  whatsNew?: string;
  version: string;
  apkSize?: string;
  downloads: number;
  category: string;
  apkUrl: string;
  developer: string;
  status: string;
  isFeatured?: boolean;
  isHidden?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  role: 'user' | 'admin' | 'blocked';
  displayName?: string;
  createdAt?: string;
  downloadHistory?: string[];
}
