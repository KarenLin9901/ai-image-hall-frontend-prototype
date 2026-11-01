/** Only public catalogue routes belong in a return address. Never carry form data. */
export function normalizeExperienceReturn(value: string | null): string | undefined {
  if (!value) return undefined;
  const [path, query = ''] = value.split('?');
  const params = new URLSearchParams(query);
  if (path === '/hall') {
    const section = params.get('section');
    return '/hall' + (['introduction', 'applications', 'experience', 'benefits'].includes(section || '') ? '?section=' + section + '&restore=1' : '');
  }
  if (path === '/works') return '/works' + (params.get('product') === 'hall' ? '?product=hall' : '');
  if (/^\/category\/(brand|event|team|campus)$/.test(path)) {
    const filter = params.get('filter');
    return path + (params.get('from') === 'solutions' ? '?from=solutions' + (filter === 'hall' ? '&filter=hall' : '') : '');
  }
  return undefined;
}

export function experienceReturnFor(route: string) {
  const params = new URLSearchParams(route.split('?')[1] || '');
  const to = normalizeExperienceReturn(params.get('returnTo')) || (params.get('source') === 'brand' ? '/category/brand' : '/hall');
  return { to, label: to.startsWith('/hall') ? '返回AI影像馆' : '返回应用方案' };
}

export function experiencePathFor(mode: 'template' | 'custom', returnTo?: string) {
  const params = new URLSearchParams({ mode });
  const target = normalizeExperienceReturn(returnTo || null);
  if (target) params.set('returnTo', target);
  return '/experience-center?' + params.toString();
}
