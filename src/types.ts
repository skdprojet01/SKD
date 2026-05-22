export interface PresetLocation {
  id: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
  category: 'landmark' | 'city' | 'transit' | 'custom';
  description: string;
  icon: string; // lucide icon name
}

export interface SavedPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface GeolocationMockConfig {
  lat: number;
  lng: number;
  isActive: boolean;
  accuracy: number;
  altitude: number;
  speed: number;
}
