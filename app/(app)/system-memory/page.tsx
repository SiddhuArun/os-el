'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface MemoryInfo {
  MemTotal: number;
  MemFree: number;
  MemAvailable: number;
  Buffers: number;
  Cached: number;
  SwapTotal: number;
  SwapFree: number;
  Active: number;
  Inactive: number;
  [key: string]: number;
}

export default function SystemMemoryPage() {
  const [memInfo, setMemInfo] = useState<MemoryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemInfo = async () => {
      try {
        const response = await fetch('/api/system-memory');
        if (!response.ok) {
          throw new Error('Failed to fetch system memory info');
        }
        console.log(response.body);
        const data = await response.json();
        setMemInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMemInfo();
    const interval = setInterval(fetchMemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!memInfo) return null;

  const memoryCategories = [
    {
      title: 'Physical Memory',
      items: [
        { label: 'Total Memory', value: memInfo.MemTotal },
        { label: 'Free Memory', value: memInfo.MemFree },
        { label: 'Available Memory', value: memInfo.MemAvailable },
        { label: 'Buffers', value: memInfo.Buffers },
        { label: 'Cached', value: memInfo.Cached },
      ],
    },
    {
      title: 'Swap Memory',
      items: [
        { label: 'Total Swap', value: memInfo.SwapTotal },
        { label: 'Free Swap', value: memInfo.SwapFree },
        { label: 'Swap Cached', value: memInfo.SwapCached },
      ],
    },
    {
      title: 'Memory States',
      items: [
        { label: 'Active', value: memInfo.Active },
        { label: 'Inactive', value: memInfo.Inactive },
        { label: 'Active (anon)', value: memInfo.Active_anon },
        { label: 'Inactive (anon)', value: memInfo.Inactive_anon },
        { label: 'Active (file)', value: memInfo.Active_file },
        { label: 'Inactive (file)', value: memInfo.Inactive_file },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Memory Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memoryCategories.map((category) => (
          <Card key={category.title} className="p-4">
            <h2 className="text-lg font-semibold mb-2">{category.title}</h2>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}:</span>
                  <span className="font-mono">{formatBytes(item.value || 0)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
