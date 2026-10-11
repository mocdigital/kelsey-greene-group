export type AssetPointer = { url: string; original_filename: string; asset_id: string };
export function portableAsset(asset: AssetPointer) { return `/media/${asset.asset_id}/${asset.original_filename}`; }
export function resolveMedia(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  if (/^cms-media:uploads\/[a-zA-Z0-9._-]+$/.test(url)) return `/api/public/media?path=${encodeURIComponent(url.slice(10))}`;
  if (/^https:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/__l5e/'))) return url;
  return fallback;
}
export function contentMedia(content: Record<string, unknown>, key: string, fallback: string) {
  return resolveMedia(content[key], fallback);
}
export function referencesMedia(value: unknown, reference: string): boolean {
  if (value === reference) return true;
  if (Array.isArray(value)) return value.some(item => referencesMedia(item, reference));
  if (value && typeof value === 'object') return Object.values(value).some(item => referencesMedia(item, reference));
  return false;
}