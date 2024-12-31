import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();

  if (!token) {
    return NextResponse.json(
      { error: 'Missing VERCEL_ACCESS_TOKEN environment variable' },
      { status: 500 }
    );
  }

  try {
    // Fetch projects from Vercel API
    const projectsResponse = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const projectsData = await projectsResponse.json();

    if (!projectsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: projectsData },
        { status: projectsResponse.status }
      );
    }

    // For each project, fetch recent deployments
    const projectsWithDeployments = await Promise.all(
      projectsData.projects.map(async (project: any) => {
        const deploymentsResponse = await fetch(
          `https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const deploymentsData = await deploymentsResponse.json();
        return {
          ...project,
          latestDeployments: deploymentsResponse.ok ? deploymentsData.deployments : [],
        };
      })
    );

    return NextResponse.json({ projects: projectsWithDeployments });
  } catch (error: any) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects', 
        details: { message: error?.message || 'Unknown error' } 
      },
      { status: 500 }
    );
  }
} 