'use client';
import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Activity,
  Cpu,
  Database,
  Wifi,
  Users,
  HardDrive,
  Check,
  Clock,
  PlayCircle,
  GripHorizontal,
  Settings,
} from 'lucide-react';

type CardId =
  | 'api-response'
  | 'server-resources'
  | 'redis-latency'
  | 'bandwidth'
  | 'streams'
  | 'active-users'
  | 'storage'
  | 'request-status'
  | 'processing-times';

interface CardVisibility {
  id: CardId;
  label: string;
  visible: boolean;
  icon: React.ReactNode;
}

interface SystemMetrics {
  apiResponse: TimeseriesData[];
  serverResources: ServerResourceData[];
  redisLatency: TimeseriesData[];
  bandwidth: TimeseriesData[];
}

interface BusinessMetrics {
  streams: TimeseriesData[];
  activeUsers: TimeseriesData[];
  storage: StorageData;
  requestStatus: StatusData[];
  processingTimes: TimeseriesData[];
}

interface TimeseriesData {
  time: string;
  value: number;
}

interface ServerResourceData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

interface StorageData {
  used: number;
  total: number;
}

interface StatusData {
  status: string;
  value: number;
}

function SortableCard({ children, id }: { children: React.ReactNode; id: CardId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <div className="relative h-full group">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-2 rounded-md opacity-0 group-hover:opacity-100 cursor-move hover:bg-gray-100 transition-opacity"
        >
          <GripHorizontal className="size-4" />
        </div>
        {children}
      </div>
    </div>
  );
}

