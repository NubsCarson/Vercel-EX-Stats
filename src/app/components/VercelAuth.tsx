'use client';

import { Button } from '@tremor/react';
import { SiVercel } from 'react-icons/si';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VercelAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        const errorMessage = data.error || 'Authentication failed';
        const details = data.details?.error?.message || 'No additional details';
        alert(`${errorMessage}\n${details}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Failed to connect to the authentication service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button
        size="xl"
        onClick={checkAuth}
        icon={SiVercel}
        className="w-full max-w-sm"
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Connect with Vercel Token'}
      </Button>
      <p className="text-sm text-gray-500">
        Using Personal Access Token for authentication
      </p>
    </div>
  );
} 