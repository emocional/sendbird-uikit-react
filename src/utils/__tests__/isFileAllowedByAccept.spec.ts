import { isFileAllowedByAccept } from '..';

const makeFile = (name: string, type = ''): File => new File([new Uint8Array(1)], name, { type });

describe('isFileAllowedByAccept', () => {
  it('falls back to UIKit default supported MIME/extension list when acceptableMimeTypes is undefined or empty', () => {
    expect(isFileAllowedByAccept(makeFile('a.zip', 'application/zip'), undefined)).toBe(true);
    expect(isFileAllowedByAccept(makeFile('photo.png', 'image/png'), [])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('installer.dmg', 'application/x-apple-diskimage'), undefined)).toBe(false);
  });

  it('matches by MIME exact when consumer passes a raw MIME', () => {
    const acceptable = ['image/png'];
    expect(isFileAllowedByAccept(makeFile('a.png', 'image/png'), acceptable)).toBe(true);
    expect(isFileAllowedByAccept(makeFile('a.jpg', 'image/jpeg'), acceptable)).toBe(false);
  });

  it('matches by extension when MIME is empty (browser could not infer)', () => {
    expect(isFileAllowedByAccept(makeFile('photo.PNG', ''), ['image'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('doc.pdf', ''), ['image'])).toBe(false);
  });

  it('expands category aliases (image/video/audio/archive) to the supported MIME + ext list', () => {
    expect(isFileAllowedByAccept(makeFile('a.jpg', 'image/jpeg'), ['image'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('clip.mp4', 'video/mp4'), ['video'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('song.mp3', 'audio/mpeg'), ['audio'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('bundle.zip', 'application/zip'), ['archive'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('bundle.zip', 'application/zip'), ['image'])).toBe(false);
  });

  it('supports wildcard MIME tokens like image/*', () => {
    expect(isFileAllowedByAccept(makeFile('a.webp', 'image/webp'), ['image/*'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('a.pdf', 'application/pdf'), ['image/*'])).toBe(false);
  });

  it('is case-insensitive on both filename and token', () => {
    expect(isFileAllowedByAccept(makeFile('PHOTO.JPG', 'image/jpeg'), ['.JPG'])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('photo.jpg', 'image/jpeg'), ['.JPG'])).toBe(true);
  });

  it('allows extensionless files with unknown MIME when acceptableMimeTypes is not restricted', () => {
    expect(isFileAllowedByAccept(makeFile('README', ''), undefined)).toBe(true);
    expect(isFileAllowedByAccept(makeFile('Makefile', ''), [])).toBe(true);
    expect(isFileAllowedByAccept(makeFile('.bashrc', ''), undefined)).toBe(true);
  });

  it('still rejects extensionless files when acceptableMimeTypes is explicitly restricted', () => {
    expect(isFileAllowedByAccept(makeFile('README', ''), ['image'])).toBe(false);
    expect(isFileAllowedByAccept(makeFile('Makefile', ''), ['video'])).toBe(false);
  });

  it('still rejects files with explicit unsupported extension even when MIME is unknown', () => {
    expect(isFileAllowedByAccept(makeFile('installer.dmg', ''), undefined)).toBe(false);
  });
});
