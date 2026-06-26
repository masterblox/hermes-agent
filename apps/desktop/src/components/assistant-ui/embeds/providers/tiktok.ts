import { bareHost, type EmbedMatcher } from './types'

export const tiktok: EmbedMatcher = url => {
  if (bareHost(url.hostname) !== 'tiktok.com') {
    return null
  }

  const segments = url.pathname.split('/').filter(Boolean)
  const videoIndex = segments.indexOf('video')
  const id = videoIndex >= 0 ? segments[videoIndex + 1] : ''

  if (!/^\d+$/.test(id || '')) {
    return null
  }

  return {
    embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
    height: 760,
    id: `tiktok:${id}`,
    label: 'TikTok',
    maxWidth: 360,
    provider: 'tiktok',
    renderer: 'frame',
    sourceUrl: url.toString()
  }
}
