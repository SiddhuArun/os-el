'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface MemoryStats {
  fragmentation_index: number;
  fault_rate: number;
  pressure_score: number;
  swap_usage_percent: number;
  major_faults: number;
  minor_faults: number;
  memory_usage: number;
  total_memory: number;
  free_memory: number;
}

export default function MemoryAnalysisPage() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/memory-analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch memory stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

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

  if (!stats) {
    return null;
  }

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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Memory Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Memory Usage</h2>
          <div className="space-y-2">
            <p>Total: {formatBytes(stats.total_memory)}</p>
            <p>Used: {formatBytes(stats.memory_usage)}</p>
            <p>Free: {formatBytes(stats.free_memory)}</p>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Memory Health</h2>
          <div className="space-y-2">
            <p>Fragmentation: {(stats.fragmentation_index * 100).toFixed(1)}%</p>
            <p>Pressure Score: {(stats.pressure_score * 100).toFixed(1)}%</p>
            <p>Swap Usage: {stats.swap_usage_percent}%</p>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Page Faults</h2>
          <div className="space-y-2">
            <p>Major Faults: {stats.major_faults}</p>
            <p>Minor Faults: {stats.minor_faults}</p>
            <p>Fault Rate: {stats.fault_rate.toFixed(2)}/s</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
