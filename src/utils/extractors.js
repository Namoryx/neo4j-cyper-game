const preferredKeys = ['itemId', 'userId', 'id', 'name'];

function findPreferredValue(value) {
  if (value && typeof value === 'object') {
    for (const key of preferredKeys) {
      if (value[key] !== undefined) return value[key];
    }
  }
  return value;
}

export function extractValues(rows = []) {
  if (!rows || !rows.length) return [];

  return rows.map((row) => {
    if (!row || typeof row !== 'object') return String(row);

    for (const key of preferredKeys) {
      if (row[key] !== undefined) return String(findPreferredValue(row[key]));
    }

    const columns = Object.keys(row);
    if (!columns.length) return '';

    const value = row[columns[0]];
    const preferred = findPreferredValue(value);
    return String(preferred);
  });
}
