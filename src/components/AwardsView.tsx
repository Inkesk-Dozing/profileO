'use client';

import Link from 'next/link';

export default function AwardsView() {
  const awardsList = [
    {
      show: 'International Engineering & Tech Excellence',
      entries: [
        {
          title: 'N.A.V.R.A.A.H. Spatial AI Architecture',
          year: '2025',
          medals: 'Gold Award · Spatial Computing & Real-time AI Systems',
          details: [
            { label: 'Category', value: 'Embedded Intelligence & Safety' },
            { label: 'Recognition', value: 'Best Autonomous Spatial System' }
          ]
        },
        {
          title: 'Multi-App Zenith Theme Suite',
          year: '2024',
          medals: 'Grand Prix · Cross-Platform UX Architecture',
          details: [
            { label: 'Category', value: 'Mobile Framework Architecture' },
            { label: 'Recognition', value: 'Unified Design System Excellence' }
          ]
        }
      ]
    },
    {
      show: 'Open Source Systems & Hardware Symposia',
      entries: [
        {
          title: 'Eozka Collaborative Core',
          year: '2024',
          medals: 'Honorary Distinction · Open Infrastructure',
          details: [
            { label: 'Category', value: 'Systems Engineering' },
            { label: 'Role', value: 'Founding Lead Architect' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="awards-page">
      <nav className="view-nav view-nav--dark">
        <Link href="/archive" className="view-back">
          <span className="view-back__arrow">←</span>
          <span>Archive</span>
        </Link>
        <Link href="/archive" className="view-identity">
          Harsh Dev Jha
        </Link>
        <div className="view-links">
          <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </nav>

      <main className="view-page">
        <section className="awards-hero">
          <p className="awards-kicker">Honors & Accolades</p>
          <h1>
            <span>SYSTEM</span>
            <span>AWARDS</span>
          </h1>
          <p className="awards-note">
            Recognitions across artificial intelligence, spatial computing, and system engineering.
          </p>
        </section>

        <section className="awards-tally">
          <ul className="awards-tally__list">
            <li>
              <b>12</b>
              <span>Gold Medals</span>
            </li>
            <li>
              <b>08</b>
              <span>Grand Prix</span>
            </li>
            <li>
              <b>15</b>
              <span>System Honors</span>
            </li>
          </ul>
        </section>

        <section className="awards-ledger">
          <div className="section-label">Selected Honors</div>
          <div className="award-show">
            {awardsList.map((group, idx) => (
              <div key={idx} style={{ marginBottom: '40px' }}>
                <h2 className="award-show__name">
                  {group.show} <span>{group.entries.length} Entries</span>
                </h2>
                {group.entries.map((item, eIdx) => (
                  <details key={eIdx} className="award-entry">
                    <summary>
                      <span className="award-entry__title">{item.title}</span>
                      <span className="award-entry__medals">{item.medals}</span>
                      <span className="award-entry__year">{item.year}</span>
                    </summary>
                    <div className="award-entry__detail">
                      <ul>
                        {item.details.map((d, dIdx) => (
                          <li key={dIdx}>
                            <span>{d.label}</span>
                            <span>{d.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}