import * as assert from 'assert';
import { AnchorEngine } from '../../anchorEngine';
import type { CommentThread, MarkdownSection, CommentAnchor } from '../../models/types';

/** Helper: build a MarkdownSection */
function section(overrides: Partial<MarkdownSection> = {}): MarkdownSection {
  const heading = overrides.heading ?? 'Introduction';
  const content = overrides.content ?? 'Some intro content.';
  return {
    heading,
    slug: overrides.slug ?? 'introduction',
    level: overrides.level ?? 1,
    startLine: overrides.startLine ?? 0,
    endLine: overrides.endLine ?? 5,
    content,
  };
}

/** Helper: build a CommentThread */
function thread(overrides: Partial<CommentThread> = {}): CommentThread {
  return {
    id: overrides.id ?? 'thread-1',
    anchor: overrides.anchor ?? {
      sectionSlug: 'introduction',
      lineHint: 0,
    },
    status: overrides.status ?? 'open',
    thread: overrides.thread ?? [
      {
        id: 'entry-1',
        author: 'alice',
        body: 'Looks good',
        created: new Date().toISOString(),
      },
    ],
  };
}

suite('AnchorEngine Test Suite', () => {
  // ── createAnchor ─────────────────────────────────────────────────

  test('createAnchor returns correct anchor from a section', () => {
    const engine = new AnchorEngine();
    const sec = section();
    const anchor = engine.createAnchor(sec);

    assert.strictEqual(anchor.sectionSlug, 'introduction');
    assert.strictEqual(anchor.lineHint, sec.startLine);
  });

  test('createAnchor preserves different slugs and lines', () => {
    const engine = new AnchorEngine();
    const sec = section({
      heading: 'API Endpoints',
      slug: 'api-endpoints',
      startLine: 42,
      content: 'GET /users returns all users.',
    });
    const anchor = engine.createAnchor(sec);

    assert.strictEqual(anchor.sectionSlug, 'api-endpoints');
    assert.strictEqual(anchor.lineHint, 42);
  });

  // ── findAnchoredSection ──────────────────────────────────────────

  test('findAnchoredSection returns matching section', () => {
    const engine = new AnchorEngine();
    const sec = section();
    const anchor: CommentAnchor = {
      sectionSlug: 'introduction',
      lineHint: 0,
    };

    const result = engine.findAnchoredSection([sec], anchor);
    assert.ok(result);
    assert.strictEqual(result!.heading, 'Introduction');
  });

  test('findAnchoredSection returns null when slug not found', () => {
    const engine = new AnchorEngine();
    const sec = section();
    const anchor: CommentAnchor = {
      sectionSlug: 'nonexistent-section',
      lineHint: 0,
    };

    const result = engine.findAnchoredSection([sec], anchor);
    assert.strictEqual(result, null);
  });

  test('findAnchoredSection picks correct section from multiple', () => {
    const engine = new AnchorEngine();
    const sections = [
      section({ heading: 'Intro', slug: 'intro', content: 'Intro content' }),
      section({ heading: 'API', slug: 'api', content: 'API content', startLine: 10 }),
      section({ heading: 'Auth', slug: 'auth', content: 'Auth content', startLine: 20 }),
    ];
    const anchor: CommentAnchor = {
      sectionSlug: 'api',
      lineHint: 10,
    };

    const result = engine.findAnchoredSection(sections, anchor);
    assert.ok(result);
    assert.strictEqual(result!.heading, 'API');
  });

  // ── Cache behaviour (clearCache) ─────────────────────────────────

  test('clearCache removes stored sections', () => {
    const engine = new AnchorEngine();
    engine.clearCache('file:///test.md');
    // No assertion needed — just verifying no error is thrown
  });

  // ── findSectionByLine ────────────────────────────────────────────

  test('findSectionByLine returns section containing the line', () => {
    const engine = new AnchorEngine();
    const sections = [
      section({ heading: 'A', slug: 'a', startLine: 0, endLine: 5 }),
      section({ heading: 'B', slug: 'b', startLine: 5, endLine: 12 }),
      section({ heading: 'C', slug: 'c', startLine: 12, endLine: 20 }),
    ];

    assert.strictEqual(engine.findSectionByLine(sections, 0)?.heading, 'A');
    assert.strictEqual(engine.findSectionByLine(sections, 3)?.heading, 'A');
    assert.strictEqual(engine.findSectionByLine(sections, 5)?.heading, 'B');
    assert.strictEqual(engine.findSectionByLine(sections, 11)?.heading, 'B');
    assert.strictEqual(engine.findSectionByLine(sections, 12)?.heading, 'C');
    assert.strictEqual(engine.findSectionByLine(sections, 19)?.heading, 'C');
  });

  test('findSectionByLine returns undefined for out-of-range line', () => {
    const engine = new AnchorEngine();
    const sections = [
      section({ heading: 'A', slug: 'a', startLine: 0, endLine: 5 }),
    ];

    assert.strictEqual(engine.findSectionByLine(sections, 5), undefined); // endLine is exclusive
    assert.strictEqual(engine.findSectionByLine(sections, 99), undefined);
  });

  test('findSectionByLine returns undefined for empty sections', () => {
    const engine = new AnchorEngine();
    assert.strictEqual(engine.findSectionByLine([], 0), undefined);
  });

  // ── Orphaned thread identification ───────────────────────────────

  test('findAnchoredSection returns null for orphaned thread (section deleted)', () => {
    const engine = new AnchorEngine();
    const sections = [
      section({ heading: 'Intro', slug: 'intro', content: 'Intro content' }),
      section({ heading: 'Setup', slug: 'setup', content: 'Setup content' }),
    ];

    const orphanedAnchor: CommentAnchor = {
      sectionSlug: 'deleted-authentication-section',
      lineHint: 50,
    };

    const result = engine.findAnchoredSection(sections, orphanedAnchor);
    assert.strictEqual(result, null, 'Orphaned anchor should return null');
  });
});
