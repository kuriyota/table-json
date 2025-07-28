import Meta from '../package.json';

export interface TableJSONFormat<T = any> {
  '@table': string;
  columns: string[];
  rows: T[][];
}

export interface StringifyOptions {
  tableConversion?: 'auto' | 'force' | number;
  maxDepth?: number;
}

export function parse(input: string): any {
  try {
    const data = JSON.parse(input);
    return restoreTables(data);
  } catch (error) {
    throw new Error(
      `[TableJSON] JSON parse error : ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function restoreTables(data: any): any {
  if (Array.isArray(data)) {
    return data.map(restoreTables);
  }

  if (data && typeof data === 'object') {
    if (isTableFormat(data)) {
      return convertTableToObjects(data);
    }

    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = restoreTables(data[key]);
      }
    }
    return result;
  }

  return data;
}

export function isTableFormat(obj: any): obj is TableJSONFormat {
  return (
    obj &&
    typeof obj === 'object' &&
    obj['@table'] &&
    Array.isArray(obj.columns) &&
    Array.isArray(obj.rows)
  );
}

function convertTableToObjects(table: TableJSONFormat): any[] {
  return table.rows.map((row) => {
    const obj: Record<string, any> = {};
    table.columns.forEach((column, index) => {
      // 递归处理嵌套表格
      obj[column] = isTableFormat(row[index])
        ? convertTableToObjects(row[index])
        : restoreTables(row[index]);
    });
    return obj;
  });
}

export function stringify(
  data: any,
  options: StringifyOptions = {},
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2]
): string {
  const { tableConversion = 'auto', maxDepth = Infinity } = options;

  const processedData = convertToTableStructure(data, {
    tableConversion,
    maxDepth,
    currentDepth: 0
  });

  return JSON.stringify(processedData, replacer, space);
}

interface ConversionContext extends StringifyOptions {
  currentDepth: number;
  maxDepth: number;
}

function convertToTableStructure(data: any, context: ConversionContext): any {
  const { currentDepth, maxDepth } = context;

  if (currentDepth > maxDepth) {
    return data;
  }

  const nextContext = {
    ...context,
    currentDepth: currentDepth + 1
  };

  if (Array.isArray(data)) {
    if (shouldConvertArrayToTable(data, context)) {
      return createTableFormat(data, nextContext);
    }
    return data.map((item) => convertToTableStructure(item, nextContext));
  }

  if (data && typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertToTableStructure(data[key], nextContext);
      }
    }
    return result;
  }

  return data;
}

function shouldConvertArrayToTable(
  array: any[],
  context: ConversionContext
): boolean {
  const { tableConversion, maxDepth, currentDepth } = context;

  if (currentDepth > maxDepth) {
    return false;
  }

  if (tableConversion === 'force') {
    return (
      array.length > 0 &&
      array.every(
        (item) => item && typeof item === 'object' && !Array.isArray(item)
      )
    );
  }

  const threshold = typeof tableConversion === 'number' ? tableConversion : 10;

  if (array.length <= threshold) {
    return false;
  }

  const firstItem = array[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    return false;
  }

  const firstKeys = Object.keys(firstItem);

  return array.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const keys = Object.keys(item);
    return (
      keys.length === firstKeys.length &&
      keys.every((key) => firstKeys.includes(key))
    );
  });
}

function createTableFormat(
  array: any[],
  context: ConversionContext
): TableJSONFormat {
  if (array.length === 0) {
    return {
      '@table': 'v' + Meta.version,
      columns: [],
      rows: []
    };
  }

  const columns = Object.keys(array[0]);
  return {
    '@table': 'v' + Meta.version,
    columns,
    rows: array.map((obj) =>
      columns.map((column) =>
        // 递归处理嵌套对象
        convertToTableStructure(obj[column], context)
      )
    )
  };
}
