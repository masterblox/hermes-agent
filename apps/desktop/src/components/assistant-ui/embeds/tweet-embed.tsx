'use client'

import { useMemo } from 'react'

import { escapeHtml } from './escape-html'
import type { TweetEmbed } from './providers/types'
import { SandboxedFrame } from './sandboxed-frame'
import { useIsDark } from './use-is-dark'

export function tweetEmbedSrc(tweetId: string, sourceUrl: string, theme: 'dark' | 'light'): string {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><blockquote class="twitter-tweet" data-dnt="true" data-theme="${theme}" data-tweet-id="${escapeHtml(tweetId)}"><a href="${escapeHtml(sourceUrl)}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></body></html>`

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
}

export default function TweetEmbedRenderer({ descriptor }: { descriptor: TweetEmbed }) {
  const isDark = useIsDark()

  const src = useMemo(
    () => tweetEmbedSrc(descriptor.tweetId, descriptor.sourceUrl, isDark ? 'dark' : 'light'),
    [descriptor.sourceUrl, descriptor.tweetId, isDark]
  )

  return <SandboxedFrame autoHeight initialHeight={260} label={descriptor.label} src={src} />
}
