// /lib/tier1/generate-html.ts
import { scoreAssessmentResponses, pickTop3 } from '@/lib/shared-schema-scoring';
import { schemaToPublic, schemaToHealthy, narrativeFor, personaCopy } from '@/lib/tier1-persona-copy';

type StringNum = string | number;

export type Tier1BioData = {
  name: string;
  email?: string;
  team?: string;
  uniqueCode?: string;
};

export type Tier1TopPersona = {
  // If you use canonical schema labels, set persona to that.
  // If you use your "working" export format (e.g., "The Clinger"), it's fine—
  // the admin flow uses canonical scoring; the client-export flow uses this field directly.
  persona: string;
  percentage: number;
};

export function buildTier1Filename(participantName: string, prefix = 'Leadership_Summary') {
  const safe = (participantName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  return `${prefix}_${safe}_${new Date().toISOString().slice(0,10)}.html`;
}

/**
 * HTML template used by both flows (kept deliberately simple and consistent)
 */
function renderHtmlTemplate(args: {
  participantName: string;
  primary?: { schema: string; publicName: string; healthy?: string | null; score: number; emerging: boolean };
  secondary?: { schema: string; publicName: string; healthy?: string | null; score: number; emerging: boolean };
  tertiary?: { schema: string; publicName: string; healthy?: string | null; score: number; emerging: boolean };
  // for the “top 5” list in the admin-scored flow
  top5?: Array<{ schemaLabel: string; publicName: string; displayIndex: number }>;
  // for the client-export stats
  stats?: { totalQuestions?: number; strongestPct?: number; topCount?: number; completedAt?: string; bio?: Tier1BioData };
}) {
  const { participantName, primary, secondary, tertiary, top5, stats } = args;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leadership Summary - ${participantName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin: 30px 0; }
    .primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .secondary { background: #f1f5f9; padding: 15px; border-left: 4px solid #64748b; margin: 15px 0; }
    .score { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .label { font-size: 18px; margin-bottom: 10px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    .meta { color: #6b7280; font-size: 13px; }
    .chip { display:inline-block; border:1px solid #e5e7eb; border-radius:999px; padding:2px 10px; margin-right:6px; font-size:12px; color:#374151 }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${participantName}</strong></p>
      <p class="meta">Generated: ${new Date().toLocaleDateString()}</p>
      ${
        stats?.bio
          ? `<p class="meta">${[
              stats.bio.email ? `Email: ${stats.bio.email}` : '',
              stats.bio.team ? `Team: ${stats.bio.team}` : '',
              stats.bio.uniqueCode ? `Code: ${stats.bio.uniqueCode}` : ''
            ].filter(Boolean).join(' • ')}</p>`
          : ''
      }
    </div>

    ${
      stats
        ? `<div class="section">
            <div class="chip">${stats.totalQuestions ?? 0} questions</div>
            <div class="chip">${stats.topCount ?? 0} top personas</div>
            <div class="chip">Strongest pattern: ${Math.round(stats.strongestPct ?? 0)}%</div>
            ${stats.completedAt ? `<div class="chip">Completed: ${new Date(stats.completedAt).toLocaleDateString()}</div>` : ''}
          </div>`
        : ''
    }

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    ${
      primary
        ? `<div class="primary">
             <div class="label">Primary Leadership Persona</div>
             <div class="score">${primary.publicName}</div>
             ${primary.healthy ? `<div style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Healthy expression: ${primary.healthy}</div>` : ''}
             <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 5px 0;">(${primary.schema})</div>
             <div>Activation Index: ${Math.round(primary.score)}/100</div>
             ${primary.emerging ? '<div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">⚠️ Emerging pattern - may benefit from development focus</div>' : ''}
           </div>`
        : ''
    }

    ${
      secondary
        ? `<div class="secondary">
             <div class="label">Secondary Leadership Persona</div>
             <div style="font-size: 18px; font-weight: bold; color: #374151;">${secondary.publicName}</div>
             ${secondary.healthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${secondary.healthy}</div>` : ''}
             <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${secondary.schema})</div>
             <div>Activation Index: ${Math.round(secondary.score)}/100</div>
             ${secondary.emerging ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>' : ''}
           </div>`
        : ''
    }

  ${tertiary ? `
  <div class="secondary">
    <div class="label">Tertiary Leadership Persona</div>
    <div style="font-size: 18px; font-weight: bold; color: #374151;">${tertiary.publicName}</div>
    ${tertiary.healthy ? `<div style="margin: 8px 0; font-size: 14px; color: #6b7280;">Healthy expression: ${tertiary.healthy}</div>` : ''}
    <div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${tertiary.schema})</div>
    <div>Activation Index: ${Math.round(tertiary.score)}/100</div>
    ${tertiary.emerging
      ? '<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>'
      : ''
    }
  </div>
` : ''}
