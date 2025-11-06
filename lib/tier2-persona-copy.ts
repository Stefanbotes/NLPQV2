// app/lib/tier2-persona-copy.ts
// Tier-2 (Leadership) copy sourced from schema-pack.json (this is the truth)

import schemaPack from '@/data/schema-pack.json';

// ---------------- Types (compatible with your renderer & API) ----------------
export interface Tier2PersonaCopy {
  variableId?: string;                 // not in pack; we’ll store slug here as a stable id
  domain: string;                      // e.g. "Disconnection/Rejection"
  leadershipPersona: string;           // Tier-2 public name
  healthyPersona: string;              // Healthy expression label
  leadershipId?: string;               // slug (e.g. "abandonment_instability")
  clinicalId?: string;                 // optional (unused)
  publicDescription: string;           // short blurb (fallback from reflection/unmet)
  strengthFocus: string;               // short strength phrase (fallback from healthy_persona)
  developmentEdge: string;             // gentle growth nudge (fallbacks)
  coachingDescription?: string;        // we map from lios_interpretation as narrative
  growthFocus?: string;                // optional
  riskProfile?: string;                // optional
  tier2Insights?: {
    overview?: string;
    coachingFocus?: string;
    developmentPlan?: string;
  };
}

type LeadershipPrimary = {
  schema_id?: string;                 // slug e.g. "abandonment_instability"
  schema_name_clinical?: string;      // e.g. "Abandonment"
  schema_domain?: string;             // e.g. "Disconnection/Rejection"
  schema_domain_id?: string;          // e.g. "disconnection_rejection"
  schema_name_tier2?: string;         // e.g. "The Relationship Champion"
  leadership_persona?: string;        // alt public name
  healthy_persona?: string;           // e.g. "The Trust Builder"

  unmet_need?: string;
  surrender_behavior?: string;
  avoidance_behavior?: string;
  overcompensation_behavior?: string;
  maladaptive_modes?: string;         // comma/CSV or phrase list
  healthy_mode?: string;

  reflection_statement_1?: string;
  reflection_statement_2?: string;
  reflection_statement_3?: string;
  reflection_statement_4?: string;
  reflection_statement_5?: string;
  reflection_statement_6?: string;

  leadership_behavior_markers?: string; // <- use as Coaching Focus
  impact_on_team?: string;              // <- pipe into Development Plan
  decision_making_style?: string;       // <- pipe into Development Plan

  lios_interpretation?: string;         // <- use as Overview / coachingDescription
};

type SchemaNode = {
  leadership?: { primary?: LeadershipPrimary };
  clinical?: { primary?: unknown } | unknown; // unused for Tier-2 copy
};

type SchemaPack = {
  schemas: Record<string, SchemaNode>;
};

// -------------------------- helpers & normalization --------------------------
function titleCaseFromSlug(slug: string): string {
  return slug
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function compactJoin(parts: (string | undefined)[], sep = ' '): string {
  return parts.filter(Boolean).map(s => String(s).trim()).filter(Boolean).join(sep);
}

// Build a compact publicDescription fallback from available fields
function buildPublicDescription(p: LeadershipPrimary): string {
  // prefer a short line; fallbacks try to stay concise
  if (p.unmet_need) return p.unmet_need;
  if (p.lios_interpretation) return p.lios_interpretation;
  const refl = [
    p.reflection_statement_1, p.reflection_statement_2, p.reflection_statement_3
  ].filter(Boolean).map(s => String(s).replace(/^\s*\d+\)\s*/, '').trim());
  if (refl.length) return refl.join(' ');
  return '';
}

// Build strength and development brief lines from healthy/mode/behaviors
function buildStrengthFocus(p: LeadershipPrimary): string {
  return p.healthy_persona || p.healthy_mode || 'Leverage your natural advantages in context.';
}
function buildDevelopmentEdge(p: LeadershipPrimary): string {
  // if we have “decision_making_style” or behaviors we can nudge gently
  if (p.decision_making_style) return `Work with your style: ${p.decision_making_style}`;
  if (p.avoidance_behavior) return `Watch for avoidance: ${p.avoidance_behavior}`;
  if (p.overcompensation_behavior) return `Channel intensity: ${p.overcompensation_behavior}`;
  return 'Continue building on your natural strengths.';
}

