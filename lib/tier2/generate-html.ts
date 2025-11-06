// lib/tier2/generate-html.ts
// Small, safe HTML renderer for Tier 2 using precomputed persona results.
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
    ? `<div style="margin: 8px 0; font-size: 14px; ${variant === "primary" ? "opacity:0.9;color:#fff;" : "color:#6b7280;"}">Healthy expression: ${escapeHtml(c.healthy)}</div>`
    : "";

  const schemaLine =
    variant === "primary"
      ? `<div style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 5px 0;">(${escapeHtml(c.schema)})</div>`
      : `<div style="color: #9CA3AF; font-size: 13px; margin: 5px 0;">(${escapeHtml(c.schema)})</div>`;

  const emergingLine = c.emerging
    ? (variant === "primary"
        ? `<div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">⚠️ Emerging pattern - may benefit from development focus</div>`
        : `<div style="margin-top: 8px; font-size: 14px; color: #6b7280;">⚠️ Emerging pattern</div>`
      )
    : "";

  if (variant === "primary") {
    return (
      `<div class="primary">` +
        `<div class="label">${escapeHtml(title)}</div>` +
        `<div class="score">${escapeHtml(c.publicName)}</div>` +
        healthyLine +
        schemaLine +
        `<div>Activation Index: ${Math.round(c.score)}/100</div>` +
        emergingLine +
      `</div>`
    );
  }

  return (
    `<div class="secondary">` +
      `<div class="label">${escapeHtml(title)}</div>` +
      `<div style="font-size: 18px; font-weight: bold; color: #374151;">${escapeHtml(c.publicName)}</div>` +
      healthyLine +
      schemaLine +
      `<div>Activation Index: ${Math.round(c.score)}/100</div>` +
      emergingLine +
    `</div>`
  );
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

  const primaryBlock = primary ? renderPersonaBlock("Primary Leadership Persona", primary, "primary") : "";
  const secondaryBlock = secondary ? renderPersonaBlock("Secondary Leadership Persona", secondary, "secondary") : "";
  const tertiaryBlock = tertiary ? renderPersonaBlock("Tertiary Leadership Persona", tertiary, "secondary") : "";

  const topList = topDisplay.slice(0, 5).map(item => {
    const name = escapeHtml(item.schemaLabel);
    return (
      `<li>` +
        `<strong>${name}</strong>` +
        `<span style="color:#9CA3AF"> (${name})</span>: ` +
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
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin: 30px 0; }
    .primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .secondary { background: #f1f5f9; padding: 15px; border-left: 4px solid #64748b; margin: 15px 0; }
    .score { font-size: 24px; font-weight: bold; color: #ffffff; }
    .label { font-size: 18px; margin-bottom: 10px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
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
      <div style="font-size: 14px; color: #64748b; margin-bottom: 15px;">All leadership personas (Top 5):</div>
      <ol>${topList}</ol>
    </div>

    <div class="section">
      <div style="font-size: 14px; color: #64748b; margin-bottom: 15px;">
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

