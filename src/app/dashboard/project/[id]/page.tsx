'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text, Grid, Metric, AreaChart, Button, Badge, List, ListItem, Tab, TabList, TabGroup, TabPanel, TabPanels } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface VisitorData {
  ip: string;
  visits: number;
  lastSeen: string;
  userAgent: string;
  paths: string[];
  referrers: string[];
  countries: string[];
  devices: string[];
  browsers: string[];
}

interface Stats {
  devices: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
  paths: Record<string, number>;
}

interface ProjectStats {
  visitors: VisitorData[];
  totalVisits: number;
  firstVisit: string | null;
  lastVisit: string | null;
  stats: Stats;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/track?projectId=${encodeURIComponent(resolvedParams.id)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch stats');
        }

        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    }

    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    fetchStats(); // Initial fetch

    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0A1120]">
        <div className="p-4 md:p-10 mx-auto max-w-7xl">
          <Title className="text-white">Loading Stats...</Title>
          <Text className="text-gray-400">Fetching visitor data</Text>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A1120]">
        <div className="p-4 md:p-10 mx-auto max-w-7xl">
          <div className="bg-[#111827] rounded-lg p-6">
            <Title className="text-white">Error</Title>
            <Text className="text-red-400 mt-2">{error}</Text>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/setup')}
              className="bg-[#1D2432] text-white hover:bg-[#2D3442] border-0 mt-4"
            >
              Back to Setup
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen bg-[#0A1120]">
        <div className="p-4 md:p-10 mx-auto max-w-7xl">
          <div className="bg-[#111827] rounded-lg p-6">
            <Title className="text-white">No Data Yet</Title>
            <Text className="text-gray-400">Waiting for visitor data to come in</Text>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/setup')}
              className="bg-[#1D2432] text-white hover:bg-[#2D3442] border-0 mt-4"
            >
              Back to Setup
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A1120]">
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Title className="text-white text-2xl font-bold">Visitor Stats</Title>
            <Text className="text-gray-400">Real-time visitor tracking</Text>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/setup')}
            className="bg-[#1D2432] text-white hover:bg-[#2D3442] border-0"
          >
            Back to Setup
          </Button>
        </div>

        {/* Overview Stats */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
          <Card className="bg-[#111827] border-0">
            <Text className="text-gray-400">Total Visitors</Text>
            <Metric className="text-white">{stats.visitors.length}</Metric>
          </Card>
          <Card className="bg-[#111827] border-0">
            <Text className="text-gray-400">Total Visits</Text>
            <Metric className="text-white">{stats.totalVisits}</Metric>
          </Card>
          <Card className="bg-[#111827] border-0">
            <Text className="text-gray-400">Active Now</Text>
            <Metric className="text-white">
              {stats.visitors.filter(v => new Date(v.lastSeen).getTime() > Date.now() - 5 * 60 * 1000).length}
            </Metric>
          </Card>
          <Card className="bg-[#111827] border-0">
            <Text className="text-gray-400">Avg. Visit Duration</Text>
            <Metric className="text-white">2m 30s</Metric>
          </Card>
        </Grid>

        {/* Device Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#111827] border-0">
            <Title className="text-white mb-4">Devices</Title>
            <div className="space-y-2">
              {Object.entries(stats.stats.devices).map(([device, count]) => (
                <div key={device} className="flex justify-between items-center">
                  <Text className="text-gray-400">{device}</Text>
                  <div className="flex items-center">
                    <Text className="text-white mr-2">{count}</Text>
                    <Text className="text-gray-500">
                      ({Math.round(count / stats.totalVisits * 100)}%)
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#111827] border-0">
            <Title className="text-white mb-4">Browsers</Title>
            <div className="space-y-2">
              {Object.entries(stats.stats.browsers).map(([browser, count]) => (
                <div key={browser} className="flex justify-between items-center">
                  <Text className="text-gray-400">{browser}</Text>
                  <div className="flex items-center">
                    <Text className="text-white mr-2">{count}</Text>
                    <Text className="text-gray-500">
                      ({Math.round(count / stats.totalVisits * 100)}%)
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Visitors */}
        <Card className="bg-[#111827] border-0">
          <Title className="text-white mb-4">Recent Visitors</Title>
          <div className="space-y-4">
            {stats.visitors.map((visitor) => (
              <div 
                key={visitor.ip} 
                className="bg-[#1D2432] p-4 rounded-lg hover:bg-[#2D3442] transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Text className="text-white font-medium">{visitor.ip}</Text>
                    <Text className="text-sm text-gray-400">
                      {visitor.visits} visits • Last seen: {new Date(visitor.lastSeen).toLocaleString()}
                    </Text>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500">
                    {visitor.countries[0] || 'Unknown'}
                  </Badge>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div>
                    <Text className="text-sm text-gray-400 mb-1">Device:</Text>
                    <div className="flex flex-wrap gap-2">
                      {visitor.devices.map((device, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-[#111827] text-gray-300 px-2 py-1 rounded"
                        >
                          {device}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Text className="text-sm text-gray-400 mb-1">Pages Visited:</Text>
                    <div className="flex flex-wrap gap-2">
                      {visitor.paths.map((path, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-[#111827] text-gray-300 px-2 py-1 rounded"
                        >
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
} 