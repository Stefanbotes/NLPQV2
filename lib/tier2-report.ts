// lib/tier2-report.ts
// Server-only utility to render the Tier 2 HTML using rich coaching content.

import {
  schemaToPublic,
  personaCopy,
  narrativeFor,
  // Pull the base type so we can widen it locally for extra coach fields:
  type Tier2PersonaCopy as BaseTier2PersonaCopy,
} from '@/lib/tier2-persona-copy';

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

// ---- Local helper types (non-breaking widening for Tier 2 coach content) ----
type Tier2CoachInsights = {
  overview?: string;
  coachingFocus?: string;
  developmentPlan?: string;
};

type PersonaForReport = BaseTier2PersonaCopy & {
  coachingDescription?: string;
  riskProfile?: string;
  tier2Insights?: Tier2CoachInsights;
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

// Turn long text into bullets if it contains line breaks or semicolons
function asBullets(text?: string): string {
  if (!text) return '';
  const parts = String(text)
    .split(/\r?\n|;|•/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return `<p>${escapeHtml(text)}</p>`;
  return `<ul>${parts.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
}

function smallMeta(label: string, value?: string) {
  if (!value) return '';
  return `<div class="meta"><span class="meta-label">${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`;
}

// --------------------------------

export function generateTier2HTML(
  bioData: BioData,
  topPersonas: TopPersonaInput[],
  responses: Record<string, any>,
  completedAt: string
) {
  const reportDate = safeDate(completedAt);
  const totalQuestions = Object.keys(responses || {}).length;

  // “At a glance” table
  const glanceRows = (topPersonas || []).slice(0, 5).map((p, i) => {
    const id = String(p.persona ?? p.schema ?? '').trim();
    const publicName = schemaToPublic(id) || id || 'Leadership Pattern';
    const scorePct = pctOf(p);
    return `
      <tr>
        <td>#${i + 1}</td>
        <td>${escapeHtml(publicName)}</td>
        <td class="right">${Number.isFinite(scorePct) ? scorePct : 0}%</td>
      </tr>
    `;
  }).join('');

  // Rich persona sections
  const personaCards = (topPersonas || []).map((p, i) => {
    const id = String(p.persona ?? p.schema ?? '').trim();
    const publicName = schemaToPublic(id) || id || 'Leadership Pattern';
    const scorePct = pctOf(p);

    // Ensure strongly-typed, widened persona copy (so optional coach fields are visible to TS)
    const pc: PersonaForReport = (personaCopy(id) as PersonaForReport) ?? ({} as PersonaForReport);

    const overview =
      pc.tier2Insights?.overview ||
      pc.coachingDescription ||
      narrativeFor(id, scorePct);

    const coachingFocus = pc.tier2Insights?.coachingFocus || '';
    const developmentPlan = pc.tier2Insights?.developmentPlan || '';
    const riskProfile = pc.riskProfile || '';

    return `
      <section class="persona-card">
        <div class="persona-header">
          <div class="persona-rank">#${i + 1}</div>
          <div class="persona-title">
            <div class="persona-name">${escapeHtml(publicName)}</div>
            <div class="persona-sub">
              ${smallMeta('Domain', pc.domain)}
              ${smallMeta('Variable ID', pc.variableId)}
              ${smallMeta('Healthy Expression', pc.healthyPersona)}
            </div>
          </div>
          <div class="score-badge">${Number.isFinite(scorePct) ? scorePct : 0}%</div>
        </div>

        <div class="persona-section">
          <h4>Overview</h4>
          <p>${escapeHtml(overview || 'You demonstrate distinctive leadership qualities.')}</p>
        </div>

        <div class="persona-grid">
          <div class="persona-section">
            <h4>Strength Focus</h4>
            <p>${escapeHtml(pc.strengthFocus || 'Leverage your natural advantages in context.')}</p>
          </div>
          <div class="persona-section">
            <h4>Development Edge</h4>
            <p>${escapeHtml(pc.developmentEdge || 'Continue building on your natural strengths.')}</p>
          </div>
        </div>

        ${coachingFocus ? `
          <div class="persona-section">
            <h4>Coaching Focus</h4>
            ${asBullets(coachingFocus)}
          </div>` : ''}

        ${developmentPlan ? `
          <div class="persona-section">
            <h4>Development Plan</h4>
            ${asBullets(developmentPlan)}
          </div>` : ''}

        ${riskProfile ? `
          <div class="persona-section warn">
            <h4>Risk Profile</h4>
            <p>${escapeHtml(riskProfile)}</p>
          </div>` : ''}
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leadership Personas Assessment Report - ${escapeHtml(bioData.name)}</title>
  <style>
    :root{
      --bg-primary:#4f46e5;
      --panel:#f8fafc;
      --ink:#1e293b;
      --muted:#64748b;
      --line:#e2e8f0;
      --warn:#f59e0b;
      --warn-bg:#fff7ed;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 24px 20px;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .report-container { background: #fff; padding: 40px; border-radius: 14px;
                        box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); }
    .header { text-align: center; border-bottom: 3px solid var(--bg-primary); padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 32px; font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .participant-info { background: var(--panel); padding: 18px; border-radius: 10px; margin-bottom: 24px; }
    .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
                     gap: 16px; margin-bottom: 26px; }
    .stat-card { background: #f1f5f9; padding: 14px; border-radius: 10px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: var(--bg-primary); }
    .stat-label { color: var(--muted); font-size: 14px; }

    .glance { margin: 26px 0; }
    .glance table { width:100%; border-collapse: collapse; }
    .glance th, .glance td { padding: 10px 8px; border-bottom: 1px solid var(--line); }
    .glance th { text-align: left; color: var(--muted); font-weight: 600; }
    .right { text-align: right; }

    .persona-card { border: 1px solid var(--line); border-radius: 12px; padding: 22px; margin-bottom: 22px;
                    border-left: 6px solid var(--bg-primary); }
    .persona-header { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
    .persona-rank { background: var(--bg-primary); color: #fff; width: 34px; height: 34px; border-radius: 50%;
                    display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
    .persona-title { flex: 1; }
    .persona-name { font-size: 20px; font-weight: 800; color: var(--ink); }
    .persona-sub { display:flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
    .meta { background:#eef2ff; color:#4338ca; padding:4px 8px; border-radius:999px; font-size:12px; }
    .meta-label { opacity:.8; margin-right:4px; }
    .score-badge { background: var(--bg-primary); color: #fff; padding: 6px 14px; border-radius: 999px; font-weight: 700; }

    .persona-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px; }
    .persona-section { margin-top: 12px; }
    .persona-section h4 { margin: 0 0 6px; font-size: 15px; color: var(--ink); }
    .persona-section.warn { background: var(--warn-bg); border-left: 4px solid var(--warn);
                            padding: 10px 12px; border-radius: 8px; }

    ul { margin: 0; padding-left: 18px; }
    li { margin: 4px 0; }

    .footer { text-align: center; margin-top: 34px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
    @media print { body { background: #fff !important; } .report-container { box-shadow: none !important; } }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="logo">Leadership Personas Assessment</div>
      <h1>Leadership Coaching Report</h1>
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

    <div class="glance">
      <h2>Top Personas at a Glance</h2>
      <table>
        <thead><tr><th>#</th><th>Persona</th><th class="right">Score</th></tr></thead>
        <tbody>${glanceRows}</tbody>
      </table>
    </div>

    <h2>Coaching Detail</h2>
    <p>Below are enriched insights for coaching conversations: overview, strengths, development edges, coaching focus, and suggested development plans.</p>

    ${personaCards}

    <div class="footer">
      <p>This report is confidential and intended for coaching and professional development.</p>
      <p>Generated on ${escapeHtml(new Date().toLocaleDateString())} | Leadership Personas Assessment &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
}

