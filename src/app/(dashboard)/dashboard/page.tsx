'use client';
import React, { useEffect, useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Cpu, Database, Wifi } from 'lucide-react';

type Props = {};

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

function DashboardPage({}: Props) {
  // Simulation des données en temps réel

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
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to the dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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
      </div>
    </div>
  );
}

export default DashboardPage;
