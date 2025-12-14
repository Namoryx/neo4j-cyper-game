function mapFieldsToRows(fields = [], values = []) {
  return values.map((rowValues) => {
    const row = {};
    fields.forEach((field, idx) => {
      row[field] = rowValues?.[idx];
    });
    return row;
  });
}

export function toRows(responseJson = {}) {
  if (!responseJson) return [];

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
