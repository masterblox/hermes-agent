/** Maps require an iframe; webview guests are top-level, so nest one in a wrapper doc. */
export function mapWrapperSrc(embedUrl: string): string {
  const safe = embedUrl.replace(/"/g, '&quot;')
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden;background:transparent}iframe{display:block;border:0;width:100%;height:100%}</style></head><body><iframe src="${safe}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></body></html>`

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
}
