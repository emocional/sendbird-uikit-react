import { filterFilesForUpload } from '../messageInputUtils';

const makeFile = (name: string, type = ''): File => new File([new Uint8Array(1)], name, { type });

describe('filterFilesForUpload', () => {
  it('passes through accepted files when multi is allowed', () => {
    const a = makeFile('a.png', 'image/png');
    const b = makeFile('b.jpg', 'image/jpeg');
    const out = filterFilesForUpload([a, b], { acceptableMimeTypes: ['image'], allowMultipleFiles: true });
    expect(out).toEqual([a, b]);
  });

  it('caps to one file when multi is disallowed', () => {
    const a = makeFile('a.png', 'image/png');
    const b = makeFile('b.jpg', 'image/jpeg');
    const out = filterFilesForUpload([a, b], { acceptableMimeTypes: ['image'], allowMultipleFiles: false });
    expect(out).toEqual([a]);
  });

  it('rejects MIME mismatches before applying the multi cap', () => {
    const zip = makeFile('a.zip', 'application/zip');
    const png = makeFile('b.png', 'image/png');
    const out = filterFilesForUpload([zip, png], { acceptableMimeTypes: ['image'], allowMultipleFiles: false });
    expect(out).toEqual([png]);
  });

  it('applies UIKit default MIME list when acceptableMimeTypes is undefined', () => {
    const dmg = makeFile('installer.dmg', 'application/x-apple-diskimage');
    const png = makeFile('photo.png', 'image/png');
    const out = filterFilesForUpload([dmg, png], { allowMultipleFiles: true });
    expect(out).toEqual([png]);
  });

  it('returns an empty array when nothing matches', () => {
    const dmg = makeFile('installer.dmg', 'application/x-apple-diskimage');
    const out = filterFilesForUpload([dmg], { acceptableMimeTypes: ['image'], allowMultipleFiles: true });
    expect(out).toEqual([]);
  });
});
