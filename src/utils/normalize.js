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
    const keys = record?.keys || record?.columns || [];

    keys.forEach((key, idx) => {
      const value = Array.isArray(record?._fields)
        ? record._fields[idx]
        : Array.isArray(record?.fields)
          ? record.fields[idx]
          : record?.[key] ?? record?.[idx];
      row[key] = value;
    });

    return row;
  });
}

export function toRows(responseJson = {}) {
  if (!responseJson) return [];

  const records = (() => {
    if (Array.isArray(responseJson?.data?.records)) return responseJson.data.records;
    if (Array.isArray(responseJson?.records)) return responseJson.records;
    if (Array.isArray(responseJson?.result?.records)) return responseJson.result.records;
    if (Array.isArray(responseJson?.data) && responseJson.data.every((item) => item?.keys)) {
      return responseJson.data;
    }
    return null;
  })();

  if (Array.isArray(records) && records.length) {
    return mapRecordsToRows(records);
  }

  if (Array.isArray(responseJson?.data) && responseJson?.columns) {
    const values = responseJson.data.map((item) => item?.row ?? item);
    return mapFieldsToRows(responseJson.columns, values);
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

  if (Array.isArray(responseJson?.data) && responseJson.data.every((item) => typeof item === 'object')) {
    return responseJson.data;
  }

  if (Array.isArray(responseJson) && responseJson.every((item) => typeof item === 'object')) {
    return responseJson;
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
