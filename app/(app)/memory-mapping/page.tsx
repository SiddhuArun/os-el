'use client';

import { useEffect, useState } from 'react';

interface MemoryMapping {
  address: string;
  permissions: string;
  offset: string;
  device: string;
  inode: string;
  pathname?: string;
}

export default function MemoryMappingPage() {
  const [mappings, setMappings] = useState<MemoryMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const response = await fetch('/api/memory-mapping');
        if (!response.ok) {
          throw new Error('Failed to fetch memory mappings');
        }
        const data = await response.json();
        console.log('Received data:', data);
        setMappings(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
    const interval = setInterval(fetchMappings, 5000);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Virtual Memory Mapping</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pathname</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mappings.map((mapping, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{mapping.address}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${mapping.permissions.includes('w') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mapping.permissions}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{mapping.offset}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{mapping.device}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{mapping.inode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mapping.pathname || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 