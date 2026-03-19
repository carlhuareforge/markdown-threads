import * as assert from 'assert';
import { slugify } from '../../utils/hash';

suite('Hash Utils Test Suite', () => {
  test('slugify creates URL-safe slugs', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
    assert.strictEqual(slugify('Authentication Flow'), 'authentication-flow');
    assert.strictEqual(slugify('API v2.0 Endpoints'), 'api-v20-endpoints');
    assert.strictEqual(slugify('  Leading and Trailing  '), 'leading-and-trailing');
    assert.strictEqual(slugify('Multiple   Spaces'), 'multiple-spaces');
    assert.strictEqual(slugify('Special!@#$Characters'), 'specialcharacters');
  });

  test('slugify handles edge cases', () => {
    assert.strictEqual(slugify(''), '');
    assert.strictEqual(slugify('---'), '');
    assert.strictEqual(slugify('A'), 'a');
  });
});
