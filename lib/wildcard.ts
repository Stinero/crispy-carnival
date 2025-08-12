

/**
 * Converts a wildcard pattern (like *.example.com) to a RegExp.
 * @param pattern The wildcard pattern.
 * @returns A RegExp object.
 */
export function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexString = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${regexString}$`, 'i');
}