# TableJSON

[简体中文](./README.zh.md)

A lightweight library for converting between object arrays and table-optimized JSON format.

[![npm version](https://img.shields.io/npm/v/@kuriyota/table-json)](https://www.npmjs.com/package/@kuriyota/table-json)
[![license](https://img.shields.io/npm/l/@kuriyota/table-json)](LICENSE)

## Features

- **Efficient serialization** of arrays of objects into table-optimized JSON format
- **Automatic detection** of array structures that benefit from table conversion
- **Customizable conversion** with options for forced conversion or depth control
- **Lightweight** with no external dependencies
- **TypeScript** support with included type definitions

## Installation

```bash
npm install @kuriyota/table-json
```

## Usage

### Basic Usage

```javascript
import { parse, stringify } from 'tablejson';

const data = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
  // ... hundreds more similar objects
];

// Convert to table-optimized JSON
const json = stringify(data);

// Convert back to original objects
const originalData = parse(json);
```

### API

#### `stringify(data: any, options?: StringifyOptions, replacer?, space?): string`

Converts JavaScript values to table-optimized JSON strings.

**Options:**

- `tableConversion`: `'auto' | 'force' | number` (default: `'auto'`)
  - `'auto'`: Automatically convert arrays when beneficial (as same as `10`)
  - `'force'`: Force conversion of all arrays of objects
  - `number`: convert when array length is greater than or equal to this number
- `maxDepth`: Maximum recursion depth (default: `Infinity`)

#### `parse(input: string): any`

Parses table-optimized JSON back into JavaScript objects.

#### `isTableFormat(obj: any): boolean`

Type guard to check if an object is in TableJSON format.

### Advanced Usage

```javascript
import { stringify } from 'tablejson';

const largeDataSet = [...]; // Array of thousands of similar objects

// Force table conversion regardless of size
const json1 = stringify(largeDataSet, { tableConversion: 'force' });

// Customize conversion threshold (convert arrays longer than 5 items)
const json2 = stringify(largeDataSet, { tableConversion: 5 });

// Limit recursion depth
const json3 = stringify(complexData, { maxDepth: 3 });
```

## TableJSON Format

The optimized format looks like this:

```json
{
  "@table": "1.0.0",
  "columns": ["id", "name", "age"],
  "rows": [
    [1, "Alice", 30],
    [2, "Bob", 25]
  ]
}
```

Instead of:

```json
[
  { "id": 1, "name": "Alice", "age": 30 },
  { "id": 2, "name": "Bob", "age": 25 }
]
```

## Performance Benefits

The table format provides significant benefits when:

- Dealing with large arrays of similar objects
- The JSON needs to be transferred over network
- Storage space is a concern
