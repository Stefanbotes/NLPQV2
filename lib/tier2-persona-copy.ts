// app/lib/tier2-persona-copy.ts
// Tier-2 (Leadership) copy sourced from schema-pack.json with robust lookup.
// We register multiple keys (clinical label, slug, public name, normalized variants)
// so personaCopy("Abandonment/Instability") always resolves.

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
  schemaLabel?: string;      // clinical, e.g. "Abandonment/Instability"
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

// Normalize: strip non-alphanumerics, lowercase
function norm(s?: string): string {
  return String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Common label variants (slashes, hyphens, “and”)
function variants(label: string): string[] {
  const base = label.trim();
  const v: string[] = [base];

  // Replace "/" with " " and " and "
  if (base.includes('/')) {
    v.push(base.replace(/\//g, ' '));
    v.push(base.replace(/\//g, ' and '));
  }
  // Replace "-" with " "
  if (base.includes('-')) {
    v.push(base.replace(/-/g, ' '));
  }
  // Collapse multiple spaces
  v.push(base.replace(/\s+/g, ' '));

  // De-duplicate variants
  const seen = new Set<string>();
  return v.filter(s => {
    const k = norm(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function healthyFor(p: RawPersona) {
  // Prefer healthyPersona; fallback to publicName; avoid falling back to clinical label
  return (
    p.healthyPersona?.trim() ||
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
          schema_name_public?: string;       // public Tier-2 persona
          public_description?: string;
          strength_focus?: string;
          development_edge?: string;
          healthy_expression?: string;
          overview?: string;
          coaching_focus?: string;
          development_plan?: string;
          growth_focus?: string;
          risk_profile?: string;
        };
      };
      metadata?: {
        domain_name?: string;                // "Disconnection/Rejection"
        variable_id?: string;                // "1.1"
        schema_label?: string;               // clinical label (alt)
        leadership_persona?: string;         // public name (alt)
      };
      clinical?: unknown;
    }
  >;
};

const pack = schemaPack as SchemaPack;

// Build raw items from the pack
const RAW: RawPersona[] = Object.entries(pack.schemas || {}).map(([id, s]) => {
  const pri = s?.leadership?.primary ?? {};
  const meta = s?.metadata ?? {};

  const variableId = pri.schema_id || meta.variable_id || undefined;
  const schemaLabel = (pri.schema_name_clinical || meta.schema_label || '').trim();
  const publicName = (pri.schema_name_public || meta.leadership_persona || titleFromSlug(id)).trim();
  const domain = (meta.domain_name || '').trim();

  // Healthy expression: prefer explicit field; do NOT fall back to the clinical label
  const healthyPersona = (pri.healthy_expression || '').trim() || publicName;

  const publicDescription = (pri.public_description || '').trim();
  const strengthFocus    = (pri.strength_focus || '').trim();
  const developmentEdge  = (pri.development_edge || '').trim();
  const coachingDescription = (pri.overview || '').trim() || undefined;
  const growthFocus      = (pri.growth_focus || '').trim() || undefined;
  const riskProfile      = (pri.risk_profile || '').trim() || undefined;

  const tier2Insights = {
    overview: (pri.overview || '').trim() || undefined,
    coachingFocus: (pri.coaching_focus || '').trim() || undefined,
    developmentPlan: (pri.development_plan || '').trim() || undefined
  };

  return {
    id, // slug
    schemaLabel: schemaLabel || undefined,
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
// We keep a “display” map by clinical label (if available) and a robust lookup map
// using normalized keys for clinical label, slug, public name, and punctuation variants.

const DISPLAY_MAP: Record<string, Tier2PersonaCopy> = {};
const LOOKUP_MAP: Map<string, Tier2PersonaCopy> = new Map();

function registerKey(key: string, entry: Tier2PersonaCopy) {
  if (!key) return;
  LOOKUP_MAP.set(norm(key), entry);
}

function registerEntry(p: RawPersona) {
  const entry: Tier2PersonaCopy = {
    variableId: p.variableId,
    domain: p.domain || '',
    leadershipPersona: p.publicName || p.schemaLabel || p.id,
    healthyPersona: healthyFor(p),
    leadershipId: p.id,
    publicDescription: p.publicDescription || '',
    strengthFocus: p.strengthFocus || '',
    developmentEdge: p.developmentEdge || '',
    coachingDescription: p.coachingDescription,
    growthFocus: p.growthFocus,
    riskProfile: p.riskProfile,
    tier2Insights: p.tier2Insights
  };

  // Primary display key = clinical label if present; else fall back to publicName; else slug title
  const displayKey = (p.schemaLabel || '').trim();
  if (displayKey) DISPLAY_MAP[displayKey] = entry;

  // Register robust lookup keys
  if (p.schemaLabel) {
    for (const v of variants(p.schemaLabel)) registerKey(v, entry);
  }
  // Public name variants
  if (p.publicName) {
    for (const v of variants(p.publicName)) registerKey(v, entry);
  }
  // Slug and title-from-slug
  registerKey(p.id, entry);
  registerKey(titleFromSlug(p.id), entry);

  return entry;
}

RAW.forEach(registerEntry);

// Main exported “by-schema” map (clinical labels preferred for display)
export const TIER2_PERSONA_BY_SCHEMA: Record<string, Tier2PersonaCopy> = DISPLAY_MAP;

// ------------------------------ public helpers ------------------------------
function findLoose(label: string): Tier2PersonaCopy | null {
  if (!label) return null;

  // 1) Exact clinical-label hit (display map)
  const direct = TIER2_PERSONA_BY_SCHEMA[label];
  if (direct) return direct;

  // 2) Robust normalized lookup (handles slashes, hyphens, spacing, slug, public name)
  const hit = LOOKUP_MAP.get(norm(label));
  if (hit) return hit;

  // 3) Last-chance: common manual substitutions
  const manual = LOOKUP_MAP.get(norm(label.replace(/\//g, ' '))) ||
                 LOOKUP_MAP.get(norm(label.replace(/\//g, ' and ')));
  return manual || null;
}

export function schemaToPublic(schema: string): string {
  const m = findLoose(schema);
  return m?.leadershipPersona ?? schema;
}

export function schemaToHealthy(schema: string): string {
  const m = findLoose(schema);
  // Prefer healthy expression; otherwise public label; never fall back to clinical name here
  return m?.healthyPersona ?? m?.leadershipPersona ?? schema;
}

export function schemaToDomain(schema: string): string {
  const m = findLoose(schema);
  return m?.domain ?? '';
}

export function schemaToVariableId(schema: string): string {
  const m = findLoose(schema);
  return m?.variableId ?? '';
}

export function personaCopy(schema: string): Tier2PersonaCopy | null {
  return findLoose(schema);
}

/** Score-aware blurb (Tier-2): prefer curated overview/coaching text */
export function narrativeFor(schema: string, displayIndex: number): string {
  const m = findLoose(schema);
  const base =
    m?.tier2Insights?.overview ||
    m?.coachingDescription ||
    m?.publicDescription ||
    'You can leverage this tendency to lead more effectively.';

  const idx = Number(displayIndex) || 0;
  const tone =
    idx >= 80 ? 'This is a distinctive strength right now.' :
    idx >= 60 ? 'This is an active capability to keep cultivating.' :
                'This is emerging and small investments will compound.';

  return `${base} ${tone}`;
}

