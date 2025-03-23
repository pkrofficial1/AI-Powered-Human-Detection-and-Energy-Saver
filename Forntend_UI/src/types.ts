export type DeviceType = 'light' | 'fan' | 'ac' | 'curtain' | 'tv' | 'speaker' | 'door';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  value?: number;
  temperature?: number;
}

export interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'kitchen' | 'hall' | 'bathroom' | 'other';
  devices: Device[];
  temperature: number;
}

export interface User {
  name: string;
  email: string;
}

export interface Schedule {
  id: string;
  name: string;
  roomId: string;
  deviceId: string;
  action: 'on' | 'off' | 'setValue';
  value?: number;
  startTime: string;
  endTime: string;
  days: string[];
  enabled: boolean;
}