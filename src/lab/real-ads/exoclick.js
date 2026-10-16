export function createExoClickPlacements(config, level) {
  if (!['individual', 'maximum'].includes(level)) return [];
  const formats = config.exoclick?.formats ?? [];
  return level === 'individual' ? formats.slice(0, 1) : formats.filter(({ compatible }) => compatible !== false);
}
