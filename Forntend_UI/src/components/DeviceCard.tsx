import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { 
  Lightbulb, 
  Fan, 
  Wind, 
  Blinds, 
  Tv, 
  Speaker, 
  Edit2, 
  Check, 
  X, 
  Thermometer,
  DoorOpen
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  roomTemperature?: number;
  onToggle: (id: string) => void;
  onValueChange?: (id: string, value: number) => void;
  onNameChange?: (id: string, newName: string) => void;
}

const iconMap = {
  light: Lightbulb,
  fan: Fan,
  ac: Wind,
  curtain: Blinds,
  tv: Tv,
  speaker: Speaker,
  door: DoorOpen,
};

const getDeviceValueLabel = (device: Device) => {
  switch (device.type) {
    case 'fan':
      return `Speed: ${device.value || 0}`;
    case 'ac':
      return `${device.value || 24}°C`;
    case 'curtain':
      return `${device.value || 0}% open`;
    case 'door':
      return device.status ? 'Open' : 'Closed';
    default:
      return '';
  }
};

const getDeviceValueIcon = (type: Device['type']) => {
  switch (type) {
    case 'fan':
      return <Fan className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    case 'ac':
      return <Thermometer className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    case 'curtain':
      return <Blinds className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    case 'door':
      return <DoorOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    default:
      return null;
  }
};

const getDeviceIconClass = (type: Device['type'], isOn: boolean) => {
  if (!isOn) return '';
  switch (type) {
    case 'fan':
      return 'device-icon-fan';
    case 'ac':
      return 'device-icon-ac';
    case 'curtain':
      return 'device-icon-curtain';
    case 'light':
      return 'device-icon-light';
    case 'tv':
      return 'device-icon-tv';
    case 'speaker':
      return 'device-icon-speaker';
    case 'door':
      return 'device-icon-door';
    default:
      return '';
  }
};

export default function DeviceCard({ device, roomTemperature, onToggle, onValueChange, onNameChange }: DeviceCardProps) {
  const Icon = iconMap[device.type];
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [currentValue, setCurrentValue] = useState(device.value || 0);
  const [isOn, setIsOn] = useState(device.status);

  useEffect(() => {
    setCurrentValue(device.value || 0);
    setIsOn(device.status);
  }, [device.value, device.status]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentValue(value);
  };

  const handleSliderRelease = () => {
    onValueChange?.(device.id, currentValue);
  };

  const handleNameSave = () => {
    if (newName.trim() && onNameChange) {
      onNameChange(device.id, newName);
    }
    setIsEditing(false);
  };

  const handleToggle = () => {
    setIsOn(!isOn);
    onToggle(device.id);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${isOn ? 'bg-blue-500/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <Icon className={`h-6 w-6 device-icon ${isOn ? 'text-blue-500' : 'text-gray-400'} ${getDeviceIconClass(device.type, isOn)}`} />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button onClick={handleNameSave} className="p-1 text-green-500 hover:text-green-600">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {device.type === 'door' ? (isOn ? 'Open' : 'Closed') : (isOn ? 'On' : 'Off')}
              {roomTemperature && (
                <span className="ml-2 flex items-center">
                  <Thermometer className="h-4 w-4 mr-1" />
                  {roomTemperature}°C
                </span>
              )}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isOn}
            onChange={handleToggle}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {(device.type === 'fan' || device.type === 'ac' || device.type === 'curtain') && isOn && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              {getDeviceValueIcon(device.type)}
              <span>{device.type === 'fan' ? 'Speed' : device.type === 'ac' ? 'Temperature' : 'Position'}</span>
            </div>
            <span className="font-medium">{getDeviceValueLabel(device)}</span>
          </div>
          <input
            type="range"
            min={device.type === 'ac' ? 16 : 0}
            max={device.type === 'fan' ? 5 : device.type === 'ac' ? 30 : 100}
            value={currentValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{device.type === 'ac' ? '16°C' : '0'}{device.type === 'fan' ? ' speed' : device.type === 'curtain' ? '%' : ''}</span>
            <span>{device.type === 'fan' ? '5 speed' : device.type === 'ac' ? '30°C' : '100%'}</span>
          </div>
        </div>
      )}
    </div>
  );
}