/** Channel ids are always `UC` followed by 22 url-safe base64 characters. */
const CHANNEL_ID_PATTERN = /^UC[\w-]{22}$/;

/** Handles are 3-30 characters of letters, digits, underscores, dots and dashes after the `@`. */
const HANDLE_PATTERN = /^@[\w.-]{3,30}$/;

/** Legacy custom urls and usernames. Deliberately strict: the value is interpolated into a url. */
const NAME_PATTERN = /^[\w.-]{1,100}$/;

const LEGACY_PREFIX_PATTERN = /^(c|user)\/(.+)$/;

const BASE_URL = 'https://www.youtube.com';

export const isChannelId = (value: unknown): value is string =>
  typeof value === 'string' && CHANNEL_ID_PATTERN.test(value);

/**
 * Turns any of the identifier shapes YouTube puts in a channel url — `UC…` id, `@handle`,
 * `c/CustomName`, `user/LegacyName`, or a bare name — into the urls worth resolving, most likely
 * first. A bare name can be either a custom url or a legacy username and only YouTube knows which,
 * so both are offered. Anything that cannot be a channel reference yields an empty list.
 */
export const channelResolveUrls = (identifier: string): Array<string> => {
  const trimmed = identifier?.trim().replace(/^\/+|\/+$/g, '') ?? '';

  if (!trimmed || isChannelId(trimmed)) return [];

  if (HANDLE_PATTERN.test(trimmed)) return [`${BASE_URL}/${trimmed}`];

  const legacy = LEGACY_PREFIX_PATTERN.exec(trimmed);
  if (legacy) {
    const [, prefix, name] = legacy;
    return NAME_PATTERN.test(name) ? [`${BASE_URL}/${prefix}/${name}`] : [];
  }

  if (NAME_PATTERN.test(trimmed)) return [`${BASE_URL}/${trimmed}`, `${BASE_URL}/user/${trimmed}`];

  return [];
};
