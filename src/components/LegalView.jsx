import React from 'react';
import { EFFECTIVE_DATE, CONTROL_TEST_SERVERS, EXTERNAL_TEST_SERVERS, LIVE_AD_NETWORKS } from '../lab/legal-content.js';

const linkClass = 'underline underline-offset-4 text-[#a9431c] dark:text-[#f08a5d]';

function ExternalLink({ href, children, focusRing }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center min-h-10 ${linkClass} ${focusRing}`}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// Prose layout for the Privacy Policy and Terms of Use: summary first, then contents,
// then sections. Plain language per DESIGN.md.
export default function LegalView({ page, onOpenPage, surface, subSurface, muted, focusRing }) {
  const effective = new Date(`${EFFECTIVE_DATE}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const other = page.id === 'privacy' ? { id: 'terms', label: 'Terms of Use' } : { id: 'privacy', label: 'Privacy Policy' };

  return (
    <article className="max-w-3xl space-y-8" aria-labelledby="legal-title">
      <header>
        <h1 id="legal-title" className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]">
          {page.title}
        </h1>
        <p className={`mt-2 text-sm ${muted}`}>Effective {effective}</p>
      </header>

      <section className={`rounded-sm border p-5 sm:p-6 ${surface}`} aria-labelledby="legal-summary">
        <h2 id="legal-summary" className="text-lg font-bold">
          In short
        </h2>
        <ul className="mt-3 list-disc pl-5 space-y-2 text-base leading-relaxed">
          {page.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <nav aria-label={`${page.title} contents`} className={`rounded-sm border p-5 ${subSurface}`}>
        <h2 className="text-sm font-bold">Contents</h2>
        <ol className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 list-decimal pl-5 text-sm">
          {page.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${page.id}-${section.id}`} className={`inline-flex min-h-9 items-center underline-offset-4 hover:underline ${focusRing}`}>
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {page.sections.map((section, index) => (
        <section key={section.id} id={`${page.id}-${section.id}`} className="scroll-mt-24 space-y-3" aria-labelledby={`${page.id}-${section.id}-title`}>
          <h2 id={`${page.id}-${section.id}-title`} className="text-xl font-bold">
            <span className={`font-mono text-base mr-2 ${muted}`}>{index + 1}.</span>
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed">
              {paragraph}
            </p>
          ))}

          {section.serverList && (
            <ul className="grid gap-2 sm:grid-cols-2 text-sm">
              {[...EXTERNAL_TEST_SERVERS, ...CONTROL_TEST_SERVERS].map((server) => (
                <li key={server.host} className={`rounded-sm border px-3 py-2 ${surface}`}>
                  <span className="block font-mono break-all">{server.host}</span>
                  <span className={muted}>{server.owner}, </span>
                  <ExternalLink href={server.policy} focusRing={focusRing}>
                    privacy policy
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}

          {section.networkList && (
            <ul className="list-disc pl-5 space-y-1 text-base">
              {LIVE_AD_NETWORKS.map((network) => (
                <li key={network.name}>
                  {network.name}:{' '}
                  <ExternalLink href={network.policy} focusRing={focusRing}>
                    privacy policy
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}

          {section.links && (
            <ul className="space-y-1 text-base">
              {section.links.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href} focusRing={focusRing}>
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className={`text-sm border-t pt-5 border-current/10 ${muted}`}>
        See also the{' '}
        <button type="button" onClick={() => onOpenPage(other.id)} className={`inline-flex items-center min-h-10 ${linkClass} font-semibold cursor-pointer ${focusRing}`}>
          {other.label}
        </button>
        .
      </p>
    </article>
  );
}
