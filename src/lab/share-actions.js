// The system share sheet only opens from a user's click (browsers require "transient
// activation"), and Safari drops that permission across awaits. So the card image is
// prepared ahead of time and the share call happens synchronously inside the click.

export const SHARE_TITLE = 'AdBlocker Test Lab result';
export const CARD_FILE_NAME = 'adblocker-test-lab-result.png';

/**
 * Builds the payload for navigator.share: the card image when the browser can share
 * files, otherwise the text and link. Returns null when there is no share sheet.
 */
export function buildSharePayload({ file, text, url, nav = globalThis.navigator }) {
  if (!nav?.share) return null;
  if (file && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    return { files: [file], title: SHARE_TITLE, text };
  }
  return { title: SHARE_TITLE, text, url };
}

/**
 * Opens the system share sheet. Must be called directly from a click handler.
 * Resolves to 'shared', 'dismissed' (the user closed the sheet), 'unavailable', or 'failed'.
 */
export function openShareSheet(payload, nav = globalThis.navigator) {
  if (!payload || !nav?.share) return Promise.resolve('unavailable');
  let pending;
  try {
    pending = nav.share(payload);
  } catch {
    return Promise.resolve('failed');
  }
  return Promise.resolve(pending).then(
    () => 'shared',
    (err) => (err?.name === 'AbortError' ? 'dismissed' : 'failed')
  );
}
