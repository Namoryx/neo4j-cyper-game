const preferredKeys = ['itemId', 'userId', 'id', 'name'];

function extractFromValue(value, returnKey) {
  if (value && typeof value === 'object') {
    if (returnKey && value[returnKey] !== undefined) return value[returnKey];
    for (const key of preferredKeys) {
      if (value[key] !== undefined) return value[key];
    }
  }
  return value;
}

export function extractValues(rows = [], returnKey) {
  if (!rows || !rows.length) return [];

  return rows.map((row) => {
    if (!row || typeof row !== 'object') return String(row);

    if (returnKey && row[returnKey] !== undefined) {
      return String(extractFromValue(row[returnKey], returnKey));
    }

    for (const key of preferredKeys) {
      if (row[key] !== undefined) return String(extractFromValue(row[key], returnKey));
    }

    const columns = Object.keys(row);
    if (!columns.length) return '';

    const value = row[columns[0]];
    const preferred = extractFromValue(value, returnKey);
    return String(preferred);
  });
}
