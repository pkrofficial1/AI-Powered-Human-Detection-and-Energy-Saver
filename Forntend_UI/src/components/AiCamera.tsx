import React from 'react';
import { Camera } from 'lucide-react';

export default function AiCamera() {
  return (
    <div className="ai-camera group">
      <div className="ai-camera-ring"></div>
      <Camera className="h-6 w-6 text-blue-500 ai-camera-icon" />
      <div className="absolute -top-2 -right-2 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        AI Camera Active
      </div>
    </div>
  );
}