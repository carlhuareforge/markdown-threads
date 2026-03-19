/**
 * Core types for the Markdown Review extension
 */

/** Anchor information for locating a comment within a document */
export interface CommentAnchor {
  /** Slug derived from the section heading (e.g., "authentication-flow") */
  sectionSlug: string;
  /** 0-indexed line number in the source .md file */
  lineHint: number;
  /** The text the user highlighted when creating this comment */
  selectedText?: string;
}

/** A single comment entry within a thread */
export interface CommentEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** Author name or identifier */
  author: string;
  /** Comment body text (markdown supported) */
  body: string;
  /** ISO-8601 timestamp when created */
  created: string;
}

/** Status of a comment thread */
export type ThreadStatus = 'open' | 'resolved';

/** A comment thread anchored to a document section */
export interface CommentThread {
  /** Unique identifier (UUID) */
  id: string;
  /** Anchor information for locating this thread */
  anchor: CommentAnchor;
  /** Current status of the thread */
  status: ThreadStatus;
  /** All comments in this thread */
  thread: CommentEntry[];
}

/** The sidecar file schema for storing comments */
export interface SidecarFile {
  /** Name of the markdown document this file is for */
  doc: string;
  /** Schema version */
  version: '2.0';
  /** All comment threads for this document */
  comments: CommentThread[];
}

/** A parsed markdown section */
export interface MarkdownSection {
  /** The heading text */
  heading: string;
  /** Slug derived from heading */
  slug: string;
  /** Heading level (1-6) */
  level: number;
  /** Line number where section starts (0-indexed) */
  startLine: number;
  /** Line number where section ends (0-indexed, exclusive) */
  endLine: number;
  /** Content of the section (excluding heading) */
  content: string;
}

/** Git provider type */
export type GitProvider = 'github' | 'azuredevops' | 'unknown';

/** Result of provider detection */
export interface ProviderInfo {
  provider: GitProvider;
  owner: string;
  repo: string;
  remoteUrl: string;
}

/** PR creation result */
export interface PRResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  error?: string;
}

/** Extension configuration */
export interface ExtensionConfig {
  docPaths: string[];
  autoOpenPR: boolean;
  branchPrefix: string;
  defaultProvider: 'auto' | 'github' | 'azuredevops';
}
