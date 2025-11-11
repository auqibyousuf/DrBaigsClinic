import { NextRequest, NextResponse } from 'next/server';
import { getCMSData, saveCMSData, updateCMSData, CMSData } from '@/lib/cms';

// Simple authentication check (in production, use proper auth)
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';

  // For development, you can set a simple password
  // In production, implement proper JWT or session-based auth
  const isTokenValid = sessionToken === expectedToken ||
                       authHeader === `Bearer ${expectedToken}`;

  if (!isTokenValid) {
    console.log('Auth check failed - Token:', sessionToken, 'Expected:', expectedToken);
  }

  return isTokenValid;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as keyof CMSData | null;

    const data = getCMSData();

    if (section && data[section]) {
      return NextResponse.json({ [section]: data[section] });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CMS data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { section, data: sectionData } = body;

    if (!section || !sectionData) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    try {
      const updatedData = updateCMSData(section as keyof CMSData, sectionData);

      return NextResponse.json({
        success: true,
        message: `${section} updated successfully`,
        data: updatedData[section as keyof CMSData],
      });
    } catch (fsError: any) {
      // Handle filesystem write errors (e.g., on serverless hosting)
      if (fsError?.message?.includes('READ_ONLY_FILESYSTEM') ||
          fsError?.code === 'EACCES' ||
          fsError?.code === 'EROFS' ||
          process.env.VERCEL === '1' ||
          process.env.NETLIFY === 'true') {
        console.error('File system write error (serverless environment):', fsError);

        // For serverless environments, we need to use a database or cloud storage
        // For now, return a helpful error message
        return NextResponse.json(
          {
            error: 'This hosting platform uses a read-only file system. To enable CMS updates, please set up a database (PostgreSQL, MongoDB, Supabase, etc.) or use cloud storage. The current setup works on traditional hosting (VPS, shared hosting) where file writes are allowed.',
            code: 'READ_ONLY_FILESYSTEM',
            suggestion: 'For serverless hosting, consider using Supabase (free tier), Vercel KV, or MongoDB Atlas. Contact your developer to set this up.'
          },
          { status: 503 }
        );
      }
      throw fsError;
    }
  } catch (error) {
    console.error('Error updating CMS data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update CMS data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const fullData = body as CMSData;

    try {
      saveCMSData(fullData);

      return NextResponse.json({
        success: true,
        message: 'CMS data updated successfully',
      });
    } catch (fsError: any) {
      // Handle filesystem write errors (e.g., on serverless hosting)
      if (fsError?.message?.includes('READ_ONLY_FILESYSTEM') ||
          fsError?.code === 'EACCES' ||
          fsError?.code === 'EROFS' ||
          process.env.VERCEL === '1' ||
          process.env.NETLIFY === 'true') {
        console.error('File system write error (serverless environment):', fsError);

        // For serverless environments, we need to use a database or cloud storage
        return NextResponse.json(
          {
            error: 'This hosting platform uses a read-only file system. To enable CMS updates, please set up a database (PostgreSQL, MongoDB, Supabase, etc.) or use cloud storage. The current setup works on traditional hosting (VPS, shared hosting) where file writes are allowed.',
            code: 'READ_ONLY_FILESYSTEM',
            suggestion: 'For serverless hosting, consider using Supabase (free tier), Vercel KV, or MongoDB Atlas. Contact your developer to set this up.'
          },
          { status: 503 }
        );
      }
      throw fsError;
    }
  } catch (error) {
    console.error('Error updating CMS data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update CMS data' },
      { status: 500 }
    );
  }
}
