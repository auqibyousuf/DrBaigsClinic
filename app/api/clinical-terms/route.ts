import { NextRequest, NextResponse } from 'next/server';
import { searchClinicalTerms, recordClinicalTermUsage, type ClinicalTermCategory } from '@/lib/clinical-terms';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('cms-auth')?.value;
  const expectedToken = process.env.CMS_AUTH_TOKEN || 'dev-token';
  return sessionToken === expectedToken || authHeader === `Bearer ${expectedToken}`;
}

const VALID_CATEGORIES: ClinicalTermCategory[] = [
  'symptom',
  'examination',
  'diagnosis',
  'medication',
  'investigation',
  'advice',
];

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as ClinicalTermCategory | null;
  const query = searchParams.get('query') || '';

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'A valid category is required' }, { status: 400 });
  }

  try {
    const terms = await searchClinicalTerms(category, query);
    return NextResponse.json({ terms });
  } catch (error) {
    console.error('Search clinical terms error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search terms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { category, value } = await request.json();
    if (!category || !VALID_CATEGORIES.includes(category) || !value) {
      return NextResponse.json({ error: 'category and value are required' }, { status: 400 });
    }
    await recordClinicalTermUsage(category, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record clinical term usage error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record term' },
      { status: 500 }
    );
  }
}
