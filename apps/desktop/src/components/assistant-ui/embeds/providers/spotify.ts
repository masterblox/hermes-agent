import { bareHost, type EmbedMatcher } from './types'

// Spotify's embed is cross-origin and unmeasurable, so heights are fixed. The
// compact (152) player covers single items; collections get a short scrollable
// list (232) rather than the full 352 chrome, which left too much dead space.
const TYPE_HEIGHT: Record<string, number> = {
  album: 232,
  artist: 232,
  episode: 152,
  playlist: 232,
  show: 232,
  track: 152
}

export const spotify: EmbedMatcher = url => {
  if (bareHost(url.hostname) !== 'open.spotify.com') {
    return null
  }

  // Drop an optional locale prefix (`/intl-de/track/...`).
  const segments = url.pathname.split('/').filter(Boolean)
  const start = segments[0]?.startsWith('intl-') ? 1 : 0
  const type = segments[start] || ''
  const id = segments[start + 1] || ''

  if (!(type in TYPE_HEIGHT) || !/^[A-Za-z0-9]+$/.test(id)) {
    return null
  }

  return {
    embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
    height: TYPE_HEIGHT[type],
    id: `spotify:${type}:${id}`,
    label: 'Spotify',
    maxWidth: 480,
    provider: 'spotify',
    renderer: 'frame',
    sourceUrl: url.toString()
  }
}
