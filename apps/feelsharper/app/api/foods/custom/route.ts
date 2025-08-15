import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/foods/custom - List user's custom foods (MVP: Mock data)
export async function GET(request: NextRequest) {
  try {
    // MVP: Return empty array since we're using mock data for testing
    return NextResponse.json({ foods: [] });
  } catch (error) {
    console.error('Error fetching custom foods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/foods/custom - Create new custom food (MVP: Mock response)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // MVP: Return mock success response
    return NextResponse.json({ 
      food: {
        id: Date.now(),
        name: body.name,
        brand: body.brand || null,
        ...body
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Custom foods POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}