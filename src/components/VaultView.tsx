'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VaultView() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'primus' || password.toLowerCase() === 'eozka' || password.toLowerCase() === 'inkesk') {
      setUnlocked(true);
      setError('');
    } else {
      setError('Access Denied: Invalid Security Key');
    }
  };

  return (
    <div className="vault-page">
      <nav className="view-nav view-nav--dark">
        <Link href="/archive" className="view-back">
          <span className="view-back__arrow">←</span>
          <span>Archive</span>
        </Link>
        <Link href="/archive" className="view-identity">
          Harsh Dev Jha
        </Link>
      </nav>

      <main className="view-page">
        <section className="vault-hero">
          <p className="vault-kicker">Restricted Access</p>
          <h1>
            <span>PRIVATE</span>
            <span>VAULT</span>
          </h1>
          <p className="vault-note">
            Confidential engineering prototypes, unreleased model weights, and proprietary research.
          </p>

          {!unlocked ? (
            <form className="vault-form" onSubmit={handleUnlock}>
              <input
                type="password"
                placeholder="Enter Access Key (e.g. primus)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Authenticate</button>
              {error && <p className="vault-error">{error}</p>}
            </form>
          ) : (
            <div className="vault-list" style={{ marginTop: '40px' }}>
              <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noreferrer">
                <span className="vault-list__meta">STITCH-CORE ARCHITECTURE</span>
                <strong>Stubvi Asymmetric Out-of-tree Compiler Specifications</strong>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noreferrer">
                <span className="vault-list__meta">AUTONOMOUS AGENT PROTOCOL</span>
                <strong>Vibhu-Oska Quantum Superposition Router Primitives</strong>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noreferrer">
                <span className="vault-list__meta">BIOMETRIC HARDWARE MATRIX</span>
                <strong>Acoustic Neural Resonator & Vocal Frequency Classifier</strong>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}