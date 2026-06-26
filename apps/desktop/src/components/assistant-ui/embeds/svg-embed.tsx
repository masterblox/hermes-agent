'use client'

import DOMPurify from 'dompurify'
import { useMemo } from 'react'

import type { RichFenceProps } from './types'

// Lazy chunk (pulls in DOMPurify). Renders a ```svg fence as an image after
// hard-sanitising it: the svg profile strips scripts, event handlers, and
// foreignObject, so untrusted model output can't execute.
export default function SvgRenderer({ code }: RichFenceProps) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(code, {
        USE_PROFILES: { svg: true, svgFilters: true }
      }),
    [code]
  )

  if (!clean.trim()) {
    return null
  }

  return (
    <div
      className="overflow-auto p-3 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
