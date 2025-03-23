import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Zap, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  BarChart2, 
  PieChart as PieChartIcon,
  Sun,
  Cloud,
  Droplets,
  Wind,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

// Sample data - In a real app, this would come from your backend
const dailyUsage = [
  { time: '00:00', usage: 2.4, solar: 0, grid: 2.4 },
  { time: '03:00', usage: 1.8, solar: 0, grid: 1.8 },
  { time: '06:00', usage: 2.2, solar: 0.8, grid: 1.4 },
  { time: '09:00', usage: 3.8, solar: 2.5, grid: 1.3 },
  { time: '12:00', usage: 4.2, solar: 3.2, grid: 1.0 },
  { time: '15:00', usage: 5.1, solar: 2.8, grid: 2.3 },
  { time: '18:00', usage: 4.8, solar: 1.2, grid: 3.6 },
  { time: '21:00', usage: 3.2, solar: 0, grid: 3.2 },
];

const monthlyUsage = [
  { month: 'Jan', usage: 720, cost: 180 },
  { month: 'Feb', usage: 680, cost: 170 },
  { month: 'Mar', usage: 620, cost: 155 },
  { month: 'Apr', usage: 580, cost: 145 },
  { month: 'May', usage: 620, cost: 155 },
  { month: 'Jun', usage: 680, cost: 170 },
  { month: 'Jul', usage: 720, cost: 180 },
  { month: 'Aug', usage: 760, cost: 190 },
  { month: 'Sep', usage: 640, cost: 160 },
  { month: 'Oct', usage: 580, cost: 145 },
  { month: 'Nov', usage: 620, cost: 155 },
  { month: 'Dec', usage: 680, cost: 170 },
];

const deviceUsage = [
  { name: 'HVAC', value: 45 },
  { name: 'Lighting', value: 20 },
  { name: 'Appliances', value: 15 },
  { name: 'Electronics', value: 12 },
  { name: 'Water Heating', value: 8 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}

function StatCard({ title, value, subValue, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 glow-effect">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mt-1">
            {value}
          </h3>
          {subValue && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 mt-2 ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingDown className={`h-4 w-4 ${trend >= 0 ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`stat-icon p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function EnergyDashboard() {
  const [timeRange, setTimeRange] = useState('day');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Energy Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and optimize your energy consumption
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Download className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Current Usage"
            value="4.2 kW"
            subValue="Real-time consumption"
            icon={<Zap className="h-6 w-6 text-blue-500" />}
            trend={-12}
          />
          <StatCard
            title="Today's Cost"
            value="$8.45"
            subValue="Estimated"
            icon={<DollarSign className="h-6 w-6 text-green-500" />}
            color="green"
            trend={-8}
          />
          <StatCard
            title="Solar Generation"
            value="2.8 kW"
            subValue="Current output"
            icon={<Sun className="h-6 w-6 text-yellow-500" />}
            color="yellow"
            trend={15}
          />
          <StatCard
            title="Grid Usage"
            value="1.4 kW"
            subValue="From power grid"
            icon={<BarChart2 className="h-6 w-6 text-purple-500" />}
            color="purple"
            trend={-5}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="chart-container lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Energy Consumption</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTimeRange('day')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === 'day'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === 'week'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === 'month'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="h-80 chart-animate">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsage}>
                  <defs>
                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="solar" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="url(#colorSolar)"
                    name="Solar"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="grid" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="url(#colorGrid)"
                    name="Grid"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Energy Distribution
            </h2>
            <div className="h-80 pie-chart-animate">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceUsage.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="chart-container lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Monthly Trends
            </h2>
            <div className="h-80 chart-animate">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="usage" 
                    fill="#3B82F6" 
                    name="Usage (kWh)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="cost" 
                    fill="#10B981" 
                    name="Cost ($)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Energy Insights
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-600 rotate-180" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    12% Lower Than Average
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Your usage is below monthly average
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Sun className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Solar Performance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Solar panels operating at 92% efficiency
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Peak Usage Alert
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    High consumption detected between 6-8 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Water Heater Efficiency
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Operating within optimal range
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Wind className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    HVAC Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    System running efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}