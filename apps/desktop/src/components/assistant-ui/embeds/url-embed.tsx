'use client'

import { type CSSProperties, lazy, Suspense } from 'react'

import { EMBED_MAX_H } from './embed-size'
import { EmbedFail } from './fail'
import type { EmbedDescriptor } from './providers/types'
import { RichBoundary } from './rich-boundary'

const FrameEmbedRenderer = lazy(() => import('./frame-embed'))
const InstagramEmbedRenderer = lazy(() => import('./instagram-embed'))
const TweetEmbedRenderer = lazy(() => import('./tweet-embed'))
const YouTubeEmbedRenderer = lazy(() => import('./youtube-embed'))

function intrinsicHeight(descriptor: EmbedDescriptor): number {
  if (descriptor.aspectRatio) {
    return Math.round((descriptor.maxWidth ?? 640) / descriptor.aspectRatio)
  }

  return descriptor.height ?? 320
}

function LazyRenderer({ descriptor }: { descriptor: EmbedDescriptor }) {
  if (descriptor.provider === 'youtube' && descriptor.renderer === 'frame') {
    return <YouTubeEmbedRenderer descriptor={descriptor} />
  }

  if (descriptor.provider === 'instagram' && descriptor.renderer === 'frame') {
    return <InstagramEmbedRenderer descriptor={descriptor} />
  }

  if (descriptor.renderer === 'tweet') {
    return <TweetEmbedRenderer descriptor={descriptor} />
  }

  return <FrameEmbedRenderer descriptor={descriptor} />
}

export function UrlEmbed({ descriptor }: { descriptor: EmbedDescriptor }) {
  const aspect = descriptor.aspectRatio

  // Ratio embeds cap their WIDTH off the ratio so height tops out at EMBED_MAX_H
  // while scaling naturally — no letterbox. Fixed/measured embeds cap height.
  const style: CSSProperties = {
    containIntrinsicSize: `auto ${intrinsicHeight(descriptor)}px`,
    contentVisibility: 'auto',
    ...(aspect
      ? { width: `min(${descriptor.maxWidth ?? 640}px, 100%, calc(${EMBED_MAX_H} * ${aspect}))` }
      : { maxHeight: EMBED_MAX_H, width: descriptor.maxWidth ? `min(${descriptor.maxWidth}px, 100%)` : '100%' })
  }

  return (
    <span className="group/embed my-2 block overflow-hidden rounded-lg" data-slot="aui_embed-card" style={style}>
      <RichBoundary fallback={<EmbedFail label={descriptor.label} />} resetKey={descriptor.id}>
        <Suspense fallback={null}>
          <LazyRenderer descriptor={descriptor} />
        </Suspense>
      </RichBoundary>
    </span>
  )
}
