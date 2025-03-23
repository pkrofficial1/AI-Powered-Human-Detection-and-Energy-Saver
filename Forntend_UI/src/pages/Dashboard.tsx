import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, Device } from '../types';
import RoomCard from '../components/RoomCard';
import DeviceCard from '../components/DeviceCard';
import DeviceHistory from '../components/DeviceHistory';
import MQTTSettings from '../components/MQTTSettings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, ArrowLeft, Edit2, X, Check, Power, Settings2 } from 'lucide-react';
import { mqttService } from '../services/mqtt';

const energyData = [
  { time: '00:00', usage: 2.4 },
  { time: '04:00', usage: 1.8 },
  { time: '08:00', usage: 4.2 },
  { time: '12:00', usage: 3.8 },
  { time: '16:00', usage: 5.1 },
  { time: '20:00', usage: 4.5 },
];

const ROOMS_STORAGE_KEY = 'smartHome_rooms';

const getInitialRooms = () => {
  const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (savedRooms) {
    return JSON.parse(savedRooms);
  }
  
  const initialRooms = [
    {
      id: '1',
      name: 'Bedroom 1',
      type: 'bedroom',
      devices: [
        { id: '1-1', name: 'LED 1', type: 'light', status: false },
        { id: '1-2', name: 'LED 2', type: 'light', status: true },
        { id: '1-3', name: 'LED 3', type: 'light', status: false },
        { id: '1-4', name: 'Fan 1', type: 'fan', status: true, value: 3 },
        { id: '1-5', name: 'Fan 2', type: 'fan', status: false, value: 0 },
        { id: '1-6', name: 'AC', type: 'ac', status: true, value: 24 },
        { id: '1-7', name: 'Curtains', type: 'curtain', status: true, value: 80 },
        { id: '1-8', name: 'Smart TV', type: 'tv', status: false },
        { id: '1-9', name: 'Speaker', type: 'speaker', status: false },
        { id: '1-10', name: 'Main Door', type: 'door', status: false },
      ],
    },
    {
      id: '2',
      name: 'Bedroom 2',
      type: 'bedroom',
      devices: [
        { id: '2-1', name: 'LED 1', type: 'light', status: true },
        { id: '2-2', name: 'LED 2', type: 'light', status: false },
        { id: '2-3', name: 'Fan 1', type: 'fan', status: true, value: 4 },
        { id: '2-4', name: 'AC', type: 'ac', status: false, value: 25 },
        { id: '2-5', name: 'Curtains', type: 'curtain', status: true, value: 60 },
        { id: '2-6', name: 'Smart TV', type: 'tv', status: false },
        { id: '2-7', name: 'Speaker', type: 'speaker', status: false },
        { id: '2-8', name: 'Room Door', type: 'door', status: false },
      ],
    },
    {
      id: '3',
      name: 'Kitchen',
      type: 'kitchen',
      devices: [
        { id: '3-1', name: 'LED 1', type: 'light', status: true },
        { id: '3-2', name: 'LED 2', type: 'light', status: true },
        { id: '3-3', name: 'Fan 1', type: 'fan', status: true, value: 2 },
        { id: '3-4', name: 'Smart TV', type: 'tv', status: false },
        { id: '3-5', name: 'Speaker', type: 'speaker', status: false },
        { id: '3-6', name: 'Kitchen Door', type: 'door', status: false },
      ],
    },
    {
      id: '4',
      name: 'Hall',
      type: 'hall',
      devices: [
        { id: '4-1', name: 'LED 1', type: 'light', status: true },
        { id: '4-2', name: 'LED 2', type: 'light', status: true },
        { id: '4-3', name: 'LED 3', type: 'light', status: false },
        { id: '4-4', name: 'Fan 1', type: 'fan', status: true, value: 3 },
        { id: '4-5', name: 'Fan 2', type: 'fan', status: true, value: 4 },
        { id: '4-6', name: 'AC', type: 'ac', status: true, value: 23 },
        { id: '4-7', name: 'Curtains', type: 'curtain', status: true, value: 100 },
        { id: '4-8', name: 'Smart TV', type: 'tv', status: false },
        { id: '4-9', name: 'Speaker', type: 'speaker', status: false },
        { id: '4-10', name: 'Main Door', type: 'door', status: false },
        { id: '4-11', name: 'Balcony Door', type: 'door', status: false },
      ],
    },
  ];

  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
  return initialRooms;
};

