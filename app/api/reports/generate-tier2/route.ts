import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import { schemaToPublic, schemaToHealthy } from '@/lib/tier2-persona-copy';
import { renderTier1HTML } from '@/lib/tier1/generate-html';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    let responses: Record<string, string | number> | undefined;
    let participantName = 'User';
    let completedAt: Date | string | undefined;

    console.log('🔍 Tier 1 API called with:', { 
      hasResponses: !!body?.responses, 
      hasUserIdAssessmentId: !!(body?.userId && body?.assessmentId),
      bodyKeys: Object.keys(body || {})
    });

    // Pattern 1: Direct responses (client completion callback)
    if (body?.responses) {
      const rawResponses = body.responses;
      const processed: Record<string, string | number> = {};

      for (const [key, response] of Object.entries(rawResponses)) {
        if (typeof response === 'object' && response !== null && 'value' in response) {
          const val = (response as any).value;
          if (typeof val === 'string' || typeof val === 'number') processed[key] = val;
        } else if (typeof response === 'string' || typeof response === 'number') {
          processed[key] = response;
        }
      }

      responses = processed;
      participantName = body?.participantData?.name || body?.participant?.name || 'User';
      completedAt = body?.completedAt || new Date();
    }
    // Pattern 2: Admin lookup (userId + assessmentId)
    else if (body?.userId && body?.assessmentId) {
      // NOTE: if your Prisma model is `user`, change to db.user
      const user = await db.users.findUnique({
        where: { id: body.userId },
        include: {
          assessments: {
            where: { id: body.assessmentId },
            take: 1
          }
        }
      });

      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const assessment = user.assessments?.[0];
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

      if (assessment.status !== 'COMPLETED' || !assessment.responses) {
        return NextResponse.json({ error: 'Assessment not completed or has no responses' }, { status: 400 });
      }

      let raw: Record<string, any>;
      try {
        raw = typeof assessment.responses === 'string' 
          ? JSON.parse(assessment.responses) 
          : (assessment.responses as Record<string, any>);
      } catch {
        return NextResponse.json({ error: 'Invalid response format in assessment' }, { status: 400 });
      }

      const processed: Record<string, string | number> = {};
      for (const [key, response] of Object.entries(raw)) {
        if (typeof response === 'object' && response !== null && 'value' in response) {
          const val = (response as any).value;
          if (typeof val === 'string' || typeof val === 'number') processed[key] = val;
        } else if (typeof response === 'string' || typeof response === 'number') {
          processed[key] = response;
        }
      }

      responses = processed;
      participantName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
      completedAt = assessment.completedAt || new Date();
    }
    // Pattern 3: invalid input
    else {
      return NextResponse.json({ 
        error: 'Either responses or userId/assessmentId required for Tier 1 report generation' 
      }, { status: 400 });
    }

    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    // Canonical scoring
    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      return NextResponse.json({ error: 'No scores computed (check item IDs vs mapping)' }, { status: 400 });
    }

    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    // JSON debug mode
    if (format === 'json') {
      return NextResponse.json({
        ok: true,
        counts: { ranked: rankedScores.length, display: display.length },
        primary: primary && { schema: primary.schemaLabel, publicName: schemaToPublic(primary.schemaLabel), idx: Math.round(primary.index0to100) },
        secondary: secondary && { schema: secondary.schemaLabel, publicName: schemaToPublic(secondary.schemaLabel), idx: Math.round(secondary.index0to100), emerging: (secondary as any).caution || false },
        tertiary: tertiary && { schema: tertiary.schemaLabel, publicName: schemaToPublic(tertiary.schemaLabel), idx: Math.round(tertiary.index0to100), emerging: (tertiary as any).caution || false },
        top5: display.slice(0,5).map(d => ({
          schemaLabel: d.schemaLabel,
          publicName: schemaToPublic(d.schemaLabel),
          displayIndex: d.displayIndex,
          n: d.n
        })),
        participantName,
        completedAt,
      });
    }

    // Build cards for renderer
    const primaryCard = primary && {
      schema: primary.schemaLabel,
      publicName: schemaToPublic(primary.schemaLabel),
      healthy: schemaToHealthy(primary.schemaLabel) ?? undefined,
      score: primary.index0to100,
      emerging: (primary as any).caution || primary.index0to100 < 60,
    };

    const secondaryCard = secondary && {
      schema: secondary.schemaLabel,
      publicName: schemaToPublic(secondary.schemaLabel),
      healthy: schemaToHealthy(secondary.schemaLabel) ?? undefined,
      score: secondary.index0to100,
      emerging: (secondary as any).caution || secondary.index0to100 < 60,
    };

    const tertiaryCard = tertiary && {
      schema: tertiary.schemaLabel,
      publicName: schemaToPublic(tertiary.schemaLabel),
      healthy: schemaToHealthy(tertiary.schemaLabel) ?? undefined,
      score: tertiary.index0to100,
      emerging: (tertiary as any).caution || tertiary.index0to100 < 60,
    };

    const html = renderTier2HTML({
      participantName,
      completedAt: completedAt || new Date(),
      totalQuestions: Object.keys(responses).length,
      primary: primaryCard,
      secondary: secondaryCard,
      tertiary: tertiaryCard,
      topDisplay: display?.map(d => ({
        schemaLabel: d.schemaLabel,
        displayIndex: d.displayIndex
      })) ?? [],
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Leadership_Summary_${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.html"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (e: any) {
    console.error('❌ Tier1 error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate report' }, { status: 500 });
  }
}

