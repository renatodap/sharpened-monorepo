import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check basic app health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Optional: Check external service connectivity
    // const supabaseHealthy = await checkSupabaseHealth();
    // health.services = { supabase: supabaseHealthy };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() 
      },
      { status: 503 }
    );
  }
}