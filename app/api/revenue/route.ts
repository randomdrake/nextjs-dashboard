import { NextResponse } from 'next/server';
import { fetchRevenue } from 'app/lib/data';

export async function GET() {
  try {
    const revenue = await fetchRevenue();
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}