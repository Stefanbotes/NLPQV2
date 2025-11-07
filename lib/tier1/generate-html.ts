// lib/tier1/generate-html.ts
// Small, safe HTML renderer for Tier 1 using precomputed persona results.
// This file MUST export `renderTier1HTML` so other modules can import it.

export type PersonaCard = {
  schema: string;        // internal id (e.g. "The Clinger")
  publicName: string;    // human title
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

const escapeHtml = (s: string) =>
  String(s ?? "").replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c] as string));

const fmtDate = (d: string | Date) => {
  try { return new Date(d).toLocaleDateString(); }
  catch { return new Date().toLocaleDateString(); }
};

/**
 * Persona block with neutral classes so CSS controls all visuals.
 * (No inline colors; content + order unchanged.)
 */
function renderPersonaBlock(title: string, c: PersonaCard, variant: "primary" | "secondary") {
  const healthyLine = c.healthy
    ? `<div class="meta-line">Healthy expression: ${escapeHtml(c.healthy)}</div>`
    : "";

  const schemaLine = `<div class="schema-line">(${escapeHtml(c.schema)})</div>`;

  const emergingLine = c.emerging
    ? `<div class="emerging">⚠️ Emerging pattern${variant === "primary" ? " - may benefit from development focus" : ""}</div>`
    : "";

  if (variant === "primary") {
    return (
      `<div class="primary">` +
        `<div class="label">${escapeHtml(title)}</div>` +
        `<div class="score">${escapeHtml(c.publicName)}</div>` +
        healthyLine +
        schemaLine +
        `<div class="meta-line">Activation Index: ${Math.round(c.score)}/100</div>` +
        emergingLine +
      `</div>`
    );
  }

  return (
    `<div class="secondary">` +
      `<div class="label">${escapeHtml(title)}</div>` +
      `<div class="score">${escapeHtml(c.publicName)}</div>` +
      healthyLine +
      schemaLine +
      `<div class="meta-line">Activation Index: ${Math.round(c.score)}/100</div>` +
      emergingLine +
    `</div>`
  );
}

