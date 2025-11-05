// lib/tier1-report.ts
// NOTE: This file is server-only (no React). Keep it as .ts (not .tsx).

import { schemaToPublic, personaCopy } from '@/lib/tier1-persona-copy';

type TopPersonaInput = {
  // Support both shapes you might have:
  persona?: string;    // e.g. "The Clinger" or an internal schema key
  schema?: string;     // alternative field name
  percentage?: number; // 0..100
  idx?: number;        // alternative numeric
};

type BioData = {
  name: string;
  email?: string;
  team?: string;
  uniqueCode?: string;
};

export function generateTier1HTML(
  bioData: BioData,
  topPersonas: TopPersonaInput[],
  responses: Record<string, any>,
  completedAt: string
) {
  const reportDate = safeDate(completedAt);
  const totalQuestions = Object.keys(responses || {}).length;

  const personaCards = (topPersonas || []).map((p, i) => {
    const id = String(p.persona ?? p.schema ?? '').trim();
    const publicName = schemaToPublic(id) || id || 'Leadership Pattern';
    const copy = personaCopy(id) || {
      strengthFocus: 'Leadership Qualities',
      coachingDescription: 'You demonstrate distinctive leadership qualities.',
      developmentEdge: 'Continue building on your natural strengths.',
    };
    const pct = Math.round(Number(p.percentage ?? p.idx ?? 0));

    return `
      <div class="persona-card">
        <div class="persona-header">
          <div class="persona-rank">#${i + 1}</div>
          <div>
            <div class="persona-name">${escapeHtml(publicName)}</div>
            <div class="persona-focus">${escapeHtml(copy.strengthFocus || '')}</div>
          </div>
          <div class="score-badge">${isFinite(pct) ? pct : 0}%</div>
        </div>
        <div class="description">
          <strong>Your Strength:</strong> ${escapeHtml(copy.coachingDescription || '')}
        </div>
        <div class="development-edge">
          <strong>Development Edge:</strong> ${escapeHtml(copy.developmentEdge || '')}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leadership Personas Assessment Report - ${escapeHtml(bioData.name)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;
    }
    .report-container { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); }
    .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 30px; margin-bottom: 40px; }
    .logo {
      font-size: 32px; font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;
    }
    .participant-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .stat-label { color: #64748b; font-size: 14px; }
    .persona-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 5px solid #4f46e5; }
    .persona-header { display: flex; align-items: center; margin-bottom: 15px; }
    .persona-rank { background: #4f46e5; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-
