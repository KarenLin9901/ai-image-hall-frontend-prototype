// Local presentation guards. These do not define a backend API or grant content rights.
export function safeRoute(raw: string): string {
  try {
    return decodeURI(raw || '/').replace(/^\/scenes\/(hall|bespoke)$/, '/$1');
  } catch {
    return '/invalid-link';
  }
}

export function isPublishedAndAuthorized(record: { status: 'draft' | 'published'; displayAuthorized?: boolean }): boolean {
  return record.status === 'published' && record.displayAuthorized === true;
}