interface DeviceHistoryEntry {
  id: string;
  roomName: string;
  deviceName: string;
  action: string;
  timestamp: Date;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>(getInitialRooms());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<Room['type']>('bedroom');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<Device['type']>('light');
  const [deviceHistory, setDeviceHistory] = useState<DeviceHistoryEntry[]>([]);
  const [isMQTTSettingsOpen, setIsMQTTSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setEditingRoomId(null);
  };

  const addHistoryEntry = (roomName: string, deviceName: string, action: string) => {
    const newEntry: DeviceHistoryEntry = {
      id: `history-${Date.now()}`,
      roomName,
      deviceName,
      action,
      timestamp: new Date(),
    };
    setDeviceHistory(prev => [newEntry, ...prev].slice(0, 20)); // Keep last 20 entries
  };

  const handleDeviceToggle = async (deviceId: string) => {
    const updatedRooms = rooms.map(room => {
      const updatedDevices = room.devices.map(device => {
        if (device.id === deviceId) {
          const newStatus = !device.status;
          const state = newStatus ? 'ON' : 'OFF';
          const currentRoom = selectedRoom || room;
          mqttService.publishDeviceState(currentRoom.name, device.name, state)
            .catch(error => console.error('Failed to publish device state:', error));
          
          // Add history entry
          addHistoryEntry(currentRoom.name, device.name, `turned ${state.toLowerCase()}`);
          
          return { 
            ...device, 
            status: newStatus,
            value: newStatus ? device.value : (
              device.type === 'fan' ? 1 :
              device.type === 'ac' ? 24 :
              device.type === 'curtain' ? 0 :
              undefined
            )
          };
        }
        return device;
      });
      return { ...room, devices: updatedDevices };
    });
    setRooms(updatedRooms);
  };

