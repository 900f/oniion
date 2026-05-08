import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Only allow tracking homepage visits
    if (body.path !== '/') {
      return NextResponse.json({ ignored: true });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip =
      forwarded?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'Unknown';

    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await fetch(process.env.DISCORD_WEBHOOK!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: '🌐 New Oniion.cc Visitor',
            color: 0xa855f7,
            fields: [
              {
                name: 'IP',
                value: `\`${ip}\``,
                inline: true,
              },
              {
                name: 'Path',
                value: body.path,
                inline: true,
              },
              {
                name: 'User Agent',
                value: userAgent.slice(0, 1000),
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}