import { describe, expect, it } from 'vitest';
import { toRows } from './normalize.js';

describe('toRows', () => {
  it('maps neo4j record format to plain rows', () => {
    const response = {
      records: [
        {
          keys: ['name', 'age'],
          _fields: ['Alice', 30],
        },
      ],
    };

    expect(toRows(response)).toEqual([{ name: 'Alice', age: 30 }]);
  });
});
