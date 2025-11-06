// lib/tier2/generate-html.ts
// Rich HTML renderer for Tier 2 using precomputed persona results.
// IMPORTANT: This file MUST export `renderTier2HTML(args: RenderArgs)`
// because your API route imports it with that exact name/signature.

import {
  personaCopy,
  narrativeFor,
  schemaToDomain,
  schemaToVariableId,
} from '@/lib/tier2-persona-copy';

export type PersonaCard = {
  schema: string;        // clinical schema label (e.g. "Abandonment/Instability")
  publicName: string;    // public leadership persona name
  healthy?: string;      // optional "healthy expression" line
  score: number;         // 0..100
  emerging?: boolean;    // flag for "emerging pattern"
};

export type RenderArgs = {
  participantName: string;
  completedAt: string | Date;
  totalQuestions: number;
  primary: PersonaCard | null | undefined;
  secondary: PersonaCard | null | undefined;
  tertiary: PersonaCard | null | undefined;
  topDisplay?: Array<{ schemaLabel: string; displayIndex: number }>;
};

const SHOW_DEBUG = false; // set to true to show which labels failed to resolve

const escapeHtml = (s: string) =>
  String(s ?? '').replace(/[<>&"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c] as string));

const fmtDate = (d: string | Date) => {
  try { return new Date(d).toLocaleDateString(); }
  catch { return new Date().toLocaleDateString(); }
};

// Turn long text into bullets if it contains line breaks or semicolons/bullets
function asBullets(text?: string): string {
  if (!text) return '';
  const parts = String(text)
    .split(/\r?\n|;|•/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return `<p>${escapeHtml(text)}</p>`;
  return `<ul>${parts.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
}

function metaPill(label: string, value?: string) {
  if (!value) return '';
  return `<div class="meta"><span class="meta-label">${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`;
}

function scoreBadge(score: number) {
  const n = Number.isFinite(score) ? Math.round(score) : 0;
  return `<div class="score-badge">${n}%</div>`;
}

// Try multiple keys to resolve persona copy robustly
function resolveCopy(card: PersonaCard) {
  const tried: string[] = [];
  const attempt = (k?: string | null) => {
    if (!k) return null;
    tried.push(k);
    return personaCopy(k);
  };

  // 1) clinical schema label (as passed)
  let hit = attempt(card.schema);

  // 2) public persona name
  if (!hit) hit = attempt(card.publicName);

  // 3) simple punctuation variants of schema
  if (!hit) hit = attempt(card.schema.replace(/\//g, ' and '));
  if (!hit) hit = attempt(card.schema.replace(/\//g, ' '));
  if (!hit) hit = attempt(card.schema.replace(/-/g, ' '));

  // 4) naive slug/pascal cases (sometimes callers pass slugs or “prettified” slugs)
  const slug = card.schema.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!hit) hit = attempt(slug);
  const titleFromSlug = slug.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
  if (!hit) hit = attempt(titleFromSlug);

  // 5) last resort: try punctuation variants of public name
  if (!hit) {
    hit = attempt(card.publicName.replace(/\//g, ' and ')) ||
          attempt(card.publicName.replace(/\//g, ' ')) ||
          attempt(card.publicName.replace(/-/g, ' '));
  }

  return { hit, tried };
}

/**
 * Enriched persona section using the schema label from the card.
 * We fetch Tier-2 coach content from personaCopy(schema) with robust fallback.
 */
function renderRichPersonaSection(
  title: string,
  card: PersonaCard,
  variant: 'primary' | 'secondary'
): string {
  const { hit: pc, tried } = resolveCopy(card);

  const domain = schemaToDomain(card.schema) || pc?.domain || '';
  const variableId = schemaToVariableId(card.schema) || pc?.variableId || '';
  const healthy = card.healthy || pc?.healthyPersona || '';
  const strengthFocus = pc?.strengthFocus || '';
  const developmentEdge = pc?.developmentEdge || '';
  const overview =
    pc?.tier2Insights?.overview ||
    pc?.coachingDescription ||
    pc?.publicDescription ||
    narrativeFor(card.schema, card.score);

  const coachingFocus = pc?.tier2Insights?.coachingFocus || pc?.growthFocus || '';
  const developmentPlan = pc?.tier2Insights?.developmentPlan || '';
  const riskProfile = pc?.riskProfile || '';

  const head =
    variant === 'primary'
      ? `
      <section class="persona-card primary">
        <div class="persona-header">
          <div class="persona-rank">Primary</div>
          <div class="persona-title">
            <div class="persona-name">${escapeHtml(card.publicName)}</div>
            <div class="persona-sub">
              ${metaPill('Domain', domain)}
              ${metaPill('Variable ID', variableId)}
              ${healthy ? metaPill('Healthy Expression', healthy) : ''}
            </div>
          </div>
          ${scoreBadge(card.score)}
        </div>`
      : `
      <section class="persona-card">
        <div class="persona-header">
          <div class="persona-rank">${escapeHtml(title)}</div>
          <div class="persona-title">
            <div class="persona-name">${escapeHtml(card.publicName)}</div>
            <div class="persona-sub">
              ${metaPill('Domain', domain)}
              ${metaPill('Variable ID', variableId)}
              ${healthy ? metaPill('Healthy Expression', healthy) : ''}
            </div>
          </div>
          ${scoreBadge(card.score)}
        </div>`;

  const emergingLine = card.emerging
    ? `<div class="persona-section warn"><h4>Note</h4><p>⚠️ Emerging pattern — may benefit from targeted development.</p></div>`
    : '';

  const debugLine = (!pc && SHOW_DEBUG)
    ? `<div class="persona-section warn"><h4>Debug</h4><p>Copy not found for <code>${escapeHtml(card.schema)}</code>. Tried: ${escapeHtml(tried.join(' → '))}</p></div>`
    : '';

  return `
    ${head}

    <div class="persona-section">
      <h4>Overview</h4>
      <p>${escapeHtml(overview || 'You demonstrate distinctive leadership qualities.')}</p>
    </div>

    <div class="persona-grid">
      <div class="persona-section">
        <h4>Strength Focus</h4>
        <p>${escapeHtml(strengthFocus || 'Leverage your natural advantages in context.')}</p>
      </div>
      <div class="persona-section">
        <h4>Development Edge</h4>
        <p>${escapeHtml(developmentEdge || 'Continue building on your natural strengths.')}</p>
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

    ${emergingLine}
    ${debugLine}
  </section>`;
}

export function renderTier2HTML(args: RenderArgs): string {
  const {
    participantName,
    completedAt,
    totalQuestions,
    primary,
    secondary,
    tertiary,
    topDisplay = []
  } = args;

  // Build an “At a glance” list (Top 5)
  const topList = topDisplay.slice(0, 5).map((item, idx) => {
    const name = escapeHtml(item.schemaLabel);
    const n = Number.isFinite(item.displayIndex) ? Math.round(item.displayIndex) : 0;
    return (
      `<tr>
        <td>#${idx + 1}</td>
        <td>${name}</td>
        <td class="right">${n}%</td>
      </tr>`
    );
  }).join('');

  const dateStr = fmtDate(completedAt);

  // Build enriched persona sections (if present)
  const primaryBlock   = primary   ? renderRichPersonaSection('Primary Leadership Persona', primary, 'primary')   : '';
  const secondaryBlock = secondary ? renderRichPersonaSection('Secondary Leadership Persona', secondary, 'secondary') : '';
  const tertiaryBlock  = tertiary  ? renderRichPersonaSection('Tertiary Leadership Persona', tertiary, 'secondary')  : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Leadership Coaching Report - ${escapeHtml(participantName)}</title>
  <style>
    :root{
      --indigo:#4f46e5;
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
    .container { background: #fff; padding: 40px; border-radius: 14px;
                 box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); }
    .header { text-align: center; border-bottom: 3px solid var(--indigo); padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 32px; font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .participant-info { background: var(--panel); padding: 18px; border-radius: 10px; margin-bottom: 24px; }
    .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
                     gap: 16px; margin-bottom: 26px; }
    .stat-card { background: #f1f5f9; padding: 14px; border-radius: 10px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: var(--indigo); }
    .stat-label { color: var(--muted); font-size: 14px; }

    .glance { margin: 26px 0; }
    .glance table { width:100%; border-collapse: collapse; }
    .glance th, .glance td { padding: 10px 8px; border-bottom: 1px solid var(--line); }
    .glance th { text-align: left; color: var(--muted); font-weight: 600; }
    .right { text-align: right; }

    .persona-card { border: 1px solid var(--line); border-radius: 12px; padding: 22px; margin-bottom: 22px;
                    border-left: 6px solid var(--indigo); }
    .persona-card.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
    .persona-card.primary .persona-name { color: #fff; }
    .persona-card.primary .meta { background: rgba(255,255,255,.2); color: #fff; }
    .persona-card.primary .score-badge { background: rgba(255,255,255,.15); color: #fff; }

    .persona-header { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
    .persona-rank { background: var(--indigo); color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .persona-title { flex: 1; }
    .persona-name { font-size: 20px; font-weight: 800; color: var(--ink); }
    .persona-sub { display:flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
    .meta { background:#eef2ff; color:#4338ca; padding:4px 8px; border-radius:999px; font-size:12px; }
    .meta-label { opacity:.8; margin-right:4px; }
    .score-badge { background: var(--indigo); color: #fff; padding: 6px 14px; border-radius: 999px; font-weight: 700; }

    .persona-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px; }
    .persona-section { margin-top: 12px; }
    .persona-section h4 { margin: 0 0 6px; font-size: 15px; color: var(--ink); }
    .persona-card.primary .persona-section h4 { color: #fff; }
    .persona-section.warn { background: var(--warn-bg); border-left: 4px solid var(--warn);
                            padding: 10px 12px; border-radius: 8px; }

    ul { margin: 0; padding-left: 18px; }
    li { margin: 4px 0; }

    .footer { text-align: center; margin-top: 34px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
    @media print { body { background: #fff !important; } .container { box-shadow: none !important; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Leadership Personas Assessment</div>
      <h1>Leadership Coaching Report</h1>
      <p><strong>${escapeHtml(participantName)}</strong> • Generated: ${escapeHtml(dateStr)}</p>
    </div>

    <div class="participant-info">
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-number">${totalQuestions}</div>
          <div class="stat-label">Questions Answered</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${[primary, secondary, tertiary].filter(Boolean).length}</div>
          <div class="stat-label">Key Personas Shown</div>
        </div>
      </div>
    </div>

    <div class="glance">
      <h2>Top Personas at a Glance</h2>
      <table>
        <thead><tr><th>#</th><th>Persona</th><th class="right">Score</th></tr></thead>
        <tbody>${topDisplay.slice(0, 5).map((item, idx) => {
          const name = escapeHtml(item.schemaLabel);
          const n = Number.isFinite(item.displayIndex) ? Math.round(item.displayIndex) : 0;
          return `<tr><td>#${idx + 1}</td><td>${name}</td><td class="right">${n}%</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>

    <h2>Coaching Detail</h2>
    <p>Below are enriched insights for coaching conversations: overview, strengths, development edges, coaching focus, and suggested development plans.</p>

    ${primary   ? renderRichPersonaSection('Primary Leadership Persona', primary, 'primary')   : ''}
    ${secondary ? renderRichPersonaSection('Secondary Leadership Persona', secondary, 'secondary') : ''}
    ${tertiary  ? renderRichPersonaSection('Tertiary Leadership Persona', tertiary, 'secondary')  : ''}

    <div class="footer">
      <p>This report is confidential and intended for coaching and professional development.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment</p>
    </div>
  </div>
</body>
</html>`;
}
