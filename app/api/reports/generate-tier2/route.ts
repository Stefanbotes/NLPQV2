// app/api/reports/generate-tier2/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import {
  schemaToPublic,
  schemaToHealthy,
  personaCopy
} from '@/lib/tier2-persona-copy';
import { renderTier2HTML } from '@/lib/tier2/generate-html';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Try multiple forms to find the schema key that exists in personaCopy()
function bestSchemaKey(label: string | undefined | null): string {
  const raw = String(label ?? '').trim();
  if (!raw) return '';

  // direct
  if (personaCopy(raw)) return raw;

  // swap "/" with " and " and vice versa
  const vAnd = raw.replace(/\//g, ' and ');
  if (vAnd !== raw && personaCopy(vAnd)) return vAnd;

  const vSlash = raw.replace(/\band\b/gi, '/');
  if (vSlash !== raw && personaCopy(vSlash)) return vSlash;

  // strip "/" entirely
  const vNoSlash = raw.replace(/\//g, ' ');
  if (vNoSlash !== raw && personaCopy(vNoSlash)) return vNoSlash;

  // strip hyphens
  const vNoHyphen = raw.replace(/-/g, ' ');
  if (vNoHyphen !== raw && personaCopy(vNoHyphen)) return vNoHyphen;

  // slug
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (slug && personaCopy(slug)) return slug;

  // Title Case from slug
  const titleFromSlug = slug.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  if (titleFromSlug && personaCopy(titleFromSlug)) return titleFromSlug;

  return raw;
}

// Log what we actually resolved and what content exists
function peek(where: string, label: string) {
  const pc = personaCopy(label);
  const exists = !!pc;
  const overview = pc?.tier2Insights?.overview || pc?.coachingDescription || pc?.publicDescription;
  const coachingFocus = pc?.tier2Insights?.coachingFocus;
  const developmentPlan = pc?.tier2Insights?.developmentPlan;

  console.log(`🧭 [Tier2 ${where}]`, {
    input: label,
    exists,
    domain: pc?.domain,
    variableId: pc?.variableId,
    hasOverview: !!overview,
    hasCoachingFocus: !!coachingFocus,
    hasDevelopmentPlan: !!developmentPlan,
    healthyPersona: pc?.healthyPersona,
    leadershipPersona: pc?.leadershipPersona,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    let responses: Record<string, string | number> | undefined;
    let participantName = 'User';
    let completedAt: Date | string | undefined;

    console.log('🔍 Tier 2 API called with:', {
      hasResponses: !!body?.responses,
      hasUserIdAssessmentId: !!(body?.userId && body?.assessmentId),
      bodyKeys: Object.keys(body || {}),
    });

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
    } else if (body?.userId && body?.assessmentId) {
      const user = await db.users.findUnique({
        where: { id: body.userId },
        include: {
          assessments: {
            where: { id: body.assessmentId },
            take: 1,
          },
        },
      });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const assessment = user.assessments?.[0];
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

      if (assessment.status !== 'COMPLETED' || !assessment.responses) {
        return NextResponse.json(
          { error: 'Assessment not completed or has no responses' },
          { status: 400 }
        );
      }

      let raw: Record<string, any>;
      try {
        raw =
          typeof assessment.responses === 'string'
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
      participantName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
      completedAt = assessment.completedAt || new Date();
    } else {
      return NextResponse.json(
        { error: 'Either responses or userId/assessmentId required for Tier 2 report generation' },
        { status: 400 }
      );
    }

    if (!responses || !Object.keys(responses).length) {
      return NextResponse.json({ error: 'No responses available for scoring' }, { status: 400 });
    }

    const { rankedScores, display } = await scoreAssessmentResponses(responses);
    if (!rankedScores.length) {
      return NextResponse.json(
        { error: 'No scores computed (check item IDs vs mapping)' },
        { status: 400 }
      );
    }

    const { primary, secondary, tertiary } = pickTop3(rankedScores, 60);

    // JSON debug mode
    if (format === 'json') {
      return NextResponse.json({
        ok: true,
        counts: { ranked: rankedScores.length, display: display.length },
        primary: primary && {
          schema: primary.schemaLabel,
          publicName: schemaToPublic(primary.schemaLabel),
          idx: Math.round(primary.index0to100)
        },
        secondary: secondary && {
          schema: secondary.schemaLabel,
          publicName: schemaToPublic(secondary.schemaLabel),
          idx: Math.round(secondary.index0to100),
          emerging: (secondary as any).caution || false
        },
        tertiary: tertiary && {
          schema: tertiary.schemaLabel,
          publicName: schemaToPublic(tertiary.schemaLabel),
          idx: Math.round(tertiary.index0to100),
          emerging: (tertiary as any).caution || false
        },
        top5: display.slice(0, 5).map(d => ({
          schemaLabel: d.schemaLabel,
          publicName: schemaToPublic(d.schemaLabel),
          displayIndex: d.displayIndex,
          n: d.n
        })),
        participantName,
        completedAt,
      });
    }

    // Normalize to keys that should exist in tier2-persona-copy
    const primaryKey   = primary   ? bestSchemaKey(primary.schemaLabel)   : '';
    const secondaryKey = secondary ? bestSchemaKey(secondary.schemaLabel) : '';
    const tertiaryKey  = tertiary  ? bestSchemaKey(tertiary.schemaLabel)  : '';

    // 🔎 Diagnostics: do we actually see enriched fields under these keys?
    if (primaryKey)   peek('primary', primaryKey);
    if (secondaryKey) peek('secondary', secondaryKey);
    if (tertiaryKey)  peek('tertiary', tertiaryKey);

    // Build cards for renderer
    const primaryCard = primary && {
      schema: primaryKey || primary.schemaLabel,
      publicName: schemaToPublic(primaryKey || primary.schemaLabel),
      healthy:    schemaToHealthy(primaryKey || primary.schemaLabel) ?? undefined,
      score:      primary.index0to100,
      emerging:   (primary as any).caution || primary.index0to100 < 60,
    };

    const secondaryCard = secondary && {
      schema: secondaryKey || secondary.schemaLabel,
      publicName: schemaToPublic(secondaryKey || secondary.schemaLabel),
      healthy:    schemaToHealthy(secondaryKey || secondary.schemaLabel) ?? undefined,
      score:      secondary.index0to100,
      emerging:   (secondary as any).caution || secondary.index0to100 < 60,
    };

    const tertiaryCard = tertiary && {
      schema: tertiaryKey || tertiary.schemaLabel,
      publicName: schemaToPublic(tertiaryKey || tertiary.schemaLabel),
      healthy:    schemaToHealthy(tertiaryKey || tertiary.schemaLabel) ?? undefined,
      score:      tertiary.index0to100,
      emerging:   (tertiary as any).caution || tertiary.index0to100 < 60,
    };

    const html = renderTier2HTML({
      participantName,
      completedAt: completedAt || new Date(),
      totalQuestions: Object.keys(responses).length,
      primary: primaryCard,
      secondary: secondaryCard,
      tertiary: tertiaryCard,
      topDisplay: display?.map(d => ({
        schemaLabel: bestSchemaKey(d.schemaLabel) || d.schemaLabel,
        displayIndex: d.displayIndex
      })) ?? [],
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Leadership_Coaching_Report_${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.html"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error('❌ Tier 2 error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate report' }, { status: 500 });
  }
}
