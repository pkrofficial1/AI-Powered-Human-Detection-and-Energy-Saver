import React from 'react';
import { History, Power } from 'lucide-react';

interface DeviceHistoryEntry {
  id: string;
  roomName: string;
  deviceName: string;
  action: string;
  timestamp: Date;
}

interface DeviceHistoryProps {
  history: DeviceHistoryEntry[];
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export default function DeviceHistory({ history }: DeviceHistoryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <History className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Device History</h2>
      </div>

      <div className="space-y-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                entry.action.includes('on')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                <Power className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.roomName} - {entry.deviceName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.action}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTimeAgo(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}