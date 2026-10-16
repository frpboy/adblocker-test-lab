const byLevel = {
  individual: ({ banners }) => banners.slice(0, 1),
  'banner-grid': ({ banners }) => banners,
  'native-social': ({ native, socialBar, smartlink }) => [native, socialBar, smartlink].filter(Boolean),
  intrusive: ({ popunder }) => popunder ? [popunder] : [],
  maximum: ({ banners, native, socialBar, smartlink }) => [...banners, native, socialBar, smartlink].filter(Boolean)
};

export function createAdsterraPlacements(config, level) {
  const placements = byLevel[level]?.(config.adsterra) ?? [];
  return placements.map((placement) => placement.kind === 'smartlink' ? { ...placement, manualOnly: true } : placement);
}

export async function runAdsterraPlacementSequence(placements, session, window) {
  for (const placement of placements) {
    if (placement.manualOnly) continue;
    if (placement.options) window.atOptions = placement.options;
    await session.start(placement);
    delete window.atOptions;
  }
}
