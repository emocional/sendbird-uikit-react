const ELLIPSIS = '...';

/**
 * Truncate `filename` to fit within `maxChars` by inserting `...` near the
 * middle while preserving the file extension. If the filename already fits,
 * returns it unchanged. If the extension alone exceeds the budget, the
 * extension is dropped and the head is truncated.
 *
 * The utility operates on character count, not pixel width — the caller is
 * responsible for picking a `maxChars` that fits the rendered container.
 *
 * Examples:
 *   truncateMiddleKeepExtension('File-name-is-too-long.pdf', 14) -> 'File-n...g.pdf'
 *   truncateMiddleKeepExtension('short.pdf', 14)                 -> 'short.pdf'
 *   truncateMiddleKeepExtension('noextension', 14)               -> 'noextension'
 *   truncateMiddleKeepExtension('verylong.tar.gz', 10)           -> 've...tar.gz'
 *   truncateMiddleKeepExtension('long', 3)                       -> '...'
 */
export function truncateMiddleKeepExtension(filename: string, maxChars: number): string {
  if (maxChars <= 0) return '';
  if (filename.length <= maxChars) return filename;
  if (maxChars <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxChars);

  const dotIdx = filename.lastIndexOf('.');
  // Treat a leading dot (".env") as no extension — there is no base name to split.
  const hasExtension = dotIdx > 0 && dotIdx < filename.length - 1;
  if (!hasExtension) {
    return filename.slice(0, maxChars - ELLIPSIS.length) + ELLIPSIS;
  }

  const ext = filename.slice(dotIdx); // includes the leading dot
  const base = filename.slice(0, dotIdx);

  // Layout: head + '...' + tail + ext = maxChars
  // So head + tail = maxChars - ELLIPSIS - ext.length
  const baseBudget = maxChars - ELLIPSIS.length - ext.length;
  if (baseBudget <= 0) {
    // Extension does not fit alongside any base + ellipsis. Drop the
    // extension and tail-truncate the full filename instead so the caller
    // still sees a recognizable head.
    return filename.slice(0, maxChars - ELLIPSIS.length) + ELLIPSIS;
  }

  const headLen = Math.ceil(baseBudget / 2);
  const tailLen = baseBudget - headLen;
  return base.slice(0, headLen) + ELLIPSIS + (tailLen > 0 ? base.slice(base.length - tailLen) : '') + ext;
}