function DashboardPage() {
  // Simulation des données en temps réel

  const [cards, setCards] = useState<CardId[]>([
    'api-response',
    'server-resources',
    'redis-latency',
    'bandwidth',
    'streams',
    'active-users',
    'storage',
    'request-status',
    'processing-times',
  ]);

  const [cardVisibility, setCardVisibility] = useState<CardVisibility[]>([
    {
      id: 'api-response',
      label: 'API Response Time',
      visible: true,
      icon: <Activity className="size-4" />,
    },
    {
      id: 'server-resources',
      label: 'Server Resources',
      visible: true,
      icon: <Cpu className="size-4" />,
    },
    {
      id: 'redis-latency',
      label: 'Redis Latency',
      visible: true,
      icon: <Database className="size-4" />,
    },
    { id: 'bandwidth', label: 'Bandwidth', visible: true, icon: <Wifi className="size-4" /> },
    { id: 'streams', label: 'Streams', visible: true, icon: <PlayCircle className="size-4" /> },
    {
      id: 'active-users',
      label: 'Active Users',
      visible: true,
      icon: <Users className="size-4" />,
    },
    { id: 'storage', label: 'Storage', visible: true, icon: <HardDrive className="size-4" /> },
    {
      id: 'request-status',
      label: 'Request Status',
      visible: true,
      icon: <Check className="size-4" />,
    },
    {
      id: 'processing-times',
      label: 'Processing Times',
      visible: true,
      icon: <Clock className="size-4" />,
    },
  ]);

  // État pour le menu de configuration
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Fonction pour toggle la visibilité d'une carte
  const toggleCardVisibility = (cardId: CardId) => {
    setCardVisibility(prev =>
      prev.map(card => (card.id === cardId ? { ...card, visible: !card.visible } : card)),
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;

    const { active, over } = event;

    if (active.id !== over.id) {
      setCards(items => {
        const oldIndex = items.indexOf(active.id as CardId);
        const newIndex = items.indexOf(over.id as CardId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderCard = (cardId: CardId) => {
    const cardComponents: Record<CardId, React.ReactNode> = {
      'api-response': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Activity className="size-6" />
              API Response Time
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={systemMetrics.apiResponse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      'server-resources': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Cpu className="size-6" />
              Server Resources
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={systemMetrics.serverResources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="disk" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      'redis-latency': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Database className="size-6" />
              Redis Latency
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={systemMetrics.redisLatency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      bandwidth: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Wifi className="size-6" />
              Bandwidth
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={systemMetrics.bandwidth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      streams: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <PlayCircle className="size-6" />
              Streams
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={businessMetrics.streams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      'active-users': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Users className="size-6" />
              Active Users
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={businessMetrics.activeUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      storage: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <HardDrive className="size-6" />
              Storage
            </CardTitle>
            <CardContent className="flex flex-col items-center justify-center">
              <PieChart width={400} height={200}>
                <Pie
                  data={[
                    { name: 'Used', value: businessMetrics.storage.used, fill: '#8884d8' },
                    {
                      name: 'Available',
                      value: businessMetrics.storage.total - businessMetrics.storage.used,
                      fill: '#82ca9d',
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  label
                />
                <Tooltip />
              </PieChart>
              <CardDescription>
                {businessMetrics.storage.used} GB used out of {businessMetrics.storage.total} GB
              </CardDescription>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      'request-status': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Check className="size-6" />
              Request Status
            </CardTitle>
            <CardContent className="flex flex-col items-center justify-center">
              <PieChart width={400} height={200}>
                <Pie
                  data={[
                    {
                      status: 'Succès',
                      value: businessMetrics.requestStatus[0].value,
                      fill: 'green',
                    },
                    {
                      status: 'Échecs',
                      value: businessMetrics.requestStatus[1].value,
                      fill: 'red',
                    },
                  ]}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  label
                />

                <Tooltip />
              </PieChart>
              <CardDescription>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[green] rounded-full"></div>
                      <span>{businessMetrics.requestStatus[0].status}</span>
                    </div>
                    <span>{businessMetrics.requestStatus[0].value}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[red] rounded-full"></div>
                      <span>{businessMetrics.requestStatus[1].status}</span>
                    </div>
                    <span>{businessMetrics.requestStatus[1].value}%</span>
                  </div>
                </div>
              </CardDescription>
            </CardContent>
          </CardHeader>
        </Card>
      ),
      'processing-times': (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Clock className="size-6" />
              Processing Times
            </CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={businessMetrics.processingTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </CardHeader>
        </Card>
      ),
    };

    return cardComponents[cardId];
  };

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    apiResponse: [],
    serverResources: [],
    redisLatency: [],
    bandwidth: [],
  });

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    streams: [],
    activeUsers: [],
    storage: { used: 75, total: 100 },
    requestStatus: [
      { status: 'Succès', value: 85 },
      { status: 'Échecs', value: 15 },
    ],
    processingTimes: [],
  });

  // Fonction pour générer des données de test
  const generateTestData = (): { system: SystemMetrics; business: BusinessMetrics } => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    const newSystemMetrics: SystemMetrics = {
      apiResponse: [
        ...systemMetrics.apiResponse.slice(-9),
        {
          time: timestamp,
          value: Math.random() * 200 + 100,
        },
      ],
      serverResources: [
        ...systemMetrics.serverResources.slice(-9),
        {
          time: timestamp,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
        },
      ],
      redisLatency: [
        ...systemMetrics.redisLatency.slice(-9),
        {
          time: timestamp,
          value: Math.random() * 10,
        },
      ],
      bandwidth: [
        ...systemMetrics.bandwidth.slice(-9),
        {
          time: timestamp,
          value: Math.random() * 1000,
        },
      ],
    };

    const newBusinessMetrics: BusinessMetrics = {
      streams: [
        ...businessMetrics.streams.slice(-9),
        {
          time: timestamp,
          value: Math.floor(Math.random() * 1000),
        },
      ],
      activeUsers: [
        ...businessMetrics.activeUsers.slice(-9),
        {
          time: timestamp,
          value: Math.floor(Math.random() * 500),
        },
      ],
      storage: {
        used: Math.floor(Math.random() * 20 + 70),
        total: 100,
      },
      requestStatus: [
        { status: 'Succès', value: Math.floor(Math.random() * 10 + 85) },
        { status: 'Échecs', value: Math.floor(Math.random() * 10 + 5) },
      ],
      processingTimes: [
        ...businessMetrics.processingTimes.slice(-9),
        {
          time: timestamp,
          value: Math.floor(Math.random() * 60 + 30),
        },
      ],
    };

    return { system: newSystemMetrics, business: newBusinessMetrics };
  };

  // Mise à jour des données toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const { system, business } = generateTestData();
      setSystemMetrics(system);
      setBusinessMetrics(business);
    }, 2000);

    return () => clearInterval(interval);
  }, [systemMetrics, businessMetrics]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome to the dashboard</p>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            <Settings className="size-4" />
            Configure Dashboard
          </Button>

          {isConfigOpen && (
            <Card className="absolute right-0 mt-2 w-80 z-50">
              <CardHeader>
                <CardTitle>Visible Charts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cardVisibility.map(card => (
                  <div key={card.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={card.id}
                      checked={card.visible}
                      onCheckedChange={() => toggleCardVisibility(card.id)}
                    />
                    <div className="flex items-center gap-2">
                      {card.icon}
                      <label htmlFor={card.id} className="text-sm font-medium">
                        {card.label}
                      </label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SortableContext
            items={cards.filter(cardId => cardVisibility.find(card => card.id === cardId)?.visible)}
            strategy={rectSortingStrategy}
          >
            {cards
              .filter(cardId => cardVisibility.find(card => card.id === cardId)?.visible)
              .map(cardId => (
                <SortableCard key={cardId} id={cardId}>
                  {renderCard(cardId)}
                </SortableCard>
              ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}

export default DashboardPage;
