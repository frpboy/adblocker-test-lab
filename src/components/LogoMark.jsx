import React from 'react';

// Owner-supplied mark: a shield (protection) holding a lab flask (testing) whose
// sample is a blocked ad. Ink carries the outline; safety orange marks the blocked ad.
// Shares geometry with public/favicon.svg.
export default function LogoMark({ className = 'w-9 h-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path
        d="M32 6.5c-6.2 4.6-13 7.4-21.5 8.2C10.5 33 13.5 47.5 32 57c18.5-9.5 21.5-24 21.5-42.3C45 13.9 38.2 11.1 32 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinejoin="round"
      />
      <path
        d="M27.2 18.5h9.6M28.6 18.5v8.6L21 40.3a2.6 2.6 0 0 0 2.3 3.9h17.4a2.6 2.6 0 0 0 2.3-3.9l-7.6-13.2v-8.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="26.6" y="31.2" width="10.8" height="8.2" rx="1.4" fill="none" stroke="#c65322" strokeWidth="2.6" />
      <path d="m29.9 33.4 4.2 3.8m0-3.8-4.2 3.8" stroke="#c65322" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
