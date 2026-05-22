import { truncateMiddleKeepExtension } from '../truncateMiddleKeepExtension';

describe('truncateMiddleKeepExtension', () => {
  it('returns the filename unchanged when it already fits', () => {
    expect(truncateMiddleKeepExtension('short.pdf', 20)).toBe('short.pdf');
    expect(truncateMiddleKeepExtension('exactlyfit.pdf', 14)).toBe('exactlyfit.pdf');
  });

  it('truncates the middle of the base while preserving the extension', () => {
    // Algorithm splits the remaining base-name budget into head + tail with
    // head receiving the extra char on odd budgets. For maxChars=14 and
    // input length 25, ext='.pdf'(4) -> baseBudget=7 -> head=4, tail=3.
    const result = truncateMiddleKeepExtension('File-name-is-too-long.pdf', 14);
    expect(result).toBe('File...ong.pdf');
    expect(result.length).toBe(14);
    expect(result.startsWith('File')).toBe(true);
    expect(result.endsWith('.pdf')).toBe(true);
  });

  it('preserves multi-dot extensions like .tar.gz by treating only the final segment as extension', () => {
    // Only the final `.gz` is treated as extension; everything before is the base.
    const result = truncateMiddleKeepExtension('archive.tar.gz', 10);
    expect(result.endsWith('.gz')).toBe(true);
    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('handles filenames with no extension by tail-truncating with an ellipsis', () => {
    expect(truncateMiddleKeepExtension('noextension', 8)).toBe('noext...');
  });

  it('treats a leading dot (.env) as no extension and tail-truncates', () => {
    // Leading-dot file: no base to split around, so the utility falls back to
    // tail truncation using the full maxChars budget.
    const result = truncateMiddleKeepExtension('.envconfigfile', 8);
    expect(result).toBe('.envc...');
    expect(result.length).toBe(8);
  });

  it('drops the extension and tail-truncates when the extension alone exceeds the budget', () => {
    const result = truncateMiddleKeepExtension('a.verylongextension', 8);
    expect(result).toBe('a.ver...');
    expect(result.length).toBe(8);
  });

  it('returns the ellipsis (or a prefix of it) when maxChars is too small to fit anything else', () => {
    expect(truncateMiddleKeepExtension('anything.pdf', 3)).toBe('...');
    expect(truncateMiddleKeepExtension('anything.pdf', 2)).toBe('..');
    expect(truncateMiddleKeepExtension('anything.pdf', 1)).toBe('.');
  });

  it('returns an empty string for non-positive maxChars', () => {
    expect(truncateMiddleKeepExtension('anything.pdf', 0)).toBe('');
    expect(truncateMiddleKeepExtension('anything.pdf', -5)).toBe('');
  });

  it('produces output that fits within maxChars across a range of inputs', () => {
    const inputs = [
      'short.pdf',
      'medium-length-name.pdf',
      'a-significantly-longer-file-name-that-definitely-needs-truncation.docx',
      'no-dot-here',
      '.config',
      'archive.tar.gz',
    ];
    for (const input of inputs) {
      for (const max of [5, 10, 15, 20, 30]) {
        const out = truncateMiddleKeepExtension(input, max);
        expect(out.length).toBeLessThanOrEqual(max);
      }
    }
  });

  it('normalizes decomposed Hangul (NFD) to composed syllables (NFC)', () => {
    // macOS surfaces Korean filenames in NFD: '한' is stored as ᄒ + ᅡ + ᆫ
    // (3 code points). The output must use the composed form so slicing never
    // lands inside a syllable.
    const nfdHangul = '한글.pdf'; // 한글.pdf in NFD
    const out = truncateMiddleKeepExtension(nfdHangul, 20);
    expect(out).toBe('한글.pdf');
    expect(out.normalize('NFC')).toBe(out);
  });

  it('truncates Korean filenames at syllable boundaries (never orphan jamo)', () => {
    const input = '한글파일이름이매우길어요.pdf';
    const out = truncateMiddleKeepExtension(input, 10);
    expect(out).toContain('...');
    expect(out.endsWith('.pdf')).toBe(true);
    // Output must not contain bare jamo (U+1100-U+11FF Hangul Jamo or
    // U+3130-U+318F Compatibility Jamo). All Hangul should be composed
    // syllables (U+AC00-U+D7AF).
    expect(/[ᄀ-ᇿ㄰-㆏]/.test(out)).toBe(false);
  });

  it('keeps surrogate pairs (emoji) intact when truncating', () => {
    // '👨‍👩‍👧' style emojis are surrogate pairs in UTF-16. Code-unit slicing
    // could split them; code-point iteration must not.
    const input = 'photo📸from📷camera🎥holiday.jpg';
    const out = truncateMiddleKeepExtension(input, 15);
    expect(out.length).toBeLessThanOrEqual(15);
    // No lone high/low surrogates in the output.
    for (let i = 0; i < out.length; i += 1) {
      const code = out.charCodeAt(i);
      const isHigh = code >= 0xD800 && code <= 0xDBFF;
      const isLow = code >= 0xDC00 && code <= 0xDFFF;
      if (isHigh) {
        const next = out.charCodeAt(i + 1);
        expect(next >= 0xDC00 && next <= 0xDFFF).toBe(true);
        i += 1;
      } else {
        expect(isLow).toBe(false);
      }
    }
  });
});
