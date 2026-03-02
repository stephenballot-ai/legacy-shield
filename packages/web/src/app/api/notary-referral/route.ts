import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notary_id, timestamp, user_agent, referrer } = body;

    // For MVP: Just log to console
    // In production, you would save this to a database or append to a JSON log file
    console.log('Notary Referral Tracking:', {
      notary_id,
      timestamp,
      user_agent,
      referrer,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });

    // Optional: Append to a JSON log file (commented out for MVP)
    // const fs = require('fs').promises;
    // const logPath = './logs/notary-referrals.json';
    // const logEntry = {
    //   notary_id,
    //   timestamp,
    //   user_agent,
    //   referrer,
    //   ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    // };
    // try {
    //   const existingLogs = await fs.readFile(logPath, 'utf-8');
    //   const logs = JSON.parse(existingLogs);
    //   logs.push(logEntry);
    //   await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
    // } catch {
    //   await fs.writeFile(logPath, JSON.stringify([logEntry], null, 2));
    // }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error tracking notary referral:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
