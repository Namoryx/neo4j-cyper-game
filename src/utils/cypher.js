export function ensureLimit(query, limit = 50) {
  if (!query) return '';
  const trimmed = query.trim();
  if (!trimmed) return '';
  const withoutSemicolon = trimmed.replace(/;\s*$/, '');
  const hasLimit = /\blimit\b\s+\d+/i.test(withoutSemicolon);
  if (hasLimit) return withoutSemicolon;
  return `${withoutSemicolon} LIMIT ${limit}`;
}
