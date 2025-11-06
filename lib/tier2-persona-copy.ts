// app/lib/tier2-persona-copy.ts
// Tier-2 (Leadership) copy sourced from schema-pack.json

import schemaPack from '@/data/schema-pack.json';

// ---------------- Types (compatible with your current usage) -----------------
export interface Tier2PersonaCopy {
  variableId?: string;                 // e.g. "1.1"
  domain: string;                      // e.g. "Disconnection/Rejection"
  leadershipPersona: string;           // Public Tier-2 name
  healthyPersona: string;              // Healthy expression label
  leadershipId?: string;               // stable internal key (schema slug)
  clinicalId?: string;                 // optional internal key
  publicDescription: string;           // short blurb
  strengthFocus: string;               // short strength phrase
  developmentEdge: string;             // gentle growth nudge
  coachingDescription?: string;
  growthFocus?: string;
  riskProfile?: string;
  tier2Insights?: {
    overview?: string;
    coachingFocus?: string;
    developmentPlan?: string;
  };
}

type RawPersona = {
  id: string;                // schema slug, e.g. "abandonment_instability"
  schemaLabel?: string;      // clinical label, e.g. "Abandonment/Instability"
  variableId?: string;       // "1.1"
  domain: string;
  publicName: string;        // Tier-2 public name
  healthyPersona?: string;   // healthy expression
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

// ------------------------- helpers for data extraction -----------------------
function titleFromSlug(slug: string): string {
  // "abandonment_instability" -> "Abandonment Instability"
  return slug
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function keyFor(p: RawPersona) {
  // Prefer the clinical schema label (matches your scorer keys), then publicName, then id
  return (p.schemaLabel || p.publicName || p.id || '').trim();
}

function healthyFor(p: RawPersona) {
  return (
    p.healthyPersona?.trim() ||
    p.strengthFocus?.trim() ||
    p.publicName?.trim() ||
    ''
  );
}

// ---------------------- unwrap schema-pack into array ------------------------
type SchemaPack = {
  version: string;
  buildHash?: string;
  generatedAt?: string;
  schemaCount?: number;
  sourceFiles?: string[];
  schemas: Record<
    string,
    {
      leadership?: {
        primary?: {
          schema_id?: string;                // "1.1"
          schema_name_clinical?: string;     // "Abandonment/Instability"
          schema_name_public?: string;       // Tier-2 name (if present)
          public_description?: string;
          strength_focus?: string;
          development_edge?: string;
          healthy_expression?: string;
          overview?: string;
          coaching_focus?: string;
          development_plan?: string;
          growth_focus?: string;
          risk_profile?: string;
          // reflection_statement_1..6 etc may exist but not used here
        };
      };
      metadata?: {
        domain_name?: string;                // "Disconnection/Rejection"
        variable_id?: string;                // "1.1"
        schema_label?: string;               // clinical label
        leadership_persona?: string;         // public name alt
      };
      clinical?: unknown;                    // ignored in Tier-2
    }
  >;
};

const pack = schemaPack as SchemaPack;

const RAW: RawPersona[] = Object.entries(pack.schemas || {}).map(([id, s]) => {
  const pri = s?.leadership?.primary ?? {};
  const meta = s?.metadata ?? {};

  const variableId =
    pri.schema_id || meta.variable_id || undefined;

  const schemaLabel =
    pri.schema_name_clinical || meta.schema_label || undefined;

  const publicName =
    pri.schema_name_public ||
    meta.leadership_persona ||
    titleFromSlug(id);

  const domain =
    meta.domain_name || '';

  // Prefer dedicated healthy expression; fallback to strength focus or public name
  const healthyPersona =
    pri.healthy_expression ||
    pri.strength_focus ||
    publicName;

  // Prefer long-form overview for narrative, but keep separate fields too
  const publicDescription =
    pri.public_description || '';

  const strengthFocus =
    pri.strength_focus || '';

  const developmentEdge =
    pri.development_edge || '';

  const coachingDescription = pri.overview || undefined; // map overview → coachingDescription
  const growthFocus = pri.growth_focus || undefined;
  const riskProfile = pri.risk_profile || undefined;

  const tier2Insights = {
    overview: pri.overview || undefined,
    coachingFocus: pri.coaching_focus || undefined,
    developmentPlan: pri.development_plan || undefined
  };

  return {
    id,
    schemaLabel,
    variableId,
    domain,
    publicName,
    healthyPersona,
    publicDescription,
    strengthFocus,
    developmentEdge,
    coachingDescription,
    growthFocus,
    riskProfile,
    tier2Insights
  };
});

// ----------------------- build the exported lookup map -----------------------
export const TIER2_PERSONA_BY_SCHEMA: Record<string, Tier2PersonaCopy> = RAW.reduce(
  (acc, p) => {
    const key = keyFor(p);
    if (!key) return acc;

    const entry: Tier2PersonaCopy = {
      variableId: p.variableId,
      domain: p.domain || '',
      leadershipPersona: p.publicName || key,
      healthyPersona: healthyFor(p) || p.publicName || key,
      leadershipId: p.id,
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

// ------------------------------ public helpers ------------------------------
export function schemaToPublic(schema: string): string {
  return (
    TIER2_PERSONA_BY_SCHEMA[schema]?.leadershipPersona ??
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)]?.leadershipPersona ??
    schema
  );
}

export function schemaToHealthy(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema] ??
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.healthyPersona ?? m?.leadershipPersona ?? schema;
}

export function schemaToDomain(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema] ??
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.domain ?? '';
}

export function schemaToVariableId(schema: string): string {
  const m =
    TIER2_PERSONA_BY_SCHEMA[schema] ??
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)];
  return m?.variableId ?? '';
}

export function personaCopy(schema: string): Tier2PersonaCopy | null {
  return (
    TIER2_PERSONA_BY_SCHEMA[schema] ??
    TIER2_PERSONA_BY_SCHEMA[findLoose(schema)] ??
    null
  );
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

// tolerate callers passing publicName/id when our map is keyed by schemaLabel
function findLoose(label: string): string {
  const needle = label.trim().toLowerCase();

  // match by public name
  for (const [k, v] of Object.entries(TIER2_PERSONA_BY_SCHEMA)) {
    if (v.leadershipPersona.trim().toLowerCase() === needle) return k;
  }
  // match by internal id (slug)
  for (const [k, v] of Object.entries(TIER2_PERSONA_BY_SCHEMA)) {
    if ((v.leadershipId ?? '').trim().toLowerCase() === needle) return k;
  }
  return label;
}