export function renderTier1HTML(args: RenderArgs): string {
  const {
    participantName,
    completedAt,
    totalQuestions,
    primary,
    secondary,
    tertiary,
    topDisplay = []
  } = args;

  const primaryBlock = primary ? renderPersonaBlock("Primary Leadership Persona", primary, "primary") : "";
  const secondaryBlock = secondary ? renderPersonaBlock("Secondary Leadership Persona", secondary, "secondary") : "";
  const tertiaryBlock = tertiary ? renderPersonaBlock("Tertiary Leadership Persona", tertiary, "secondary") : "";

  const topList = topDisplay.slice(0, 5).map(item => {
    const name = escapeHtml(item.schemaLabel);
    return (
      `<li>` +
        `<strong>${name}</strong>` +
        `<span class="muted"> (${name})</span>: ` +
        `${item.displayIndex}/100` +
      `</li>`
    );
  }).join("");

  const dateStr = fmtDate(completedAt);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leadership Summary - ${escapeHtml(participantName)}</title>
  <style>
    /* ===== Modern, minimal theme tokens ===== */
    :root{
      --ink:#0f172a;            /* slate-900 */
      --muted:#475569;          /* slate-600 */
      --muted-2:#64748b;        /* slate-500 */
      --line:#e5e7eb;           /* gray-200 */
      --bg:#f8fafc;             /* slate-50 */
      --card:#ffffff;           /* white */
      --brand:#095A62;          /* deep teal */
      --brand-ink:#063b41;      /* darker teal ink */
      --accent:#fcd0b1;         /* warm peach */
    }
    /* Optional monochrome mode: add class="mono" on <body> to force grayscale */
    .mono{
      --brand:#111827;
      --brand-ink:#111827;
      --accent:#e5e7eb;
    }

    /* ===== Base ===== */
    *{ box-sizing: border-box; }
    html,body{ margin:0; padding:0; }
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color:var(--ink);
      background:var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .muted{ color: var(--muted-2); }

    /* ===== Page shell ===== */
    .container{
      max-width: 860px;
      margin: 24px auto;
      background: var(--card);
      padding: 36px 40px;
      border-radius: 16px;
      border: 1px solid var(--line);
      box-shadow: 0 8px 24px rgba(2,8,23,0.06);
    }

    /* ===== Header ===== */
    .header{
      text-align:center;
      padding-bottom: 18px;
      margin-bottom: 28px;
      border-bottom: 1px solid var(--line);
    }
    .header h1{
      margin:0 0 4px;
      font-size: 26px;
      letter-spacing: -0.01em;
    }
    .header h2{
      margin:0 0 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--muted);
    }
    .header p{
      margin:4px 0;
      color: var(--muted);
    }

    /* ===== Sections & text ===== */
    .section{ margin: 28px 0; }
    .section h3{
      margin:0 0 8px;
      font-size: 16px;
      font-weight: 700;
    }
    .section p{ color: var(--muted); margin: 6px 0 0; }
    ul{ padding-left: 20px; margin: 8px 0 0; }
    li{ margin: 6px 0; line-height: 1.6; color: var(--ink); }

    /* ===== Cards ===== */
    .primary, .secondary{
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      background: var(--card);
    }
    /* Primary highlight: subtle brand wash */
    .primary{
      background: linear-gradient(180deg, rgba(9,90,98,0.07), rgba(9,90,98,0.04));
      border-color: rgba(9,90,98,0.25);
    }
    /* Secondary: light neutral */
    .secondary{
      background: #fafafa;
      border-color: var(--line);
    }

    /* ===== Persona typography ===== */
    .label{
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .score{ /* persona public name */
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
    }
    .primary .score{ color: var(--brand-ink); }
    .primary .label{ color: rgba(9,90,98,0.85); }

    .meta-line{
      margin: 8px 0;
      font-size: 14px;
      color: var(--muted);
    }
    .schema-line{
      margin: 5px 0;
      font-size: 13px;
      color: var(--muted-2);
    }
    .emerging{
      margin-top: 10px;
      font-size: 13px;
      color: #8a4b08; /* warm amber for caution */
    }

    /* ===== Footer ===== */
    .footer{
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 13px;
      text-align:center;
    }

    /* ===== Print polish ===== */
    @media print{
      body{ background:#fff; }
      .container{ box-shadow:none; border-color:#ddd; }
      .primary{ background:#f3fbfc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a{ text-decoration: none; color: inherit; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${escapeHtml(participantName)}</strong></p>
      <p>Generated: ${escapeHtml(dateStr)}</p>
    </div>

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    ${primaryBlock}
    ${secondaryBlock}
    ${tertiaryBlock}

    <div class="section">
      <h3>Complete Ranking</h3>
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>${topList}</ol>
    </div>

    <div class="section">
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">
        Questions answered: <strong>${totalQuestions}</strong>
      </div>
    </div>

    <div class="footer">
      <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment. Confidential.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Optional: If you also render Tier 2 in this file, keep visuals in sync */
/* ------------------------------------------------------------------ */

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

  const primaryBlock = primary ? renderPersonaBlock("Primary Leadership Persona", primary, "primary") : "";
  const secondaryBlock = secondary ? renderPersonaBlock("Secondary Leadership Persona", secondary, "secondary") : "";
  const tertiaryBlock = tertiary ? renderPersonaBlock("Tertiary Leadership Persona", tertiary, "secondary") : "";

  const topList = topDisplay.slice(0, 5).map(item => {
    const name = escapeHtml(item.schemaLabel);
    return (
      `<li>` +
        `<strong>${name}</strong>` +
        `<span class="muted"> (${name})</span>: ` +
        `${item.displayIndex}/100` +
      `</li>`
    );
  }).join("");

  const dateStr = fmtDate(completedAt);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leadership Summary - ${escapeHtml(participantName)}</title>
  <style>
    :root{
      --ink:#0f172a; --muted:#475569; --muted-2:#64748b; --line:#e5e7eb; --bg:#f8fafc;
      --card:#ffffff; --brand:#095A62; --brand-ink:#063b41; --accent:#fcd0b1;
    }
    .mono{ --brand:#111827; --brand-ink:#111827; --accent:#e5e7eb; }

    *{ box-sizing: border-box; }
    html,body{ margin:0; padding:0; }
    body{ font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color:var(--ink); background:var(--bg); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    .muted{ color: var(--muted-2); }

    .container{ max-width: 860px; margin: 24px auto; background: var(--card); padding: 36px 40px; border-radius: 16px;
      border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(2,8,23,0.06); }

    .header{ text-align:center; padding-bottom: 18px; margin-bottom: 28px; border-bottom: 1px solid var(--line); }
    .header h1{ margin:0 0 4px; font-size: 26px; letter-spacing: -0.01em; }
    .header h2{ margin:0 0 10px; font-size: 16px; font-weight: 600; color: var(--muted); }
    .header p{ margin:4px 0; color: var(--muted); }

    .section{ margin: 28px 0; }
    .section h3{ margin:0 0 8px; font-size: 16px; font-weight: 700; }
    .section p{ color: var(--muted); margin: 6px 0 0; }
    ul{ padding-left: 20px; margin: 8px 0 0; }
    li{ margin: 6px 0; line-height: 1.6; color: var(--ink); }

    .primary, .secondary{ border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin: 16px 0; background: var(--card); }
    .primary{ background: linear-gradient(180deg, rgba(9,90,98,0.07), rgba(9,90,98,0.04)); border-color: rgba(9,90,98,0.25); }
    .secondary{ background: #fafafa; border-color: var(--line); }

    .label{ font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 6px; }
    .score{ font-size: 20px; font-weight: 700; color: var(--ink); }
    .primary .score{ color: var(--brand-ink); }
    .primary .label{ color: rgba(9,90,98,0.85); }

    .meta-line{ margin: 8px 0; font-size: 14px; color: var(--muted); }
    .schema-line{ margin: 5px 0; font-size: 13px; color: var(--muted-2); }
    .emerging{ margin-top: 10px; font-size: 13px; color: #8a4b08; }

    .footer{ margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; text-align:center; }

    @media print{
      body{ background:#fff; }
      .container{ box-shadow:none; border-color:#ddd; }
      .primary{ background:#f3fbfc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a{ text-decoration: none; color: inherit; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leadership Personas Assessment</h1>
      <h2>Summary Report</h2>
      <p><strong>${escapeHtml(participantName)}</strong></p>
      <p>Generated: ${escapeHtml(dateStr)}</p>
    </div>

    <div class="section">
      <h3>Assessment Results</h3>
      <p>Your leadership assessment reveals distinct patterns that define your natural approach to leadership and team dynamics.</p>
    </div>

    ${primaryBlock}
    ${secondaryBlock}
    ${tertiaryBlock}

    <div class="section">
      <h3>Complete Ranking</h3>
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>${topList}</ol>
    </div>

    <div class="section">
      <div class="muted" style="font-size: 14px; margin-bottom: 15px;">
        Questions answered: <strong>${totalQuestions}</strong>
      </div>
    </div>

    <div class="footer">
      <p>This summary report uses the same canonical scoring methodology as Tier 2 and Tier 3 clinical reports.</p>
      <p>© ${new Date().getFullYear()} Leadership Personas Assessment. Confidential.</p>
    </div>
  </div>
</body>
</html>`;
}
