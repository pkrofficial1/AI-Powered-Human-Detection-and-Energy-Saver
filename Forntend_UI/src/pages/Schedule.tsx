import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, Device, Schedule } from '../types';
import { Clock, Plus, Trash2, Save, AlertCircle, Thermometer, Fan, Blinds } from 'lucide-react';

const SCHEDULE_STORAGE_KEY = 'smartHome_schedules';
const ROOMS_STORAGE_KEY = 'smartHome_rooms';

interface ScheduleFormData {
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

const getDeviceDefaultValue = (type: Device['type']): number => {
  switch (type) {
    case 'fan':
      return 1; // Default fan speed
    case 'ac':
      return 24; // Default temperature
    case 'curtain':
      return 50; // Default position
    default:
      return 0;
  }
};

const getDeviceValueLabel = (type: Device['type'], value: number): string => {
  switch (type) {
    case 'fan':
      return `Speed ${value}`;
    case 'ac':
      return `${value}°C`;
    case 'curtain':
      return `${value}%`;
    default:
      return '';
  }
};

const getDeviceIcon = (type: Device['type']) => {
  switch (type) {
    case 'fan':
      return <Fan className="h-5 w-5" />;
    case 'ac':
      return <Thermometer className="h-5 w-5" />;
    case 'curtain':
      return <Blinds className="h-5 w-5" />;
    default:
      return null;
  }
};

const getDeviceValueRange = (type: Device['type']): { min: number; max: number; step: number } => {
  switch (type) {
    case 'fan':
      return { min: 1, max: 5, step: 1 };
    case 'ac':
      return { min: 16, max: 30, step: 1 };
    case 'curtain':
      return { min: 0, max: 100, step: 5 };
    default:
      return { min: 0, max: 100, step: 1 };
  }
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<ScheduleFormData[]>([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<ScheduleFormData>({
    id: '',
    name: '',
    roomId: '',
    deviceId: '',
    action: 'on',
    startTime: '',
    endTime: '',
    days: [],
    enabled: true,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }

    const savedSchedules = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

  const validateTimes = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return true;
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    return start < end;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateTimes(formData.startTime, formData.endTime)) {
      setError('End time must be after start time');
      return;
    }

    if (formData.days.length === 0) {
      setError('Please select at least one day');
      return;
    }

    const newSchedule = {
      ...formData,
      id: formData.id || `schedule-${Date.now()}`,
    };

    setSchedules(prev => [...prev, newSchedule]);
    setIsAddingSchedule(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      roomId: '',
      deviceId: '',
      action: 'on',
      startTime: '',
      endTime: '',
      days: [],
      enabled: true,
    });
    setSelectedRoom('');
    setSelectedDevice('');
    setError('');
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    const device = rooms
      .find(r => r.id === formData.roomId)
      ?.devices.find(d => d.id === deviceId);

    if (device) {
      setFormData({
        ...formData,
        deviceId,
        action: ['fan', 'ac', 'curtain'].includes(device.type) ? 'setValue' : 'on',
        value: getDeviceDefaultValue(device.type),
      });
      setSelectedDevice(deviceId);
    }
  };

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const formatTime = (time: string) => {
    return new Date(`2000/01/01 ${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const selectedDeviceType = rooms
    .find(r => r.id === formData.roomId)
    ?.devices.find(d => d.id === formData.deviceId)?.type;

  const valueRange = selectedDeviceType ? getDeviceValueRange(selectedDeviceType) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Schedules</h1>
          <button
            onClick={() => setIsAddingSchedule(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Schedule</span>
          </button>
        </div>

        {isAddingSchedule && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Morning Routine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room
                  </label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => {
                      setFormData({ ...formData, roomId: e.target.value, deviceId: '' });
                      setSelectedRoom(e.target.value);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device
                  </label>
                  <select
                    required
                    value={formData.deviceId}
                    onChange={handleDeviceChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={!formData.roomId}
                  >
                    <option value="">Select Device</option>
                    {rooms
                      .find((room) => room.id === formData.roomId)
                      ?.devices.map((device) => (
                        <option key={device.id} value={device.id}>
                          {device.name}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedDeviceType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selectedDeviceType === 'fan' ? 'Fan Speed' :
                       selectedDeviceType === 'ac' ? 'Temperature' :
                       selectedDeviceType === 'curtain' ? 'Position' : 'Action'}
                    </label>
                    {['fan', 'ac', 'curtain'].includes(selectedDeviceType) ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(selectedDeviceType)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getDeviceValueLabel(selectedDeviceType, formData.value || getDeviceDefaultValue(selectedDeviceType))}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={valueRange?.min}
                          max={valueRange?.max}
                          step={valueRange?.step}
                          value={formData.value || getDeviceDefaultValue(selectedDeviceType)}
                          onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{getDeviceValueLabel(selectedDeviceType, valueRange?.min || 0)}</span>
                          <span>{getDeviceValueLabel(selectedDeviceType, valueRange?.max || 0)}</span>
                        </div>
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.action}
                        onChange={(e) => setFormData({ ...formData, action: e.target.value as 'on' | 'off' | 'setValue' })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="on">Turn On</option>
                        <option value="off">Turn Off</option>
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat on Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...formData.days, day]
                            : formData.days.filter((d) => d !== day);
                          setFormData({ ...formData, days: updatedDays });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSchedule(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => {
            const room = rooms.find((r) => r.id === schedule.roomId);
            const device = room?.devices.find((d) => d.id === schedule.deviceId);

            return (
              <div
                key={schedule.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 ${
                  schedule.enabled ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {device && getDeviceIcon(device.type) || <Clock className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {schedule.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {room?.name} - {device?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={schedule.enabled}
                        onChange={() => handleToggleSchedule(schedule.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                  {device && ['fan', 'ac', 'curtain'].includes(device.type) && schedule.value !== undefined && (
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                      {getDeviceIcon(device.type)}
                      <span>{getDeviceValueLabel(device.type, schedule.value)}</span>
                    </div>
                  )}
                  {schedule.days.map((day) => (
                    <div
                      key={day}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}