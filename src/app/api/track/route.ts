import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory storage for visitor data
const visitorData: Record<string, {
  visitors: Array<{
    ip: string;
    visits: number;
    lastSeen: string;
    userAgent: string;
    paths: string[];
    referrers: string[];
    countries: string[];
    devices: string[];
    browsers: string[];
  }>;
  totalVisits: number;
  firstVisit: string | null;
  lastVisit: string | null;
  stats: {
    devices: Record<string, number>;
    browsers: Record<string, number>;
    countries: Record<string, number>;
    paths: Record<string, number>;
  };
}> = {};

function parseUserAgent(userAgent: string) {
  const device = userAgent.match(/\((.*?)\)/)?.[1] || 'Unknown Device';
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown Browser';
  return { device, browser };
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const projectId = request.headers.get('x-vercel-project-id');
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const referer = request.headers.get('referer') || 'Direct';
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const { pathname } = new URL(request.url);

    if (!projectId) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    // Initialize project data if it doesn't exist
    if (!visitorData[projectId]) {
      visitorData[projectId] = {
        visitors: [],
        totalVisits: 0,
        firstVisit: null,
        lastVisit: null,
        stats: {
          devices: {},
          browsers: {},
          countries: {},
          paths: {}
        }
      };
    }

    const project = visitorData[projectId];
    const now = new Date().toISOString();

    // Update first and last visit times
    if (!project.firstVisit) {
      project.firstVisit = now;
    }
    project.lastVisit = now;

    // Parse user agent
    const { device, browser } = parseUserAgent(userAgent);

    // Update visitor data
    let visitor = project.visitors.find(v => v.ip === ip);
    if (visitor) {
      visitor.visits++;
      visitor.lastSeen = now;
      visitor.paths = [...new Set([...visitor.paths, pathname])];
      visitor.referrers = [...new Set([...visitor.referrers, referer])];
      visitor.countries = [...new Set([...visitor.countries, country])];
      visitor.devices = [...new Set([...visitor.devices, device])];
      visitor.browsers = [...new Set([...visitor.browsers, browser])];
    } else {
      visitor = {
        ip,
        visits: 1,
        lastSeen: now,
        userAgent,
        paths: [pathname],
        referrers: [referer],
        countries: [country],
        devices: [device],
        browsers: [browser]
      };
      project.visitors.push(visitor);
    }

    // Update total visits
    project.totalVisits++;

    // Update stats
    project.stats.devices[device] = (project.stats.devices[device] || 0) + 1;
    project.stats.browsers[browser] = (project.stats.browsers[browser] || 0) + 1;
    project.stats.countries[country] = (project.stats.countries[country] || 0) + 1;
    project.stats.paths[pathname] = (project.stats.paths[pathname] || 0) + 1;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const project = visitorData[projectId];
    if (!project) {
      return NextResponse.json({
        visitors: [],
        totalVisits: 0,
        firstVisit: null,
        lastVisit: null,
        stats: {
          devices: {},
          browsers: {},
          countries: {},
          paths: {}
        }
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 