// Turn a multi-idea string into bullet-friendly text (leave as single string; HTML will bulletize)
function flattenFocus(...chunks: (string | undefined)[]): string {
  return chunks.filter(Boolean).map(s => s!.trim()).join('\n');
}

// ----------------------------- extract & build map ---------------------------
type RawPersona = {
  id: string;                // slug
  schemaLabel: string;       // clinical short label from pack
  domain: string;            // schema_domain
  publicName: string;        // leadership_persona || schema_name_tier2 || Title(slug)
  healthyPersona: string;    // healthy_persona || healthy_mode || publicName
  publicDescription: string; // from unmet/lios/reflection
  strengthFocus: string;     // from healthy_persona/healthy_mode
  developmentEdge: string;   // from decision_making_style/behaviors (gentle)
  coachingDescription?: string; // from lios_interpretation
  growthFocus?: string;         // not present (reserved)
  riskProfile?: string;         // not present (reserved)
  tier2Insights: {
    overview?: string;          // lios_interpretation
    coachingFocus?: string;     // leadership_behavior_markers (+ behaviors)
    developmentPlan?: string;   // decision_making_style + impact_on_team
  };
};

// unpack the JSON
const pack = schemaPack as SchemaPack;

// Build RawPersona list
const RAW: RawPersona[] = Object.entries(pack.schemas || {}).map(([slug, node]) => {
  const pri: LeadershipPrimary = node?.leadership?.primary ?? {};

  const id = pri.schema_id || slug;
  const schemaLabel = pri.schema_name_clinical || titleCaseFromSlug(slug);
  const domain = pri.schema_domain || '';

  const publicName =
    pri.leadership_persona ||
    pri.schema_name_tier2 ||
    titleCaseFromSlug(slug);

  const healthyPersona =
    pri.healthy_persona ||
    pri.healthy_mode ||
    publicName;

  const publicDescription = buildPublicDescription(pri);
  const strengthFocus = buildStrengthFocus(pri);
  const developmentEdge = buildDevelopmentEdge(pri);

  // Enriched fields mapping to your truth:
  const overview = pri.lios_interpretation || undefined;

  // Coaching Focus: behavior markers + (optionally) key mode/behaviors compacted
  const coachingFocus = flattenFocus(
    pri.leadership_behavior_markers,
    pri.surrender_behavior && `Surrender: ${pri.surrender_behavior}`,
    pri.avoidance_behavior && `Avoidance: ${pri.avoidance_behavior}`,
    pri.overcompensation_behavior && `Overcompensation: ${pri.overcompensation_behavior}`,
    pri.maladaptive_modes && `Modes: ${pri.maladaptive_modes}`
  ) || undefined;

  // Development Plan: decision style + impact on team
  const developmentPlan = flattenFocus(
    pri.decision_making_style && `Decision style: ${pri.decision_making_style}`,
    pri.impact_on_team && `Impact on team: ${pri.impact_on_team}`
  ) || undefined;

  return {
    id,
    schemaLabel,
    domain,
    publicName,
    healthyPersona,
    publicDescription,
    strengthFocus,
    developmentEdge,
    coachingDescription: overview, // expose as narrative too
    tier2Insights: {
      overview,
      coachingFocus,
      developmentPlan,
    },
  };
});

// We’ll key by multiple aliases so lookups are resilient:
//  - clinical label (from pack, e.g. "Abandonment")
//  - slug (e.g. "abandonment_instability")
//  - a synthesized “clinical full” variant with slash if the slug looks like X_Y
function clinicalFullFromSlug(slug: string): string | null {
  if (!slug.includes('_')) return null;
  const bits = slug.split('_');
  if (bits.length < 2) return null;
  // naive join of first two into Title/Title
  const left = titleCaseFromSlug(bits[0]);
  const right = titleCaseFromSlug(bits[1]);
  return `${left}/${right}`;
}

