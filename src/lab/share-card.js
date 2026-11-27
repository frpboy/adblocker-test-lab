import QRCode from 'qrcode';
import { SITE_URL, SITE_LABEL } from './run-summary.js';

// 1200 x 630 is the landscape size most chat and social apps preview without cropping.
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const C = {
  page: '#f4f0e7',
  card: '#fffdf8',
  line: '#c9c1b2',
  rule: '#e2dbcd',
  ink: '#182024',
  mark: '#24373f',
  muted: '#536266',
  orange: '#c65322',
  orangeText: '#a9431c'
};
const FONT = '"DM Sans", system-ui, sans-serif';

// Same geometry as src/components/LogoMark.jsx (64 x 64 viewBox).
const LOGO = {
  shield: 'M32 6.5c-6.2 4.6-13 7.4-21.5 8.2C10.5 33 13.5 47.5 32 57c18.5-9.5 21.5-24 21.5-42.3C45 13.9 38.2 11.1 32 6.5Z',
  flask: 'M27.2 18.5h9.6M28.6 18.5v8.6L21 40.3a2.6 2.6 0 0 0 2.3 3.9h17.4a2.6 2.6 0 0 0 2.3-3.9l-7.6-13.2v-8.6',
  cross: 'm30.2 33.6 3.6 3.6m0-3.6-3.6 3.6'
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawLogo(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.mark;
  ctx.lineWidth = 4.2;
  ctx.stroke(new Path2D(LOGO.shield));
  ctx.lineWidth = 3;
  ctx.stroke(new Path2D(LOGO.flask));
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 1.9;
  roundRect(ctx, 26.5, 31.4, 11, 8, 1.2);
  ctx.stroke();
  ctx.stroke(new Path2D(LOGO.cross));
  ctx.restore();
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawQr(ctx, text, x, y, size) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const count = qr.modules.size;
  const quiet = 3;
  const cell = Math.floor(size / (count + quiet * 2));
  const drawn = cell * (count + quiet * 2);
  const ox = x + Math.floor((size - drawn) / 2);
  const oy = y + Math.floor((size - drawn) / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(ox, oy, drawn, drawn);
  ctx.fillStyle = C.ink;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.modules.get(r, c)) ctx.fillRect(ox + (c + quiet) * cell, oy + (r + quiet) * cell, cell, cell);
    }
  }
}

/** Draws the result card. Returns the canvas; it contains no personal data, only the score and counts. */
export async function renderShareCard(summary, { url = SITE_URL, label = SITE_LABEL, scale = 1 } = {}) {
  if (document.fonts?.load) {
    await Promise.all([document.fonts.load(`700 150px ${FONT}`), document.fonts.load(`400 24px ${FONT}`)]).catch(() => {});
  }
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * scale;
  canvas.height = CARD_HEIGHT * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = C.page;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  roundRect(ctx, 24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48, 18);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Brand
  drawLogo(ctx, 64, 60, 64);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.ink;
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText('AdBlocker Test Lab', 142, 96);
  ctx.fillStyle = C.muted;
  ctx.font = `400 21px ${FONT}`;
  ctx.fillText('What these test probes show about your browser', 142, 124);

  // Score
  const hasScore = summary.score !== null && summary.score !== undefined;
  ctx.fillStyle = C.muted;
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText('Test-probe score', 72, 200);
  ctx.fillStyle = C.ink;
  if (hasScore) {
    ctx.font = `700 150px ${FONT}`;
    const scoreText = String(summary.score);
    ctx.fillText(scoreText, 66, 340);
    const w = ctx.measureText(scoreText).width;
    ctx.fillStyle = C.muted;
    ctx.font = `500 46px ${FONT}`;
    ctx.fillText('/100', 66 + w + 10, 340);

    // Score bar: the number at a glance, even in a small chat preview.
    roundRect(ctx, 72, 362, 600, 12, 6);
    ctx.fillStyle = C.rule;
    ctx.fill();
    const filled = Math.max(0, Math.min(100, summary.score)) * 6;
    if (filled > 0) {
      roundRect(ctx, 72, 362, Math.max(filled, 12), 12, 6);
      ctx.fillStyle = C.mark;
      ctx.fill();
    }
  } else {
    ctx.font = `700 64px ${FONT}`;
    ctx.fillText('Not run yet', 70, 300);
  }

  // Verdict and coverage (coverage is always stated next to the number)
  ctx.fillStyle = C.ink;
  ctx.font = `700 32px ${FONT}`;
  let y = 422;
  for (const line of wrap(ctx, summary.verdict.title, 640).slice(0, 2)) {
    ctx.fillText(line, 72, y);
    y += 40;
  }
  ctx.fillStyle = C.muted;
  ctx.font = `400 23px ${FONT}`;
  if (hasScore) {
    ctx.fillText(`Based on ${summary.eligible} of ${summary.maxScored} scored tests`, 72, y + 4);
  }

  // Counts, each with a shape so meaning does not rely on colour
  const counts = [
    ['✓', summary.blocked.length, 'blocked'],
    ['◐', summary.partly.length, 'partial'],
    ['✕', summary.allowed.length, 'not blocked'],
    ['?', summary.scoredUnmeasured.length, 'unmeasured']
  ];
  let x = 72;
  const cy = 528;
  for (const [mark, n, word] of counts) {
    ctx.fillStyle = C.ink;
    ctx.font = `700 24px ${FONT}`;
    const head = `${mark} ${n}`;
    ctx.fillText(head, x, cy);
    const hw = ctx.measureText(head).width;
    ctx.fillStyle = C.muted;
    ctx.font = `400 22px ${FONT}`;
    ctx.fillText(word, x + hw + 8, cy);
    x += hw + 8 + ctx.measureText(word).width + 30;
  }

  // Footer
  const date = summary.finishedAt ? new Date(summary.finishedAt) : new Date();
  const when = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  ctx.fillStyle = C.muted;
  ctx.font = `400 18px ${FONT}`;
  ctx.fillText(`Tested ${when}. One browser, one moment; results can differ elsewhere.`, 72, 576);

  // Divider and QR
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(800, 72);
  ctx.lineTo(800, 558);
  ctx.stroke();

  const qrSize = 280;
  const qrX = 840;
  const qrY = 96;
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.stroke();
  drawQr(ctx, url, qrX, qrY, qrSize);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText('Test your own browser', qrX + qrSize / 2, 438);
  ctx.fillStyle = C.muted;
  ctx.font = `400 20px ${FONT}`;
  ctx.fillText('Scan the code or visit', qrX + qrSize / 2, 470);
  ctx.fillStyle = C.orangeText;
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(label, qrX + qrSize / 2, 510);
  ctx.textAlign = 'left';

  return canvas;
}

export function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png');
  });
}
