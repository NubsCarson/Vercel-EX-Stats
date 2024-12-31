import { NextResponse } from 'next/server';

interface Deployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: string;
  creator?: {
    username: string;
  };
  meta?: {
    buildingAt?: number;
    completedAt?: number;
  };
}

interface DeploymentWithBuild extends Deployment {
  buildDuration?: number;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = process.env.VERCEL_ACCESS_TOKEN?.trim();

    if (!token) {
      console.error('Missing VERCEL_ACCESS_TOKEN');
      return NextResponse.json(
        { error: 'Missing VERCEL_ACCESS_TOKEN environment variable' },
        { status: 500 }
      );
    }

    // First try to find the deployment if the ID looks like a URL
    if (id.includes('.vercel.app')) {
      console.log('Looking up deployment by URL:', id);
      const encodedUrl = encodeURIComponent(id);
      
      try {
        // Try to get the deployment directly by URL
        const deploymentResponse = await fetch(
          `https://api.vercel.com/v13/deployments/get?url=${encodedUrl}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const deploymentData = await deploymentResponse.json();
        console.log('Deployment lookup response:', {
          status: deploymentResponse.status,
          data: deploymentData
        });
        
        if (deploymentResponse.ok && deploymentData.projectId) {
          return NextResponse.redirect(new URL(`/api/projects/${deploymentData.projectId}`, request.url));
        }
      } catch (error) {
        console.error('Error looking up deployment:', error);
      }

      try {
        // If that fails, try searching for deployments
        const searchResponse = await fetch(
          `https://api.vercel.com/v6/deployments?url=${encodedUrl}&target=production`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const searchData = await searchResponse.json();
        console.log('Deployment search response:', {
          status: searchResponse.status,
          data: searchData
        });
        
        if (searchResponse.ok && searchData.deployments?.length > 0) {
          const projectId = searchData.deployments[0].projectId;
          if (projectId) {
            return NextResponse.redirect(new URL(`/api/projects/${projectId}`, request.url));
          }
        }
      } catch (error) {
        console.error('Error searching deployments:', error);
      }

      return NextResponse.json(
        { error: 'Could not find project for this deployment URL' },
        { status: 404 }
      );
    }

    console.log('Fetching project details for ID:', id);
    // Fetch project details
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(id)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const projectData = await projectResponse.json();
    console.log('Project details response:', {
      status: projectResponse.status,
      data: projectData
    });

    if (!projectResponse.ok) {
      return NextResponse.json(
        { 
          error: projectData.error?.message || 'Failed to fetch project',
          details: projectData 
        },
        { status: projectResponse.status }
      );
    }

    // Fetch project deployments
    const deploymentsResponse = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(id)}&limit=10&state=READY&target=production`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const deploymentsData = await deploymentsResponse.json();
    console.log('Deployments response:', {
      status: deploymentsResponse.status,
      count: deploymentsData.deployments?.length || 0
    });

    if (!deploymentsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch deployments', details: deploymentsData },
        { status: deploymentsResponse.status }
      );
    }

    // Calculate deployment stats and build times
    try {
      for (const deployment of deploymentsData.deployments || []) {
        // Calculate build duration from meta data
        if (deployment.meta?.buildingAt && deployment.meta?.completedAt) {
          deployment.buildDuration = Math.round((deployment.meta.completedAt - deployment.meta.buildingAt) / 1000);
        }
      }
    } catch (error) {
      console.error('Error processing deployments:', error);
    }

    // Calculate deployment stats
    const deploymentStats = {
      total: deploymentsData.deployments?.length || 0,
      successful: deploymentsData.deployments?.filter((d: DeploymentWithBuild) => d.state === 'READY').length || 0,
      failed: deploymentsData.deployments?.filter((d: DeploymentWithBuild) => d.state === 'ERROR').length || 0,
      averageBuildTime: deploymentsData.deployments?.reduce((sum: number, d: DeploymentWithBuild) => sum + (d.buildDuration || 0), 0) / 
                       (deploymentsData.deployments?.length || 1),
      deploymentsByState: deploymentsData.deployments?.reduce((acc: Record<string, number>, d: DeploymentWithBuild) => {
        acc[d.state] = (acc[d.state] || 0) + 1;
        return acc;
      }, {}),
      recentBuildTimes: deploymentsData.deployments?.map((d: DeploymentWithBuild) => ({
        name: d.name || 'Deployment',
        buildTime: d.buildDuration || 0,
        timestamp: d.created
      })).filter((d: { buildTime: number }) => d.buildTime > 0)
    };

    // Combine all data
    const projectDetails = {
      ...projectData,
      latestDeployments: deploymentsData.deployments || [],
      stats: deploymentStats
    };

    return NextResponse.json(projectDetails);
  } catch (error: any) {
    console.error('Project details fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project details', 
        details: { 
          message: error?.message || 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        } 
      },
      { status: 500 }
    );
  }
} 