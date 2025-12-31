function mapFieldsToRows(fields = [], values = []) {
  return values.map((rowValues) => {
    const row = {};
    fields.forEach((field, idx) => {
      row[field] = rowValues?.[idx];
    });
    return row;
  });
}

function mapRecordsToRows(records = []) {
  return records.map((record) => {
    const keys =
      (Array.isArray(record?.keys) && record.keys) ||
      (Array.isArray(record?.columns) && record.columns) ||
      Object.keys(record ?? {});

    const indexedValues = Array.isArray(record?._fields)
      ? record._fields
      : Array.isArray(record?.fields)
        ? record.fields
        : Array.isArray(record?.values)
          ? record.values
          : Array.isArray(record?.row)
            ? record.row
            : null;

    if (indexedValues && keys?.length === indexedValues.length) {
      return keys.reduce((acc, key, idx) => ({ ...acc, [key]: indexedValues[idx] }), {});
    }

    const row = {};
    keys.forEach((key, idx) => {
      const value = Array.isArray(record?._fields)
        ? record._fields[idx]
        : Array.isArray(record?.fields)
          ? record.fields[idx]
          : Array.isArray(record?.values)
            ? record.values[idx]
            : record?.[key] ?? record?.[idx];
      row[key] = value;
    });

    return row;
  });
}

export function toRows(responseJson = {}) {
  if (!responseJson) return [];

  const recordSources = [
    responseJson?.data?.records,
    responseJson?.records,
    responseJson?.result?.records,
    responseJson?.data?.result?.records,
    responseJson?.result?.data?.records,
    Array.isArray(responseJson?.data) && responseJson.data.every((item) => item?.keys)
      ? responseJson.data
      : null,
  ];

  const records = recordSources.find((candidate) => Array.isArray(candidate));

  if (Array.isArray(records) && records.length) {
    return mapRecordsToRows(records);
  }

  if (responseJson?.data?.fields && Array.isArray(responseJson?.data?.values)) {
    return mapFieldsToRows(responseJson.data.fields, responseJson.data.values);
  }

  if (responseJson?.result?.data?.fields && Array.isArray(responseJson?.result?.data?.values)) {
    return mapFieldsToRows(responseJson.result.data.fields, responseJson.result.data.values);
  }

  if (Array.isArray(responseJson?.result?.data) && responseJson?.result?.columns) {
    const fields = responseJson.result.columns;
    const values = responseJson.result.data.map((item) => item?.row ?? item);
    return mapFieldsToRows(fields, values);
  }

  if (Array.isArray(responseJson?.data?.results) && responseJson.data.results[0]?.data) {
    const resultData = responseJson.data.results[0].data;
    if (Array.isArray(resultData)) {
      return resultData.map((item) => item?.row ?? item);
    }
  }

  if (Array.isArray(responseJson?.results)) {
    const first = responseJson.results[0];
    if (first?.columns && Array.isArray(first?.data)) {
      const fields = first.columns;
      const values = first.data.map((item) => item?.row ?? item);
      return mapFieldsToRows(fields, values);
    }
  }

  return [];
}

export function toScalarList(rows = []) {
  if (!rows.length) return [];
  const firstRow = rows[0];
  const columns = Object.keys(firstRow);
  if (!columns.length) return [];

  const key = columns[0];
  return rows.map((row) => row?.[key]);
}
