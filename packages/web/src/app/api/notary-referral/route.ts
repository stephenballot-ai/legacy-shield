import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'data', 'notary-referrals.jsonl');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notary_id, name, email, phone, message, event_type } = body;

    const entry = {
      notary_id,
      event_type: event_type || 'appointment_request',
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      referrer: req.headers.get('referer') || 'direct',
    };

    // Ensure data directory exists
    await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });

    // Append as JSONL (one JSON object per line — easy to parse, grep, and analyze)
    await fs.appendFile(LOG_PATH, JSON.stringify(entry) + '\n');

    console.log('Notary referral tracked:', entry.event_type, entry.notary_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error tracking notary referral:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve stats (protected, for internal use)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fs.readFile(LOG_PATH, 'utf-8');
    const entries = data.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

    // Aggregate stats per notary
    const stats: Record<string, { views: number; clicks: number; appointments: number }> = {};
    for (const entry of entries) {
      if (!stats[entry.notary_id]) {
        stats[entry.notary_id] = { views: 0, clicks: 0, appointments: 0 };
      }
      if (entry.event_type === 'view') stats[entry.notary_id].views++;
      else if (entry.event_type === 'click') stats[entry.notary_id].clicks++;
      else if (entry.event_type === 'appointment_request') stats[entry.notary_id].appointments++;
    }

    return NextResponse.json({
      total_events: entries.length,
      stats,
      recent: entries.slice(-20).reverse(),
    });
  } catch {
    return NextResponse.json({ total_events: 0, stats: {}, recent: [] });
  }
}
