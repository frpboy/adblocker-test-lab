import React from 'react';
import { OPERATOR, SOURCE_URL } from '../lab/legal-content.js';

// One quiet row of real destinations (no template columns).
export default function SiteFooter({ onOpenPage, subSurface, muted, focusRing }) {
  const item = `inline-flex items-center min-h-10 underline-offset-4 hover:underline cursor-pointer ${focusRing}`;
  const year = new Date().getFullYear();
  return (
    <footer className={`border-t mt-12 ${subSurface}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5">
            <li>
              <button type="button" onClick={() => onOpenPage('help')} className={item}>
                Help
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onOpenPage('privacy')} className={item}>
                Privacy Policy
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onOpenPage('terms')} className={item}>
                Terms of Use
              </button>
            </li>
            <li>
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className={item}>
                Source code (Apache-2.0)
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
        <p className={muted}>
          © {year} {OPERATOR}
        </p>
      </div>
    </footer>
  );
}
