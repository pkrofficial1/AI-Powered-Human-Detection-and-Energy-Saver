import React from 'react';
import { Room } from '../types';
import { Bed, ChefHat, Sofa, Bath, Home } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
}

const iconMap = {
  bedroom: Bed,
  kitchen: ChefHat,
  hall: Sofa,
  bathroom: Bath,
  other: Home,
};

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const Icon = iconMap[room.type];
  const activeDevices = room.devices.filter(device => device.status).length;

  return (
    <div
      onClick={() => onClick(room)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
            <Icon className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{room.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeDevices} active devices
            </p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <span className="text-blue-500 font-medium">{room.devices.length}</span>
        </div>
      </div>
    </div>
  );
}