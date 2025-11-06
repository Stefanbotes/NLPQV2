// app/lib/tier2-persona-copy.ts
// Tier-2 (Leadership) copy sourced from schema-pack.json
// Keys MUST match your scorer's lookup key: we try schemaLabel → publicName → id (in that order).

import schemaPack from '@/data/schema-pack.json';

// ---- Types from your Tier 2 usage (kept compatible) -------------------------
export interface Tier2PersonaCopy {
  // Optional now, since schema-pack may not include it
  variableId?: string;                 // "1.1" ..."5.4" (if present)
  domain: string;                      // e.g., "Disconnection/Rejection"
  leadershipPersona: string;           // Public name shown in Tier 2
  healthyPersona: string;              // Healthy expression label (fallbacks applied)
  leadershipId?: string;               // Internal key (we'll use persona.id)
  clinicalId?: string;                 // Optional internal key (left blank if N/A)
  publicDescription: string;           // 1-liner blurb
  strengthFocus: string;               // short strength phrase
  developmentEdge: string;             // gentle growth nudge

  // Extra Tier-2 coaching fields (present in schema-pack)
  coachingDescription?: string;
  growthFocus?: string;
  riskProfile?: string;
  tier2Insights?: {
    overview?: string;
    coachingFocus?: string;
    developmentPlan?: string;
  };
}

// Shape we expect per `schema-pack.json`
type RawPersona = {
  id: string;
  schemaLabel?: string;         // if present, we’ll key on this first
  variableId?: string;          // "1.1" ... "5.4" (optional)
  domain: string;
  publicName: string;           // Tier-2 visible name
  clinicalName?: string;
  publicDescription?: string;
  strengthFocus?: string;
  developmentEdge?: string;
  coachingDescription?: string;
  growthFocus?: string;
  riskProfile?: string;
  tier2Insights?: {
    overview?: string;
    coachingFocus?: string;
    developmentPlan?: string;
  };
};

// Prefer schemaLabel → publicName → id for the map key
const keyFor = (p: RawPersona) =>
  (p.schemaLabel || p.publicName || p.id || '').trim();

// Healthy label fallback order:
// 1) explicit healthyPersona in JSON (if you add it later)
// 2) strengthFocus (good Tier-2 “healthy expression” proxy)
// 3) publicName (never blank)
const healthyFor = (p: RawPersona & { healthyPersona?: string }) =>
  p.healthyPersona?.trim() || p.strengthFocus?.trim() || p.publicName?.trim() || '';

// Build the lookup map once at load
const RAW = (schemaPack as RawPersona[]) || [];

export const TIER2_PERSONA_BY_SCHEMA: Record<string, Tier2PersonaCopy> = RAW.reduce(
  (acc, p) => {
    const key = keyFor(p);
    if (!key) return acc; // skip invalid rows

    const entry: Tier2PersonaCopy = {
      variableId: p.variableId,
      domain: p.domain || '',
      leadershipPersona: p.publicName || key,   // visible name
      healthyPersona: healthyFor(p as any) || p.publicName || key,
      leadershipId: p.id,                       // preserve original id for traceability
      // clinicalId intentionally left undefined for Tier-2
      publicDescription: p.publicDescription || '',
      strengthFocus: p.strengthFocus || '',
      developmentEdge: p.developmentEdge || '',
      coachingDescription: p.coachingDescription,
      growthFocus: p.growthFocus,
      riskProfile: p.riskProfile,
      tier2Insights: p.tier2Insights
    };

    acc[key] = entry;
    return acc;
  },
  {} as Record<string, Tier2PersonaCopy>
);

// ---------- Helpers (stable names, zero drift) ----------------------

export function schemaToPublic(schema: string): string {
  return TIER2_PERSONA_BY_SCHEMA[schema]?.leadershipPersona
    ?? // fallbacks if caller passed a different key
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)]?.leadershipPersona
    ?? schema;
}

export function schemaToHealthy(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema]
    ?? TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.healthyPersona ?? m?.leadershipPersona ?? schema;
}

export function schemaToDomain(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema]
    ?? TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.domain ?? '';
}

export function schemaToVariableId(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema]
    ?? TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.variableId ?? '';
}

export function personaCopy(schema: string): Tier2PersonaCopy | null {
  return (
    TIER2_PERSONA_BY_SCHEMA[schema]
    ?? TIER2_PERSONA_BY_SCHEMA[findLoose(schema)]
    ?? null
  );
}

/** Score-aware blurb (Tier-2): prioritise curated Tier-2 insights, then fall back to publicDescription + tone */
export function narrativeFor(schema: string, displayIndex: number): string {
  const m = personaCopy(schema);
  if (!m) return 'You can leverage this tendency to lead more effectively.';

  // Prefer the long-form coaching overview if present
  const base =
    m.tier2Insights?.overview
    || m.coachingDescription
    || m.publicDescription
    || 'You can leverage this tendency to lead more effectively.';

  const idx = Number(displayIndex) || 0;
  const tone =
    idx >= 80 ? 'This is a distinctive strength right now.' :
    idx >= 60 ? 'This is an active capability to keep cultivating.' :
                'This is emerging and small investments will compound.';

  return `${base} ${tone}`;
}

// --- small helper: tolerate caller giving us publicName when schemaLabel was the map key (or vice versa)
function findLoose(label: string): string {
  const needle = label.trim().toLowerCase();
  // exact publicName match?
  for (const [k, v] of Object.entries(TIER2_PERSONA_BY_SCHEMA)) {
    if (v.leadershipPersona.trim().toLowerCase() === needle) return k;
  }
  // exact id match?
  for (const [k, v] of Object.entries(TIER2_PERSONA_BY_SCHEMA)) {
    if (v.leadershipId?.trim().toLowerCase() === needle) return k;
  }
  return label; // fallback: return original
}
