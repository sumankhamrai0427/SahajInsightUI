export const getColumns = (data: any[]) => {
  if (data.length === 0) return [];
  return Object.keys(data[0]); // dynamic keys
};

export const convertToTableRows = (data: any[], columns: string[]) => {
  return data.map((row) => columns.map((col) => row[col]));
};