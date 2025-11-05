import { getPersonaMapping } from "@/lib/tier1-persona-copy"; // or copy that helper in here

export function generateTier1HTML(
  bioData: any,
  topPersonas: any[],
  responses: Record<string, any>,
  completedAt: string
) {
  const reportDate = new Date(completedAt).toLocaleDateString();
  const totalQuestions = Object.keys(responses || {}).length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leadership Personas Assessment Report - ${bioData.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      min-height: 100vh;
    }
    .report-container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 30px; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold;
      background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;
    }
    .persona-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 5px solid #4f46e5; }
    .persona-rank { background: #4f46e5; color: white; width: 30px; height: 30px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;
    }
    .persona-header { display: flex; align-items: center; margin-bottom: 15px; }
    .persona-name { font-size: 20px; font-weight: bold; color: #1e293b; }
    .persona-focus { color: #4f46e5; font-weight: 600; margin-top: 5px; }
    .score-badge { margin-left: auto; background: #4f46e5; color: white; padding: 5px 15px;
      border-radius: 20px; font-weight: bold;
    }
    .development-edge { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="logo">Leadership Personas Assessment</div>
      <h1>Personal Leadership Report</h1>
      <p>${bioData.name} — ${reportDate}</p>
    </div>
    ${topPersonas.map((p, i) => {
      const map = getPersonaMapping();
      const data = map[p.persona] || {
        publicName: p.persona,
        strengthFocus: "Leadership Qualities",
        coachingDescription: "You demonstrate distinctive leadership qualities.",
        developmentEdge: "Continue building on your natural strengths."
      };
      return `
        <div class="persona-card">
          <div class="persona-header">
            <div class="persona-rank">#${i + 1}</div>
            <div><div class="persona-name">${data.publicName}</div>
            <div class="persona-focus">${data.strengthFocus}</div></div>
            <div class="score-badge">${Math.round(p.percentage)}%</div>
          </div>
          <p><strong>Your Strength:</strong> ${data.coachingDescription}</p>
          <div class="development-edge"><strong>Development Edge:</strong> ${data.developmentEdge}</div>
        </div>`;
    }).join('')}
    <div class="footer" style="text-align:center;margin-top:30px;color:#64748b;font-size:14px;">
      <p>This report is confidential and intended for personal development purposes.</p>
      <p>Generated ${new Date().toLocaleDateString()} &copy; Leadership Personas Assessment</p>
    </div>
  </div>
</body>
</html>`;
}
