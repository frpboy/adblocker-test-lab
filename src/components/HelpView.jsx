import React from 'react';
import { HELP_SECTIONS } from '../lab/help-content.js';

// Plain answers first (DESIGN.md: everyone, plain first). Topics on the left on wide
// screens; each question is a native disclosure, so it works with keyboard and screen readers.
export default function HelpView({ onAction, surface, subSurface, muted, focusRing }) {
  return (
    <div className="space-y-10 max-w-6xl">
      <header className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]">Help</h1>
        <p className={`mt-3 text-base leading-relaxed ${muted}`}>
          Plain answers to the questions people ask most about this test, what the results mean, and what happens to your data.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
        <nav aria-label="Help topics" className="lg:sticky lg:top-20">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {HELP_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#help-${section.id}`}
                  className={`inline-flex items-center min-h-10 px-3 lg:px-0 rounded-sm border lg:border-0 text-sm font-semibold underline-offset-4 hover:underline ${subSurface} lg:bg-transparent ${focusRing}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {HELP_SECTIONS.map((section) => (
            <section key={section.id} id={`help-${section.id}`} aria-labelledby={`help-${section.id}-title`} className="scroll-mt-24">
              <h2 id={`help-${section.id}-title`} className="text-xl font-bold mb-3">
                {section.title}
              </h2>
              <div className={`rounded-sm border divide-y divide-current/10 ${surface}`}>
                {section.items.map((item) => (
                  <details key={item.q} className="group">
                    <summary
                      className={`flex items-center justify-between gap-4 min-h-12 px-4 sm:px-5 py-3 cursor-pointer select-none font-semibold list-none [&::-webkit-details-marker]:hidden ${focusRing}`}
                    >
                      <span>{item.q}</span>
                      <span aria-hidden="true" className={`shrink-0 text-lg leading-none transition-transform motion-reduce:transition-none group-open:rotate-45 ${muted}`}>
                        +
                      </span>
                    </summary>
                    <div className="px-4 sm:px-5 pb-5 space-y-3 max-w-prose">
                      {item.a.map((paragraph) => (
                        <p key={paragraph} className="text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                      {item.action && (
                        <button
                          type="button"
                          onClick={() => onAction(item.action.target)}
                          className={`min-h-10 text-sm font-semibold underline underline-offset-4 text-[#a9431c] dark:text-[#f08a5d] cursor-pointer ${focusRing}`}
                        >
                          {item.action.label}
                        </button>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
