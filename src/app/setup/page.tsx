'use client';

import { useState } from 'react';
import { Card, Title, Text, Button, TextInput } from '@tremor/react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');

  const trackingScript = `<script>
  (function() {
    const projectId = '${projectId}';
    const trackVisit = () => {
      fetch('${process.env.NEXT_PUBLIC_APP_URL}/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-project-id': projectId
        }
      }).catch(console.error);
    };
    trackVisit();
    setInterval(trackVisit, 60000); // Track every minute
  })();
</script>`;

  return (
    <main className="min-h-screen bg-[#0A1120]">
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Title className="text-white text-2xl font-bold">Setup Tracking</Title>
            <Text className="text-gray-400">Add visitor tracking to your Vercel site</Text>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#111827] border-0">
            <Title className="text-white mb-4">1. Enter Your Project ID</Title>
            <div className="space-y-4">
              <Text className="text-gray-400">
                You can find your Project ID in your Vercel project settings or deployment URL.
              </Text>
              <TextInput
                placeholder="Enter your Vercel Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-[#1D2432] border-0 text-white placeholder-gray-500"
              />
            </div>
          </Card>

          <Card className="bg-[#111827] border-0">
            <Title className="text-white mb-4">2. Add Tracking Script</Title>
            <div className="space-y-4">
              <Text className="text-gray-400">
                Add this script to your site's <code className="text-blue-400">&lt;head&gt;</code> tag:
              </Text>
              <div className="bg-[#1D2432] p-4 rounded-lg">
                <pre className="text-gray-300 whitespace-pre-wrap break-all">
                  {projectId ? trackingScript : 'Enter your Project ID above to get the tracking script'}
                </pre>
              </div>
              {projectId && (
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(trackingScript)}
                  className="bg-[#1D2432] text-white hover:bg-[#2D3442] border-0"
                >
                  Copy to Clipboard
                </Button>
              )}
            </div>
          </Card>

          <Card className="bg-[#111827] border-0">
            <Title className="text-white mb-4">3. View Your Stats</Title>
            <div className="space-y-4">
              <Text className="text-gray-400">
                Once you've added the tracking script, you can view your visitor statistics here:
              </Text>
              <Button
                variant="secondary"
                onClick={() => projectId && router.push(`/dashboard/project/${projectId}`)}
                disabled={!projectId}
                className="bg-[#1D2432] text-white hover:bg-[#2D3442] border-0 disabled:opacity-50"
              >
                View Stats
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
} 