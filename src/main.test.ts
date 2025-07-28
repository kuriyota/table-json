import { describe, expect, test } from 'vitest';
import { parse, stringify, type StringifyOptions } from './main';

describe('TableJSON format processing', () => {
  const sampleData = {
    users: [
      { id: 1, name: 'Alice', scores: [90, 85] },
      { id: 2, name: 'Bob', scores: { math: 80, physics: 75 } },
      { id: 3, name: 'Charlie', scores: [95, 90, 85] },
      { id: 4, name: 'David', scores: [100, 100, 100] },
      { id: 5, name: 'Eve', scores: [80, 85, 90] },
      { id: 6, name: 'Frank', scores: [75, 80, 85] },
      { id: 7, name: 'Grace', scores: [90, 90, 90] },
      { id: 8, name: 'Helen', scores: [85, 85, 85] },
      { id: 9, name: 'Irene', scores: [100, 100, 100] },
      { id: 10, name: 'James', scores: [80, 85, 90] }
    ],
    metadata: { date: '2024-03-20' }
  };

  test('Default options serialization and parsing', () => {
    const serialized = stringify(sampleData);
    const deserialized = parse(serialized);

    expect(deserialized).toEqual(sampleData);
  });

  test('Force conversion mode', () => {
    const options: StringifyOptions = { tableConversion: 'force' };
    const serialized = stringify(sampleData, options);
    const parsed = parse(serialized);

    // Should correctly restore nested structures
    expect(parsed.users[0].scores).toEqual([90, 85]);
    expect(parsed.users[1].scores).toEqual({ math: 80, physics: 75 });
    expect(parsed.metadata).toEqual({ date: '2024-03-20' });
  });

  test('Custom threshold handling', () => {
    const largeArray = Array(5)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        nested: Array(3).fill({ key: `value${i}` }) // Add nested array
      }));

    // Threshold above array length (no conversion)
    let options: StringifyOptions = { tableConversion: 6 };
    let serialized = stringify({ users: largeArray }, options);
    let parsed = JSON.parse(serialized);
    expect(Array.isArray(parsed.users)).toBe(true);

    // Threshold below array length (conversion)
    options = { tableConversion: 4 };
    serialized = stringify({ users: largeArray }, options);
    parsed = JSON.parse(serialized);
    expect(parsed.users?.['@table']).toBeDefined();

    // Verify nested array remains as array
    const restored = parse(serialized);
    expect(Array.isArray(restored.users[0].nested)).toBe(true);
  });

  test('Recursive depth control', () => {
    const nestedData = {
      level1: {
        level2: [
          { id: 1, name: 'Alice', level3: [{ value: 'deep' }] },
          { id: 2, name: 'Bob' }
        ]
      }
    };

    // Process only root level (depth 0)
    const options: StringifyOptions = { maxDepth: 0 };
    const serialized = stringify(nestedData, options);
    const parsed = JSON.parse(serialized);

    // level2 array should remain as array (not converted)
    expect(Array.isArray(parsed.level1.level2)).toBe(true);

    // Nested level3 should not be converted to table
    expect(Array.isArray(parsed.level1.level2[0].level3)).toBe(true);
  });

  test('Complex object with nested tables', () => {
    const complexData = {
      users: [
        {
          id: 1,
          profile: {
            name: 'Alice',
            contacts: [
              { type: 'email', value: 'alice@example.com' },
              { type: 'phone', value: '123-456' }
            ]
          }
        },
        {
          id: 2,
          profile: {
            name: 'Bob',
            contacts: [
              { type: 'email', value: 'bob@example.com' },
              { type: 'phone', value: '789-012' }
            ]
          }
        }
      ]
    };

    const serialized = stringify(complexData, { tableConversion: 'force' });
    const deserialized = parse(serialized);

    // Should restore all levels of nesting
    expect(deserialized.users[0].profile.contacts[0].type).toBe('email');
    expect(deserialized.users[1].profile.contacts[1].value).toBe('789-012');
    expect(deserialized).toEqual(complexData);
  });

  test('Empty array handling', () => {
    const data = { emptyArray: [] };
    const serialized = stringify(data);
    const deserialized = parse(serialized);

    expect(deserialized.emptyArray).toEqual([]);
  });

  test('Invalid data handling', () => {
    // Invalid JSON parsing
    expect(() => parse('invalid json')).toThrow('[TableJSON] JSON parse error');

    // Edge case serialization
    expect(() => stringify(undefined)).not.toThrow();
    expect(stringify(null)).toBe('null');

    // Circular reference should throw
    const circular: any = { a: null };
    circular.a = circular;
    expect(() => stringify(circular)).toThrow();
  });

  test('Multi-level table conversion', () => {
    const data = {
      departments: [
        {
          name: 'Engineering',
          teams: [
            { name: 'Frontend', members: 5 },
            { name: 'Backend', members: 7 }
          ]
        },
        {
          name: 'Design',
          teams: [
            { name: 'UI', members: 3 },
            { name: 'UX', members: 4 }
          ]
        }
      ]
    };

    const serialized = stringify(data, { tableConversion: 'force' });
    const parsed = parse(serialized);

    // Verify all levels restored correctly
    expect(parsed.departments[0].teams[0].name).toBe('Frontend');
    expect(parsed.departments[1].teams[1].members).toBe(4);
  });
});
