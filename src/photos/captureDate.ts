const JAPAN_UTC_OFFSET_MINUTES = 9 * 60;

function tagDescription(tag: { description: string | string[] } | undefined) {
  return typeof tag?.description === 'string' ? tag.description : undefined;
}

function validDateParts(year: number, month: number, day: number, hour: number, minute: number, second: number) {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && date.getUTCHours() === hour
    && date.getUTCMinutes() === minute
    && date.getUTCSeconds() === second;
}

export function parseExifCaptureDate(dateTime: string, offset?: string) {
  const match = /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(dateTime.trim());
  if (!match) return undefined;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  if (!validDateParts(year, month, day, hour, minute, second)) return undefined;

  let offsetMinutes = JAPAN_UTC_OFFSET_MINUTES;
  if (offset) {
    const offsetMatch = /^([+-])(\d{2}):?(\d{2})$/.exec(offset.trim());
    if (!offsetMatch) return undefined;
    const [, sign, offsetHoursText, offsetMinutesText] = offsetMatch;
    const offsetHours = Number(offsetHoursText);
    const offsetMinutePart = Number(offsetMinutesText);
    if (offsetHours > 14 || offsetMinutePart > 59 || (offsetHours === 14 && offsetMinutePart !== 0)) return undefined;
    offsetMinutes = (offsetHours * 60 + offsetMinutePart) * (sign === '-' ? -1 : 1);
  }

  const utcTime = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000;
  return new Date(utcTime).toISOString();
}

export async function getPhotoCapturedAt(file: File, createdAt: string) {
  try {
    const { load } = await import('exifreader');
    const tags = await load(file, {
      length: 'auto',
      expanded: true,
      includeOffsets: true,
      includeTags: { exif: ['DateTimeOriginal', 'OffsetTimeOriginal'] },
    });
    const capturedAt = parseExifCaptureDate(
      tagDescription(tags.exif?.DateTimeOriginal) ?? '',
      tagDescription(tags.exif?.OffsetTimeOriginal),
    );
    if (capturedAt) return capturedAt;
  } catch {
    // Algunas imágenes no tienen EXIF o usan una variante que el navegador no puede leer.
  }

  if (Number.isFinite(file.lastModified) && file.lastModified > 0) {
    return new Date(file.lastModified).toISOString();
  }
  return createdAt;
}
