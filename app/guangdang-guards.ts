// Local presentation guards. These do not define a backend API or grant content rights.
export function safeRoute(raw: string): string {
  try {
    const route = raw || '/';
    const separator = route.indexOf('?');
    const path = separator < 0 ? route : route.slice(0, separator);
    const query = separator < 0 ? '' : route.slice(separator);
    // Validate malformed escapes without decoding nested return addresses twice.
    decodeURI(query);
    return decodeURI(path).replace(/^\/scenes\/(hall|bespoke)$/, '/$1') + query;
  } catch {
    return '/invalid-link';
  }
}

export function isPublishedAndAuthorized(record: { status: 'draft' | 'published'; displayAuthorized?: boolean }): boolean {
  return record.status === 'published' && record.displayAuthorized === true;
}
