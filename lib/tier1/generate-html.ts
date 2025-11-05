
const html = renderTier1HTML({
  participantName,
  completedAt,                      // a date or ISO string
  totalQuestions: Object.keys(responses).length,
  primary: primary && {
    schema: primary.schemaLabel,
    publicName: schemaToPublic(primary.schemaLabel),
    healthy: schemaToHealthy(primary.schemaLabel),
    score: primary.index0to100,
    emerging: (primary as any).caution || primary.index0to100 < 60,
  },
  secondary: secondary && {
    schema: secondary.schemaLabel,
    publicName: schemaToPublic(secondary.schemaLabel),
    healthy: schemaToHealthy(secondary.schemaLabel),
    score: secondary.index0to100,
    emerging: (secondary as any).caution || secondary.index0to100 < 60,
  },
  tertiary: tertiary && {
    schema: tertiary.schemaLabel,
    publicName: schemaToPublic(tertiary.schemaLabel),
    healthy: schemaToHealthy(tertiary.schemaLabel),
    score: tertiary.index0to100,
    emerging: (tertiary as any).caution || tertiary.index0to100 < 60,
  },
  topDisplay: display?.map(d => ({ schemaLabel: d.schemaLabel, displayIndex: d.displayIndex })) ?? [],
});
