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

  // 4) naive slug/pascal cases
  const slug = card.schema.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!hit) hit = attempt(slug);
  const titleFromSlug = slug.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
  if (!hit) hit = attempt(titleFromSlug);

  // 5) variants of public name
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
    ? `<div class="persona-section warn"><h4>Debug</h4><p>Copy not found for <code>${escapeHtml(card.schema)}</code>.</p></div>`
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
      <div class="persona-section risk">
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
    /* ===========================================================
       Tier-2 — minimal, brand-true, legacy-safe, namespaced
       Palette: soft white (#FFF9F5), deep teal (#095A62), accent (#E85A5A)
       =========================================================== */

    .t2-report{
      /* Brand tokens (legacy HSL/hex + commas; rgba/hsla for alpha) */
      --bg: hsl(24, 60%, 98%);           /* #FFF9F5 */
      --ink: hsl(195, 80%, 10%);         /* deep teal text */
      --muted: hsl(195, 20%, 40%);       /* subdued teal */
      --muted-2: hsl(195, 20%, 45%);
      --card: hsl(24, 60%, 98%);
      --line: hsl(188, 30%, 88%);        /* soft teal border */
      --brand: hsl(188, 83%, 21%);       /* #095A62 */
      --brand-ink: hsl(188, 83%, 18%);
      --accent: hsl(24, 65%, 90%);       /* peach wash */
      --alert: #E85A5A;                  /* sparse FT-style red */
      --alert-bg: #FFF0F0;               /* ultra light red bg */
    }

    .t2-report, .t2-report *{ box-sizing: border-box; }

    .t2-report{
      margin: 0; padding: 0;
      background: #FFF9F5;
      background: var(--bg);
      color: #0f172a;
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .t2-report .container{
      max-width: 900px;
      margin: 24px auto;
      background: #FFF9F5;
      background: var(--card);
      padding: 36px 40px;
      border-radius: 16px;
      border: 1px solid #cfe3e6; /* fallback */
      border-color: var(--line);
      box-shadow: 0 8px 24px rgba(9, 90, 98, 0.08);
    }

    /* Header */
    .t2-report .header{
      text-align: center;
      padding-bottom: 18px;
      margin-bottom: 28px;
      border-bottom: 1px solid #cfe3e6;
      border-bottom-color: var(--line);
    }
    .t2-report .logo{
      font-weight: 700;
      font-size: 18px;
      color: #064750;
      color: var(--brand-ink);
      letter-spacing: .02em;
      margin-bottom: 6px;
    }
    .t2-report h1{
      margin: 0 0 6px;
      font-size: 24px;
      letter-spacing: -0.01em;
      color: #064750;
      color: var(--brand-ink);
    }
    .t2-report .header p{
      margin: 0;
      color: #4f6777;
      color: var(--muted);
    }

    /* Top stats / participant info (subtle, neutral) */
    .t2-report .participant-info{
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid #cfe3e6;
      border-color: var(--line);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 22px;
    }
    .t2-report .summary-stats{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
      gap: 12px;
    }
    .t2-report .stat-card{
      background: rgba(9, 90, 98, 0.05);
      border: 1px solid rgba(9, 90, 98, 0.15);
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .t2-report .stat-number{
      font-size: 22px;
      font-weight: 700;
      color: #064750;
      color: var(--brand-ink);
    }
    .t2-report .stat-label{
      font-size: 13px;
      color: #5b7285;
      color: var(--muted-2);
    }

    /* Top 5 table */
    .t2-report .glance{ margin: 22px 0; }
    .t2-report .glance h2{
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 700;
      color: #064750;
      color: var(--brand-ink);
    }
    .t2-report table{ width:100%; border-collapse: collapse; }
    .t2-report th, .t2-report td{
      padding: 10px 8px;
      border-bottom: 1px solid #cfe3e6;
      border-bottom-color: var(--line);
      font-size: 14px;
    }
    .t2-report th{
      text-align: left;
      color: #4f6777;
      color: var(--muted);
      font-weight: 600;
    }
    .t2-report .right{ text-align: right; }

    /* Persona cards */
    .t2-report .persona-card{
      border: 1px solid #cfe3e6;
      border-color: var(--line);
      border-radius: 12px;
      padding: 18px;
      margin: 18px 0;
      background: #FFF9F5;
      background: var(--card);
    }
    .t2-report .persona-card.primary{
      /* subtle teal wash, not a loud gradient */
      background: linear-gradient(180deg, hsla(188, 83%, 21%, 0.07), hsla(188, 83%, 21%, 0.04));
      border-color: hsla(188, 83%, 21%, 0.25);
    }

    .t2-report .persona-header{
      display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
    }
    .t2-report .persona-rank{
      background: #095A62;
      background: var(--brand);
      color: #FFFFFF;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .t2-report .persona-title{ flex:1; min-width: 0; }
    .t2-report .persona-name{
      font-size: 19px; font-weight: 800;
      color: #064750;
      color: var(--brand-ink);
      margin: 0;
    }
    .t2-report .persona-sub{
      display:flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;
    }
    .t2-report .meta{
      background: rgba(9, 90, 98, 0.06);
      color: #064750;
      color: var(--brand-ink);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      border: 1px solid rgba(9, 90, 98, 0.18);
    }
    .t2-report .meta-label{ opacity: .75; margin-right: 4px; }

    .t2-report .score-badge{
      border: 1px solid rgba(9, 90, 98, 0.2);
      color: #064750;
      color: var(--brand-ink);
      padding: 6px 12px;
      border-radius: 999px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.6);
      min-width: 58px;
      text-align: center;
    }

    .t2-report .persona-grid{
      display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px;
    }
    .t2-report .persona-section{ margin-top: 12px; }
    .t2-report .persona-section h4{
      margin: 0 0 6px; font-size: 15px; color: #064750; color: var(--brand-ink);
    }
    .t2-report .persona-section p{ margin: 0; color: #4f6777; color: var(--muted); }
    .t2-report ul{ margin: 0; padding-left: 18px; }
    .t2-report li{ margin: 4px 0; }

    /* Warn / Risk accents (sparingly use #E85A5A) */
    .t2-report .persona-section.warn{
      background: #FFF0F0;            /* fallback */
      background: var(--alert-bg);
      border-left: 4px solid #E85A5A; /* fallback */
      border-left-color: var(--alert);
      padding: 10px 12px;
      border-radius: 8px;
    }
    .t2-report .persona-section.risk{
      background: #FFF0F0;
      background: var(--alert-bg);
      border: 1px solid rgba(232, 90, 90, 0.35);
      border-left: 4px solid #E85A5A;
      border-radius: 10px;
      padding: 12px 12px;
    }
    .t2-report .persona-section.risk h4{
      color: #B04040;
    }

    /* Body prose under headings */
    .t2-report h2{
      margin: 16px 0 8px;
      font-size: 18px;
      font-weight: 700;
      color: #064750;
      color: var(--brand-ink);
    }
    .t2-report p{
      color: #4f6777;
      color: var(--muted);
    }

    /* Footer */
    .t2-report .footer{
      text-align: center;
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid #cfe3e6;
      border-top-color: var(--line);
      color: #5b7285;
      color: var(--muted-2);
      font-size: 13px;
    }

    /* Print */
    @media print{
      .t2-report{ background:#fff; }
      .t2-report .container{ box-shadow:none; border-color:#cfe3e6; }
      .t2-report .persona-card.primary{ background:#eaf6f7; }
      .t2-report a{ text-decoration:none; color: inherit; }
    }
  </style>
</head>
<body class="t2-report">
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
        <tbody>${topList}</tbody>
      </table>
    </div>

    <h2>Coaching Detail</h2>
    <p>Below are enriched insights for coaching conversations: overview, strengths, development edges, coaching focus, and suggested development plans.</p>

    ${primaryBlock}
    ${secondaryBlock}
    ${tertiaryBlock}

    <div class="footer">
      <p>This report is confidential and intended for coaching and professional development.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment</p>
    </div>
  </div>
</body>
</html>`;
}
