import assert from 'node:assert/strict';
import test from 'node:test';
import { parseExifCaptureDate } from '../src/photos/captureDate.ts';

test('convierte una fecha EXIF con offset explícito a UTC', () => {
  assert.equal(parseExifCaptureDate('2026:10:18 15:30:45', '+09:00'), '2026-10-18T06:30:45.000Z');
});

test('interpreta como hora de Japón una fecha EXIF sin offset', () => {
  assert.equal(parseExifCaptureDate('2026:10:18 15:30:45'), '2026-10-18T06:30:45.000Z');
});

test('admite offsets negativos y rechaza fechas inválidas', () => {
  assert.equal(parseExifCaptureDate('2026-10-18 15:30:45', '-03:00'), '2026-10-18T18:30:45.000Z');
  assert.equal(parseExifCaptureDate('2026:02:30 10:00:00', '+09:00'), undefined);
  assert.equal(parseExifCaptureDate('sin fecha'), undefined);
});
