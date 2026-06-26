// Shared sizing for inline URL embeds. The height cap is pure CSS (max-height);
// JS only measures cross-origin post height, which CSS can't read. Fenced
// renderers (mermaid, svg) opt out — they own their own height.
export const EMBED_MAX_H = '33dvh'
export const EMBED_MIN_AUTO_H = 80
