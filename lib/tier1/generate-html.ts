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
    /* ==========================================
       Tier-1 namespaced + legacy-safe color CSS
       ========================================== */

    .t1-report{
      /* Brand tokens (legacy HSL with commas) */
      --bg: hsl(24, 60%, 98%);             /* #FFF9F5 */
      --ink: hsl(195, 80%, 10%);           /* deep teal text */
      --muted: hsl(195, 20%, 40%);         /* subdued teal */
      --muted-2: hsl(195, 20%, 45%);
      --card: hsl(24, 60%, 98%);
      --line: hsl(188, 30%, 88%);
      --brand: hsl(188, 83%, 21%);         /* #095A62 */
      --brand-ink: hsl(188, 83%, 18%);
      --accent: hsl(24, 65%, 90%);         /* peach */
    }

    .t1-report *{ box-sizing: border-box; }
    .t1-report{ margin:0; padding:0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

    /* Body background/text with **fallbacks before vars** */
    .t1-report{
      background: #FFF9F5;
      background: var(--bg);
      color: #0f172a; /* slate-900-ish fallback */
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .t1-report .muted{
      color: #5b7285;       /* fallback */
      color: var(--muted-2);
    }

    /* Page shell */
    .t1-report .container{
      max-width: 860px;
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
    .t1-report .header{
      text-align:center;
      padding-bottom: 18px;
      margin-bottom: 28px;
      border-bottom: 1px solid #cfe3e6;
      border-bottom-color: var(--line);
    }
    .t1-report .header h1{
      margin:0 0 4px;
      font-size: 26px;
      letter-spacing: -0.01em;
      color: #064750;
      color: var(--brand-ink);
    }
    .t1-report .header h2{
      margin:0 0 10px;
      font-size: 16px;
      font-weight: 600;
      color: #4f6777;
      color: var(--muted);
    }
    .t1-report .header p{
      margin:4px 0;
      color: #4f6777;
      color: var(--muted);
    }

    /* Sections */
    .t1-report .section{ margin: 28px 0; }
    .t1-report .section h3{
      margin:0 0 8px;
      font-size: 16px;
      font-weight: 700;
      color: #064750;
      color: var(--brand-ink);
    }
    .t1-report .section p{
      color: #4f6777;
      color: var(--muted);
      margin: 6px 0 0;
    }
    .t1-report ul{ padding-left: 20px; margin: 8px 0 0; }
    .t1-report li{
      margin: 6px 0; line-height: 1.6;
      color: #0f172a;
      color: var(--ink);
    }

    /* Cards */
    .t1-report .primary, .t1-report .secondary{
      border: 1px solid #cfe3e6;
      border-color: var(--line);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      background: #FFF9F5;
      background: var(--card);
    }
    .t1-report .primary{
      /* HSLA w/ commas; very subtle brand wash */
      background: linear-gradient(180deg, hsla(188, 83%, 21%, 0.07), hsla(188, 83%, 21%, 0.04));
      border-color: hsla(188, 83%, 21%, 0.25);
    }
    .t1-report .secondary{
      /* avoid slash alpha; use rgba fallback */
      background: rgba(255, 249, 245, 0.9);
      /* (keeps var card bg above as primary declaration) */
      border-color: var(--line);
    }

    /* Persona typography */
    .t1-report .label{
      font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
      color: #4f6777;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .t1-report .score{
      font-size: 20px; font-weight: 700;
      color: #0f172a;
      color: var(--ink);
    }
    .t1-report .primary .score{
      color: #064750;
      color: var(--brand-ink);
    }
    .t1-report .primary .label{
      color: rgba(9, 90, 98, 0.85);
    }

    .t1-report .meta-line{
      margin: 8px 0; font-size: 14px;
      color: #4f6777;
      color: var(--muted);
    }
    .t1-report .schema-line{
      margin: 5px 0; font-size: 13px;
      color: #5b7285;
      color: var(--muted-2);
    }
    .t1-report .emerging{
      margin-top: 10px; font-size: 13px;
      color: #8a4b08; /* warm amber note */
    }

    /* Footer */
    .t1-report .footer{
      margin-top: 30px; padding-top: 16px;
      border-top: 1px solid #cfe3e6;
      border-top-color: var(--line);
      color: #4f6777;
      color: var(--muted);
      font-size: 13px; text-align:center;
    }

    /* Print */
    @media print{
      .t1-report{
        background:#fff;
      }
      .t1-report .container{
        box-shadow:none; border-color: #cfe3e6;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .t1-report .primary{
        background: #eaf6f7; /* light teal for print */
      }
      .t1-report a{ text-decoration: none; color: inherit; }
    }
  </style>
</head>

<body class="t1-report">
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

