'use client';

import { DustCanvas } from '@/lib/dust-canvas';
import { ReactNode } from 'react';

export default function DarkPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark-page">
      <DustCanvas webglOpacity={1} dustOpacity={0.85} />
      {children}
    </div>
  );
}