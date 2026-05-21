const ELLIPSIS = '...';

/**
 * Truncate `filename` to fit within `maxChars` by inserting `...` near the
 * middle while preserving the file extension. If the filename already fits,
 * returns it unchanged. If the extension alone exceeds the budget, the
 * extension is dropped and the head is truncated.
 *
 * The utility operates on Unicode code points (after NFC normalization), so
 * Hangul syllables stay intact even when the input is decomposed jamo (as
 * macOS produces), and surrogate pairs (emoji, supplementary CJK) are never
 * split. The caller is responsible for picking a `maxChars` that fits the
 * rendered container.
 *
 * Examples:
 *   truncateMiddleKeepExtension('File-name-is-too-long.pdf', 14) -> 'File...ong.pdf'
 *   truncateMiddleKeepExtension('short.pdf', 14)                 -> 'short.pdf'
 *   truncateMiddleKeepExtension('noextension', 14)               -> 'noextension'
 *   truncateMiddleKeepExtension('verylong.tar.gz', 10)           -> 've...tar.gz'
 *   truncateMiddleKeepExtension('long', 3)                       -> '...'
 */
export function truncateMiddleKeepExtension(filename: string, maxChars: number): string {
  if (maxChars <= 0) return '';

  const normalized = filename.normalize('NFC');
  const chars = Array.from(normalized);

  if (chars.length <= maxChars) return normalized;
  if (maxChars <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxChars);

  const dotIdx = chars.lastIndexOf('.');
  const hasExtension = dotIdx > 0 && dotIdx < chars.length - 1;

  if (!hasExtension) {
    return chars.slice(0, maxChars - ELLIPSIS.length).join('') + ELLIPSIS;
  }

  const extChars = chars.slice(dotIdx);
  const baseChars = chars.slice(0, dotIdx);

  const baseBudget = maxChars - ELLIPSIS.length - extChars.length;
  if (baseBudget <= 0) {
    return chars.slice(0, maxChars - ELLIPSIS.length).join('') + ELLIPSIS;
  }

  const headLen = Math.ceil(baseBudget / 2);
  const tailLen = baseBudget - headLen;
  return baseChars.slice(0, headLen).join('')
    + ELLIPSIS
    + (tailLen > 0 ? baseChars.slice(baseChars.length - tailLen).join('') : '')
    + extChars.join('');
}
