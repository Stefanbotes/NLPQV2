// API route to export individual assessment report (immediate client download)
// app/api/exports/tier1-client/route.ts  <-- put this where you want it to live

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import { schemaToPublic, schemaToHealthy } from '@/lib/tier1-persona-copy';
import { renderTier1HTML } from '@/lib/tier1/generate-html';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Expecting the client to POST: { bioData, responses, completedAt }
    const { bioData, responses, completedAt } = await req.json();

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'Missing responses' }, { status: 400 });
    }

    const participantName =
      (bioData?.name as string) ||
      `${bioData?.firstName ?? ''} ${bioData?.lastName ?? ''}`.trim() ||
      bioData?.email ||
      'User';

    // 1) Canonical scoring (now supports 1..6 scale)
    const { rankedScores, display } = await scoreAssessmentResponses(responses);

    // 2) Pick top 3 (adds 'caution' flag if below threshold)
    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    // 3) Build cards for the shared Tier-1 HTML renderer
    const primaryCard = primary && {
      schema: primary.schemaLabel,
      publicName: schemaToPublic(primary.schemaLabel),
      healthy: schemaToHealthy(primary.schemaLabel) ?? undefined,
      score: primary.index0to100,      // renderer expects 0..100 here (we display as /100)
      emerging: (primary as any).caution || false,
    };

    const secondaryCard = secondary && {
      schema: secondary.schemaLabel,
      publicName: schemaToPublic(secondary.schemaLabel),
      healthy: schemaToHealthy(secondary.schemaLabel) ?? undefined,
      score: secondary.index0to100,
      emerging: (secondary as any).caution || false,
    };

    const tertiaryCard = tertiary && {
      schema: tertiary.schemaLabel,
      publicName: schemaToPublic(tertiary.schemaLabel),
      healthy: schemaToHealthy(tertiary.schemaLabel) ?? undefined,
      score: tertiary.index0to100,
      emerging: (tertiary as any).caution || false,
    };

    // 4) Render the same HTML as admin flow
    const html = renderTier1HTML({
      participantName,
      completedAt: completedAt || new Date(),
      totalQuestions: Object.keys(responses).length,
      primary: primaryCard,
      secondary: secondaryCard,
      tertiary: tertiaryCard,
      topDisplay: display.map(d => ({
        schemaLabel: d.schemaLabel,
        displayIndex: d.displayIndex,
      })),
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Leadership_Summary_${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.html"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Tier1 client export error:', err);
    return NextResponse.json({ error: err?.message || 'Export failed' }, { status: 500 });
  }
}
