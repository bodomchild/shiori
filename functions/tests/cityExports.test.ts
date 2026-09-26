import assert from 'node:assert/strict';
import test from 'node:test';
import { cityExportFileName, splitIntoParts } from '../src/cityExports.ts';

function photo(cityId: string, index: number, estimatedSize: number) {
  return {
    cityId,
    originalPath: `trips/japan-2026/photos/${cityId}/${index}/original`,
    originalName: `${index}.jpg`,
    estimatedSize,
  };
}

test('usa un nombre simple cuando una ciudad entra en un ZIP', () => {
  assert.equal(cityExportFileName('osaka', 1, 1), 'fotos-osaka.zip');
});

test('numera las partes cuando una ciudad necesita varios ZIP', () => {
  assert.equal(cityExportFileName('tokyo', 1, 3), 'fotos-tokyo-1.zip');
  assert.equal(cityExportFileName('tokyo', 3, 3), 'fotos-tokyo-3.zip');
});

test('divide una ciudad al superar 4 GB', () => {
  const parts = splitIntoParts('tokyo', [
    photo('tokyo', 1, 3 * 1024 ** 3),
    photo('tokyo', 2, 2 * 1024 ** 3),
  ]);
  assert.equal(parts.length, 2);
  assert.deepEqual(parts.map((part) => [part.cityPartIndex, part.cityPartCount]), [[1, 2], [2, 2]]);
});

test('divide una ciudad al superar 500 fotos', () => {
  const parts = splitIntoParts('kyoto', Array.from({ length: 501 }, (_, index) => photo('kyoto', index, 1)));
  assert.equal(parts.length, 2);
  assert.equal(parts[0].photos.length, 500);
  assert.equal(parts[1].photos.length, 1);
});