  const handleDeviceValueChange = async (deviceId: string, value: number) => {
    const updatedRooms = rooms.map(room => {
      const updatedDevices = room.devices.map(device => {
        if (device.id === deviceId) {
          const currentRoom = selectedRoom || room;
          let state = '';
          let actionDescription = '';
          
          if (device.type === 'fan') {
            state = `speed ${value}`;
            actionDescription = `speed changed to ${value}`;
          } else if (device.type === 'ac') {
            state = `temp ${value}`;
            actionDescription = `temperature set to ${value}°C`;
          } else if (device.type === 'curtain') {
            state = `${value}%`;
            actionDescription = `position set to ${value}%`;
          }

          mqttService.publishDeviceState(currentRoom.name, device.name, state)
            .catch(error => console.error('Failed to publish device value:', error));
          
          // Add history entry
          addHistoryEntry(currentRoom.name, device.name, actionDescription);
          
          return { ...device, value };
        }
        return device;
      });
      return { ...room, devices: updatedDevices };
    });
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: newRoomName,
        type: newRoomType,
        devices: [],
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setIsAddingRoom(false);
    }
  };

  const startEditingRoom = (roomId: string, currentName: string) => {
    setEditingRoomId(roomId);
    setNewRoomName(currentName);
  };

  const handleUpdateRoomName = (roomId: string) => {
    if (newRoomName.trim()) {
      setRooms(rooms.map(room =>
        room.id === roomId ? { ...room, name: newRoomName } : room
      ));
      setEditingRoomId(null);
      setNewRoomName('');
    }
  };

  const handleAddDevice = () => {
    if (newDeviceName.trim() && selectedRoom) {
      const newDevice: Device = {
        id: `device-${Date.now()}`,
        name: newDeviceName,
        type: newDeviceType,
        status: false,
        value: newDeviceType === 'fan' ? 1 : newDeviceType === 'ac' ? 24 : 0,
      };

      setRooms(rooms.map(room =>
        room.id === selectedRoom.id
          ? { ...room, devices: [...room.devices, newDevice] }
          : room
      ));

      setNewDeviceName('');
      setIsAddingDevice(false);
    }
  };

  const handleEditDevice = (deviceId: string, newName: string) => {
    setRooms(rooms.map(room => ({
      ...room,
      devices: room.devices.map(device =>
        device.id === deviceId
          ? { ...device, name: newName }
          : device
      ),
    })));
    setEditingDeviceId(null);
  };

  const handleTurnOffAll = () => {
    setRooms(rooms.map(room => {
      const updatedDevices = room.devices.map(device => {
        if (device.status) {
          mqttService.publishDeviceState(room.name, device.name, 'OFF');
        }
        return {
          ...device,
          status: false,
          value: device.type === 'ac' ? 24 : 0
        };
      });
      return { ...room, devices: updatedDevices };
    }));
  };

  const handleRoomTurnOffAll = (roomId: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const updatedDevices = room.devices.map(device => {
          if (device.status) {
            mqttService.publishDeviceState(room.name, device.name, 'OFF');
          }
          return {
            ...device,
            status: false,
            value: device.type === 'ac' ? 24 : 0
          };
        });
        return { ...room, devices: updatedDevices };
      }
      return room;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTurnOffAll}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Power className="h-5 w-5" />
              <span>Turn Off All Devices</span>
            </button>
          </div>
          <button
            onClick={() => setIsMQTTSettingsOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings2 className="h-5 w-5" />
            <span>MQTT Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              {selectedRoom ? (
                <>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRoom.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsAddingDevice(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Device</span>
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Rooms</h2>
                  <button
                    onClick={() => setIsAddingRoom(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Room</span>
                  </button>
                </>
              )}
            </div>

            {isAddingRoom && !selectedRoom && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Room Name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as Room['type'])}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="hall">Hall</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddRoom}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Room
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingRoom(false);
                        setNewRoomName('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isAddingDevice && selectedRoom && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Device Name"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as Device['type'])}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Device Type</option>
                    <optgroup label="Lighting">
                      <option value="light">Light</option>
                    </optgroup>
                    <optgroup label="Climate Control">
                      <option value="fan">Fan</option>
                      <option value="ac">AC</option>
                    </optgroup>
                    <optgroup label="Window & Doors">
                      <option value="curtain">Curtain</option>
                      <option value="door">Door</option>
                    </optgroup>
                    <optgroup label="Entertainment">
                      <option value="tv">TV</option>
                      <option value="speaker">Speaker</option>
                    </optgroup>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddDevice}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Device
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingDevice(false);
                        setNewDeviceName('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedRoom && (
              <button
                onClick={() => handleRoomTurnOffAll(selectedRoom.id)}
                className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Power className="h-5 w-5" />
                <span>Turn Off All in {selectedRoom.name}</span>
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRoom ? (
                selectedRoom.devices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={handleDeviceToggle}
                    onValueChange={handleDeviceValueChange}
                  />
                ))
              ) : (
                rooms.map(room => (
                  <div key={room.id} className="relative">
                    {editingRoomId === room.id ? (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleUpdateRoomName(room.id)}
                            className="p-2 text-green-500 hover:text-green-600"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoomId(null);
                              setNewRoomName('');
                            }}
                            className="p-2 text-red-500 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditingRoom(room.id, room.name)}
                          className="absolute top-2 right-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <RoomCard
                          room={room}
                          onClick={handleRoomSelect}
                        />
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <DeviceHistory history={deviceHistory} />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Energy Usage</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#3B82F6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <MQTTSettings 
          isOpen={isMQTTSettingsOpen}
          onClose={() => setIsMQTTSettingsOpen(false)}
        />
      </div>
    </div>
  );
}