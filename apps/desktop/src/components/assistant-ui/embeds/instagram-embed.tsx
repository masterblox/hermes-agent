'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { EMBED_MAX_H } from './embed-size'
import { escapeHtml } from './escape-html'
import { EmbedFail } from './fail'
import type { FrameEmbed } from './providers/types'

const MIN_HEIGHT = 320

function instagramSrcDoc(permalink: string): string {
  const safePermalink = escapeHtml(permalink)

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><blockquote class="instagram-media" data-instgrm-permalink="${safePermalink}" data-instgrm-version="14" style="margin:0 auto!important;max-width:540px!important;min-width:0!important;width:100%!important"></blockquote><script async src="https://www.instagram.com/embed.js"></script><script>function report(){var h=document.documentElement.scrollHeight||document.body.scrollHeight;if(h){parent.postMessage({type:"hermes-instagram-height",height:h},"*")}}function process(){try{window.instgrm&&window.instgrm.Embeds&&window.instgrm.Embeds.process()}catch(e){} report()}window.addEventListener("load",process);if(window.ResizeObserver){new ResizeObserver(report).observe(document.documentElement)}[400,900,1600,2800].forEach(function(d){setTimeout(process,d)})</script></body></html>`
}

export default function InstagramEmbedRenderer({ descriptor }: { descriptor: FrameEmbed }) {
  const ref = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState(descriptor.height ?? 560)
  const [failed, setFailed] = useState(false)
  const srcDoc = useMemo(() => instagramSrcDoc(descriptor.sourceUrl), [descriptor.sourceUrl])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === ref.current?.contentWindow &&
        typeof event.data === 'object' &&
        event.data?.type === 'hermes-instagram-height' &&
        typeof event.data.height === 'number'
      ) {
        setHeight(Math.max(event.data.height, MIN_HEIGHT))
      }
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (failed) {
    return <EmbedFail label={descriptor.label} />
  }

  const style: CSSProperties = { height, maxHeight: EMBED_MAX_H }

  return (
    <iframe
      className="block w-full border-0 bg-transparent"
      loading="lazy"
      onError={() => setFailed(true)}
      ref={ref}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
      srcDoc={srcDoc}
      style={style}
      title="Instagram embed"
    />
  )
}
