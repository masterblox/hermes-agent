'use client'

import { mapWrapperSrc } from './map-wrapper'
import type { FrameEmbed } from './providers/types'
import { SandboxedFrame } from './sandboxed-frame'

export default function FrameEmbedRenderer({ descriptor }: { descriptor: FrameEmbed }) {
  const isMap = descriptor.provider === 'googlemaps' || descriptor.provider === 'openstreetmap'

  return (
    <SandboxedFrame
      aspectRatio={descriptor.aspectRatio}
      fixedHeight={descriptor.height}
      gateScroll={isMap}
      label={descriptor.label}
      src={isMap ? mapWrapperSrc(descriptor.embedUrl) : descriptor.embedUrl}
    />
  )
}
