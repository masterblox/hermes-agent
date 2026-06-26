'use client'

import { mapWrapperSrc } from './map-wrapper'
import type { FrameEmbed } from './providers/types'
import { SandboxedFrame } from './sandboxed-frame'

export default function FrameEmbedRenderer({ descriptor }: { descriptor: FrameEmbed }) {
  const isMap = descriptor.provider === 'googlemaps' || descriptor.provider === 'openstreetmap'
  const isSpotify = descriptor.provider === 'spotify'

  // Three sizing modes: aspect ratio (video/map), canonical fixed height
  // (Spotify — unmeasurable), or measure-the-guest (Pinterest/TikTok posts).
  return (
    <SandboxedFrame
      aspectRatio={descriptor.aspectRatio}
      autoHeight={!descriptor.aspectRatio && !isSpotify}
      fixedHeight={isSpotify ? descriptor.height : undefined}
      gateScroll={isMap}
      initialHeight={descriptor.height}
      label={descriptor.label}
      src={isMap ? mapWrapperSrc(descriptor.embedUrl) : descriptor.embedUrl}
    />
  )
}
