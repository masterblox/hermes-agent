'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { EMBED_MAX_H, EMBED_MIN_AUTO_H } from './embed-size'
import { EmbedFail } from './fail'
import { ScrollGate } from './scroll-gate'

interface Webview extends HTMLElement {
  executeJavaScript?: (code: string) => Promise<unknown>
  insertCSS?: (css: string) => Promise<string>
}

const MEASURE_DELAYS_MS = [0, 300, 800, 1500, 2800]

const HIDE_SCROLLBARS =
  '::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}html,body{scrollbar-width:none!important}'

interface SandboxedFrameProps {
  aspectRatio?: number
  autoHeight?: boolean
  /** Canonical height for providers whose embed can't be measured (Spotify). */
  fixedHeight?: number
  gateScroll?: boolean
  initialHeight?: number
  label: string
  src: string
}

export function SandboxedFrame({
  aspectRatio,
  autoHeight,
  fixedHeight,
  gateScroll,
  initialHeight = 320,
  label,
  src
}: SandboxedFrameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [autoH, setAutoH] = useState(initialHeight)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    let cancelled = false
    const timers: number[] = []

    setFailed(false)
    host.replaceChildren()

    const webview = document.createElement('webview') as Webview
    webview.className = 'h-full w-full bg-transparent'
    webview.setAttribute('partition', 'persist:hermes-embed')
    webview.setAttribute('webpreferences', 'contextIsolation=yes,nodeIntegration=no,sandbox=yes')
    webview.setAttribute('src', src)

    const measure = () => {
      if (!autoHeight || cancelled || !webview.executeJavaScript) {
        return
      }

      webview
        .executeJavaScript('document.documentElement.scrollHeight')
        .then(value => {
          // Grow to content; CSS max-height (EMBED_MAX_H) caps the top.
          if (!cancelled && typeof value === 'number' && value > 0) {
            setAutoH(Math.max(value, EMBED_MIN_AUTO_H))
          }
        })
        .catch(() => {})
    }

    const onStop = () => {
      webview.insertCSS?.(HIDE_SCROLLBARS).catch(() => {})

      for (const delay of MEASURE_DELAYS_MS) {
        timers.push(window.setTimeout(measure, delay))
      }
    }

    const onFail = (event: Event) => {
      if ((event as Event & { errorCode?: number }).errorCode === -3) {
        return
      }

      setFailed(true)
    }

    webview.addEventListener('did-stop-loading', onStop)
    webview.addEventListener('did-fail-load', onFail)
    host.appendChild(webview)

    return () => {
      cancelled = true

      for (const timer of timers) {
        clearTimeout(timer)
      }

      webview.removeEventListener('did-stop-loading', onStop)
      webview.removeEventListener('did-fail-load', onFail)
      webview.remove()
    }
  }, [autoHeight, src])

  if (failed) {
    return <EmbedFail label={label} />
  }

  // Ratio frames are width-capped by UrlEmbed (height follows the ratio);
  // fixed/measured frames cap height directly.
  const style: CSSProperties = aspectRatio
    ? { aspectRatio }
    : { height: autoHeight ? autoH : fixedHeight, maxHeight: EMBED_MAX_H }

  return (
    <div className="relative w-full overflow-hidden" style={style}>
      <div className="size-full" ref={hostRef} />
      {gateScroll && <ScrollGate />}
    </div>
  )
}
