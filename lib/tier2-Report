// lib/tier2-report.ts
// Server-only utility to render the Tier 1 HTML from the same inputs your client-facing flow uses.

import { schemaToPublic, personaCopy, narrativeFor } from '@/lib/tier2-persona-copy';

type TopPersonaInput = {
  persona?: string;     // internal schema label
  schema?: string;      // alternative field name
  percentage?: number;  // 0..100
  idx?: number;         // alternative numeric, also 0..100
};

type BioData = {
  name: string;
  email?: string;
  team?: string;
  uniqueCode?: string;
};

// ---------- helpers ----------
const escapeHtml = (s: string) =>
  String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const safeDate = (isoLike: string) => {
  try { return new Date(isoLike).toLocaleDateString(); }
  catch { return new Date().toLocaleDateString(); }
};

const pctOf = (p: TopPersonaInput) =>
  Math.round(Number(p.percentage ?? p.idx ?? 0));

const firstPct = (arr: TopPersonaInput[] = []) => {
  const n = Number(arr[0]?.percentage ?? arr[0]?.idx ?? 0);
  return Number.isFinite(n) ? Math.round(n) : 0;
};
// --------------------------------

export function generateTier2HTML(
  bioData: BioData,
  topPersonas: TopPersonaInput[],
  responses: Record<string, any>,
  completedAt: string
) {
  const reportDate = safeDate(completedAt);
  const totalQuestions = Object.keys(responses || {}).length;

  const personaCards = (topPersonas || [])
    .map((p, i) => {
      const id = String(p.persona ?? p.schema ?? '').trim();
      const publicName = schemaToPublic(id) || id || 'Leadership Pattern';
      const scorePct = pctOf(p);

      // personaCopy typically returns { strengthFocus, developmentEdge }
      const pc = (personaCopy(id) as Partial<{
        strengthFocus: string;
        developmentEdge: string;
      }>) || {};

      // Use narrativeFor for the main paragraph (since coachingDescription isn't guaranteed)
      const narrative = narrativeFor(id, scorePct) || 'You demonstrate distinctive leadership qualities.';

      return `
        <div class="persona-card">
          <div class="persona-header">
            <div class="persona-rank">#${i + 1}</div>
            <div>
              <div class="persona-name">${escapeHtml(publicName)}</div>
              <div class="persona-focus">${escapeHtml(pc.strengthFocus ?? 'Leadership Qualities')}</div>
            </div>
            <div class="score-badge">${Number.isFinite(scorePct) ? scorePct : 0}%</div>
          </div>
          <div class="description">
            <strong>Your Strength:</strong> ${escapeHtml(narrative)}
          </div>
          <div class="development-edge">
            <strong>Development Edge:</strong> ${escapeHtml(pc.developmentEdge ?? 'Continue building on your natural strengths.')}
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leadership Personas Assessment Report - ${escapeHtml(bioData.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .report-container { background: #fff; padding: 40px; border-radius: 12px;
                        box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 30px; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .participant-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
                     gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .stat-label { color: #64748b; font-size: 14px; }
    .persona-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 25px;
                    border-left: 5px solid #4f46e5; }
    .persona-header { display: flex; align-items: center; margin-bottom: 15px; }
    .persona-rank { background: #4f46e5; color: #fff; width: 30px; height: 30px; border-radius: 50%;
                    display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px; }
    .persona-name { font-size: 20px; font-weight: 700; color: #1e293b; }
    .persona-focus { color: #4f46e5; font-weight: 600; margin-top: 5px; }
    .score-badge { margin-left: auto; background: #4f46e5; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: 700; }
    .description { margin-bottom: 15px; }
    .development-edge { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    @media print { body { background: #fff !important; } .report-container { box-shadow: none !important; } }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="logo">Leadership Personas Assessment</div>
      <h1>Personal Leadership Report</h1>
      <p>Behavioral Pattern Analysis & Growth Insights</p>
    </div>

    <div class="participant-info">
      <h2>Participant Information</h2>
      <p><strong>Name:</strong> ${escapeHtml(bioData.name)}</p>
      ${bioData.email ? `<p><strong>Email:</strong> ${escapeHtml(bioData.email)}</p>` : ''}
      ${bioData.team ? `<p><strong>Team/Organization:</strong> ${escapeHtml(bioData.team)}</p>` : ''}
      <p><strong>Assessment Date:</strong> ${escapeHtml(reportDate)}</p>
      ${bioData.uniqueCode ? `<p><strong>Unique Code:</strong> ${escapeHtml(bioData.uniqueCode)}</p>` : ''}
    </div>

    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-number">${totalQuestions}</div>
        <div class="stat-label">Questions Answered</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${(topPersonas || []).length}</div>
        <div class="stat-label">Top Personas Identified</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${firstPct(topPersonas)}%</div>
        <div class="stat-label">Strongest Pattern</div>
      </div>
    </div>

    <h2>Your Leadership Personas</h2>
    <p>Based on your responses to ${totalQuestions} behavioral reflection statements, here are your strongest leadership patterns:</p>

    ${personaCards}

    <div class="footer">
      <p>This report is confidential and intended for personal development purposes.</p>
      <p>Generated on ${escapeHtml(new Date().toLocaleDateString())} | Leadership Personas Assessment &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
}