export const TIER2_PERSONA_BY_SCHEMA: Record<string, Tier2PersonaCopy> = (() => {
  const map: Record<string, Tier2PersonaCopy> = {};

  for (const p of RAW) {
    const entry: Tier2PersonaCopy = {
      variableId: p.id,               // store slug as stable id
      domain: p.domain || '',
      leadershipPersona: p.publicName || p.schemaLabel,
      healthyPersona: p.healthyPersona || p.publicName || p.schemaLabel,
      leadershipId: p.id,
      publicDescription: p.publicDescription || '',
      strengthFocus: p.strengthFocus || '',
      developmentEdge: p.developmentEdge || '',
      coachingDescription: p.coachingDescription,
      growthFocus: undefined,
      riskProfile: undefined,
      tier2Insights: p.tier2Insights
    };

    // Primary key: clinical label from pack (e.g. "Abandonment")
    if (p.schemaLabel) map[p.schemaLabel] = entry;

    // Alias: slug (e.g. "abandonment_instability")
    if (p.id) map[p.id] = entry;

    // Alias: synthesized "Abandonment/Instability" style (matches scorer labels)
    const clinicalFull = clinicalFullFromSlug(p.id);
    if (clinicalFull) map[clinicalFull] = entry;
  }

  return map;
})();

// ------------------------------ public helpers ------------------------------
export function schemaToPublic(schema: string): string {
  const k = normalizeKey(schema);
  return (
    TIER2_PERSONA_BY_SCHEMA[k]?.leadershipPersona ??
    schema
  );
}

export function schemaToHealthy(schema: string): string {
  const k = normalizeKey(schema);
  const m = TIER2_PERSONA_BY_SCHEMA[k];
  return m?.healthyPersona ?? m?.leadershipPersona ?? schema;
}

export function schemaToDomain(schema: string): string {
  const k = normalizeKey(schema);
  return TIER2_PERSONA_BY_SCHEMA[k]?.domain ?? '';
}

export function schemaToVariableId(schema: string): string {
  const k = normalizeKey(schema);
  // we stored the slug in variableId for stability
  return TIER2_PERSONA_BY_SCHEMA[k]?.variableId ?? '';
}

export function personaCopy(schema: string): Tier2PersonaCopy | null {
  const k = normalizeKey(schema);
  return TIER2_PERSONA_BY_SCHEMA[k] ?? null;
}

/** Score-aware blurb (Tier-2): prefer curated overview/coaching text */
export function narrativeFor(schema: string, displayIndex: number): string {
  const m = personaCopy(schema);
  if (!m) return 'You can leverage this tendency to lead more effectively.';

  const base =
    m.tier2Insights?.overview ||
    m.coachingDescription ||
    m.publicDescription ||
    'You can leverage this tendency to lead more effectively.';

  const idx = Number(displayIndex) || 0;
  const tone =
    idx >= 80 ? 'This is a distinctive strength right now.' :
    idx >= 60 ? 'This is an active capability to keep cultivating.' :
                'This is emerging and small investments will compound.';

  return `${base} ${tone}`;
}

// ------------------------------- key normalization --------------------------
function normalizeKey(label: string): string {
  const raw = String(label ?? '').trim();
  if (!raw) return raw;

  // exact
  if (TIER2_PERSONA_BY_SCHEMA[raw]) return raw;

  // try slug
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (TIER2_PERSONA_BY_SCHEMA[slug]) return slug;

  // try "Abandonment/Instability" synthesized form from slug
  const fromSlug = clinicalFullFromSlug(slug);
  if (fromSlug && TIER2_PERSONA_BY_SCHEMA[fromSlug]) return fromSlug;

  // try replacing "/" ↔ " " and collapsing
  const swap1 = raw.replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
  if (TIER2_PERSONA_BY_SCHEMA[swap1]) return swap1;

  const swap2 = raw.replace(/\s+\/\s+|\s+and\s+/gi, '/');
  if (TIER2_PERSONA_BY_SCHEMA[swap2]) return swap2;

  return raw;
}
