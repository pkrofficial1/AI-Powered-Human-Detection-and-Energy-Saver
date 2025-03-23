import React, { useState } from 'react';
import { Camera, Video, Shield, Bell, Settings2 } from 'lucide-react';

const cameras = [
  {
    id: 1,
    name: 'Front Door',
    location: 'Main Entrance',
    stream: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2940',
    status: 'online',
    recording: true,
  },
  {
    id: 2,
    name: 'Backyard',
    location: 'Garden Area',
    stream: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2940',
    status: 'online',
    recording: true,
  },
  {
    id: 3,
    name: 'Garage',
    location: 'Parking Area',
    stream: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=2940',
    status: 'offline',
    recording: false,
  },
  {
    id: 4,
    name: 'Side Gate',
    location: 'Side Entrance',
    stream: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=2941',
    status: 'online',
    recording: true,
  }
];

export default function Security() {
  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Surveillance</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isFullscreen ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg group">
              <img 
                src={selectedCamera.stream} 
                alt={selectedCamera.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{selectedCamera.name}</h3>
                      <p className="text-gray-300 text-sm">{selectedCamera.location}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {selectedCamera.recording && (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-white text-sm">Recording</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Video className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`relative rounded-lg overflow-hidden aspect-video group ${
                    selectedCamera.id === camera.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img 
                    src={camera.stream} 
                    alt={camera.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-sm font-medium truncate">{camera.name}</p>
                    </div>
                  </div>
                  <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                    camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className={`${isFullscreen ? 'hidden' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Details</h2>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedCamera.status === 'online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {selectedCamera.status.charAt(0).toUpperCase() + selectedCamera.status.slice(1)}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedCamera.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Location</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedCamera.location}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Recording Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`h-2 w-2 rounded-full ${selectedCamera.recording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedCamera.recording ? 'Recording' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                View Recording History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}