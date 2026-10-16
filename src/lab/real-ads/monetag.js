export function createMonetagPlacements(config, level) {
  if (!['individual', 'maximum'].includes(level)) return [];
  const formats = config.monetag?.formats ?? [];
  return level === 'individual' ? formats.slice(0, 1) : formats.filter(({ compatible }) => compatible !== false);
}
