import React, { useCallback } from 'react';
import DOMPurify from 'dompurify';

import { insertTemplateToDOM } from './insertTemplate';
import { sanitizeString } from '../../utils';
import { DynamicProps } from './types';
import { domToMessageTemplate, getLeafNodes, getUsersFromWords, hasMention } from './utils';

function pasteContentAtCaret(content: string) {
  const selection = window.getSelection(); // Get the current selection
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(selection.rangeCount - 1); // Get the last range

    range.deleteContents(); // Clear any existing content

    // Create a new text node with the content and a Zero-width space
    const textNode = document.createTextNode(content + '\u200B');
    range.insertNode(textNode); // Insert the new text node at the caret position

    // Move the caret to the end of the inserted content
    range.setStart(textNode, textNode.length);
    range.collapse(true); // Collapse the range (no text selection)

    // Reset the selection with the updated range
    selection.removeAllRanges();
    selection.addRange(range); // Apply the updated selection
  }
}

function createPasteNodeWithContent(html: string): HTMLDivElement {
  const pasteNode = document.createElement('div');
  pasteNode.innerHTML = html;
  return pasteNode;
}

// usePaste Hook
export function usePaste({
  ref,
  setIsInput,
  channel,
  setMentionedUsers,
  onAddFiles,
}: DynamicProps): (e: React.ClipboardEvent<HTMLDivElement>) => void {
  return useCallback((e) => {
    // 0. File paste (e.g. screenshot copy): route to composer and skip text branch.
    if (onAddFiles) {
      const clipboardFiles = extractClipboardFiles(e);
      if (clipboardFiles.length > 0) {
        e.preventDefault();
        onAddFiles(clipboardFiles);
        return;
      }
    }

    e.preventDefault();

    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text') || getURIListText(e);

    // 1. Simple text paste: no HTML present
    if (!html) {
      pasteContentAtCaret(sanitizeString(text));
      setIsInput(true);
      return;
    }

    // 2. HTML paste: process mentions and sanitized content
    const purifier = DOMPurify(window);
    const cleanHtml = purifier.sanitize(html);
    const pasteNode = createPasteNodeWithContent(cleanHtml);

    if (!hasMention(pasteNode)) {
      // No mention, paste as plain text
      pasteContentAtCaret(sanitizeString(text));
      pasteNode.remove();
      setIsInput(true);
      return;
    }

    // 3. Mentions present: process mentions and update state
    const leafNodes = getLeafNodes(pasteNode);
    const words = domToMessageTemplate(leafNodes);
    const mentionedUsers = channel.isGroupChannel() ? getUsersFromWords(words, channel) : [];

    setMentionedUsers(mentionedUsers); // Update mentioned users state
    insertTemplateToDOM(words); // Insert mentions and content into the DOM
    pasteNode.remove();

    setIsInput(true);
  }, [ref, setIsInput, channel, setMentionedUsers, onAddFiles]);
}

/**
 * Pull File entries out of a clipboard event, robust across browsers.
 * Safari can leave clipboardData.files empty while populating items.
 */
function extractClipboardFiles(e: React.ClipboardEvent<HTMLDivElement>): File[] {
  const files: File[] = [];
  const items = e.clipboardData?.items;
  if (items) {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }
  if (files.length === 0 && e.clipboardData?.files) {
    for (let i = 0; i < e.clipboardData.files.length; i += 1) {
      files.push(e.clipboardData.files[i]);
    }
  }
  return files;
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#dragging_links
function getURIListText(e: React.ClipboardEvent<HTMLDivElement>) {
  const pasteData = e.clipboardData.getData('text/uri-list');
  if (pasteData.length === 0) return '';

  return pasteData
    .split('\n')
    .reduce((accumulator, line) => {
      const txt = line.trim();
      if (txt !== '' && !txt.startsWith('#')) {
        accumulator += txt + '\n';
      }
      return accumulator;
    }, '');
}

// to do -> In the future don't export default
export default usePaste;
