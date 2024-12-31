'use client';

import { Card, Title, Text, Grid, Metric, Button } from '@tremor/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  latestDeployments: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Loading Statistics...</Title>
        <Text>Fetching your Vercel deployment data</Text>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="mb-8">
        <Title>Your Projects</Title>
        <Text>Overview of your Vercel deployments</Text>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl divide-y divide-gray-800">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="group hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Text className="font-medium text-white">{project.name}</Text>
                  <Text className="text-sm text-gray-400">
                    {project.latestDeployments?.length || 0} deployments
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  size="xs" 
                  variant="secondary"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white hover:bg-gray-700"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="p-4 text-center text-gray-400">
            <Text>No projects found</Text>
          </div>
        )}
      </div>
    </main>
  );
} 