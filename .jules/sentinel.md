# Sentinel's Journal

## 2025-05-18 - Inline JSON and Script URL Escaping in srcdoc Documents
**Vulnerability:** In `src/lab/real-ads/session.js`, synchronous ad banner placement constructed an HTML document string for `iframe.srcdoc` using `JSON.stringify(placement.options)` and only double-quote replacement for `placement.scriptUrl`. Because `JSON.stringify` does not escape `<` or `</script>`, any option string containing `</script>` could break out of the inline `<script>` tag and execute arbitrary scripts in the iframe document. Additionally, `placement.scriptUrl` was insufficiently escaped against HTML attribute/tag breakouts.
**Learning:** Serializing arbitrary data objects into `<script>` elements inside HTML strings via `JSON.stringify` requires escaping `<` (e.g., `\\u003c`) so the HTML parser cannot mistake closing tag sequences inside string literals for tag boundaries. HTML attributes like `src` must also be escaped against `<`, `>`, `&`, `"`, and `'`.
**Prevention:** Always serialize JSON intended for HTML `<script>` blocks using Unicode escapes (`.replace(/</g, '\\u003c')`), and strictly encode HTML attribute values.
