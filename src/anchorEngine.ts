import * as vscode from 'vscode';
import type { MarkdownSection, CommentAnchor } from './models/types';
import { parseMarkdownSections, findSectionBySlug, findSectionByLine } from './utils/markdown';

/**
 * Engine for anchoring comments to markdown sections
 */
export class AnchorEngine {
  private sectionCache: Map<string, MarkdownSection[]> = new Map();

  /**
   * Parse and cache sections for a document
   */
  parseSections(document: vscode.TextDocument): MarkdownSection[] {
    const content = document.getText();
    const sections = parseMarkdownSections(content);
    this.sectionCache.set(document.uri.toString(), sections);
    return sections;
  }

  /**
   * Get cached sections or parse if not cached
   */
  getSections(document: vscode.TextDocument): MarkdownSection[] {
    const cached = this.sectionCache.get(document.uri.toString());
    if (cached) {
      return cached;
    }
    return this.parseSections(document);
  }

  /**
   * Clear cache for a document
   */
  clearCache(documentUri: string): void {
    this.sectionCache.delete(documentUri);
  }

  /**
   * Create an anchor for a section
   */
  createAnchor(section: MarkdownSection): CommentAnchor {
    return {
      sectionSlug: section.slug,
      lineHint: section.startLine,
    };
  }

  /**
   * Find the section matching an anchor by slug
   */
  findAnchoredSection(
    sections: MarkdownSection[],
    anchor: CommentAnchor
  ): MarkdownSection | null {
    return findSectionBySlug(sections, anchor.sectionSlug) ?? null;
  }

  /**
   * Get the VS Code Range for a section heading (single line)
   */
  getSectionRange(document: vscode.TextDocument, section: MarkdownSection): vscode.Range {
    return new vscode.Range(
      new vscode.Position(section.startLine, 0),
      new vscode.Position(section.startLine, document.lineAt(section.startLine).text.length)
    );
  }

  /**
   * Get the VS Code Range covering the full body of a section
   */
  getSectionBodyRange(document: vscode.TextDocument, section: MarkdownSection): vscode.Range {
    const lastLine = Math.min(section.endLine - 1, document.lineCount - 1);
    return new vscode.Range(
      new vscode.Position(section.startLine, 0),
      new vscode.Position(lastLine, document.lineAt(lastLine).text.length)
    );
  }

  /**
   * Find the section that contains a given 0-indexed line.
   */
  findSectionByLine(sections: MarkdownSection[], line: number): MarkdownSection | undefined {
    return findSectionByLine(sections, line);
  }
}

export const anchorEngine = new AnchorEngine();
