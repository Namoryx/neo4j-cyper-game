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
    const row = {};
    const keys = record?.keys || [];

    keys.forEach((key, idx) => {
      const value = Array.isArray(record?._fields)
        ? record._fields[idx]
        : record?.[key] ?? record?.[idx];
      row[key] = value;
    });

    return row;
  });
}

export function toRows(responseJson = {}) {
  if (!responseJson) return [];

  const records = responseJson?.data?.records || responseJson?.records;
  if (Array.isArray(records) && records.length) {
    return mapRecordsToRows(records);
  }

  if (responseJson?.data?.fields && Array.isArray(responseJson?.data?.values)) {
    return mapFieldsToRows(responseJson.data.fields, responseJson.data.values);
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
