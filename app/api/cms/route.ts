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

    // Try Supabase first, fallback to filesystem
    const data = await getCMSData();

    if (section && data[section]) {
      return NextResponse.json({ [section]: data[section] });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    // Provide more helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch CMS data',
        details: errorMessage,
        note: 'Make sure data/cms-data.json exists in your project or Supabase is configured'
      },
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
      const updatedData = await updateCMSData(section as keyof CMSData, sectionData);

      return NextResponse.json({
        success: true,
        message: `${section} updated successfully`,
        data: updatedData[section as keyof CMSData],
      });
    } catch (error: any) {
      // Handle errors
      if (error?.message?.includes('READ_ONLY_FILESYSTEM') ||
          error?.code === 'EACCES' ||
          error?.code === 'EROFS') {
        console.error('File system write error:', error);
        return NextResponse.json(
          {
            error: 'This hosting platform uses a read-only file system. Please configure Supabase by adding SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.',
            code: 'READ_ONLY_FILESYSTEM',
            suggestion: 'Add Supabase credentials to enable CMS updates on serverless hosting.'
          },
          { status: 503 }
        );
      }
      throw error;
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
      await saveCMSData(fullData);

      return NextResponse.json({
        success: true,
        message: 'CMS data updated successfully',
      });
    } catch (error: any) {
      // Handle errors
      if (error?.message?.includes('READ_ONLY_FILESYSTEM') ||
          error?.code === 'EACCES' ||
          error?.code === 'EROFS') {
        console.error('File system write error:', error);
        return NextResponse.json(
          {
            error: 'This hosting platform uses a read-only file system. Please configure Supabase by adding SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.',
            code: 'READ_ONLY_FILESYSTEM',
            suggestion: 'Add Supabase credentials to enable CMS updates on serverless hosting.'
          },
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating CMS data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update CMS data' },
      { status: 500 }
    );
  }
}
