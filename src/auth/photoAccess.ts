const ALLOWED_UIDS = new Set([
  '8ew8WV6wdVWGDeyYet2LC4VIK3n2',
  'HnuScK26yENhDdMC37HEfzYLzsE3',
]);

// Las reglas de Firebase siguen siendo la autorización definitiva. Este filtro
// evita mostrar datos de la caché local a una cuenta que no está habilitada.
export function canAccessPhotos(uid: string | undefined) {
  return uid !== undefined && ALLOWED_UIDS.has(uid);
}
