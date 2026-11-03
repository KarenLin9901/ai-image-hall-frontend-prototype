function splitRoute(value: string): [string, string] {
  const separator = value.indexOf('?');
  return separator < 0 ? [value, ''] : [value.slice(0, separator), value.slice(separator + 1)];
}

/** Only public catalogue routes belong in a return address. Never carry form data. */
export function normalizeExperienceReturn(value: string | null): string | undefined {
  if (!value) return undefined;
  const [path, query] = splitRoute(value);
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
  const params = new URLSearchParams(splitRoute(route)[1]);
  const context = normalizeExperienceReturn(params.get('returnTo')) || (params.get('source') === 'brand' ? '/category/brand' : undefined);
  const to = context || '/works?product=hall';
  const label = !context ? '查看活动方案' : to.startsWith('/category/') ? '返回方案详情' : to.startsWith('/hall') ? '返回AI影像馆' : to === '/works?product=hall' ? '返回活动方案' : '返回方案列表';
  return { to, label };
}

export function experiencePathFor(mode: 'template' | 'custom', returnTo?: string) {
  const params = new URLSearchParams({ mode });
  const target = normalizeExperienceReturn(returnTo || null);
  if (target) params.set('returnTo', target);
  return '/experience-center?' + params.toString();
}

/** Rebuild an experience return from known fields; never accept an arbitrary path. */
export function normalizeExperienceRoute(value: string | null): string | undefined {
  if (!value) return undefined;
  const [path, query] = splitRoute(value);
  if (path !== '/experience-center') return undefined;
  const params = new URLSearchParams(query);
  const mode = params.get('mode');
  if (mode !== 'template' && mode !== 'custom') return undefined;
  return experiencePathFor(mode, normalizeExperienceReturn(params.get('returnTo')));
}
