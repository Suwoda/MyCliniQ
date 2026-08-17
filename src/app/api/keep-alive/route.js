import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('drugs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful',
      drugCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
