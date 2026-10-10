'use client';

import ArchiveGrid from '@/components/ArchiveGrid';
import Navigation from '@/components/Navigation';

export default function ArchivePage() {
  return (
    <div className="experience-page">
      <Navigation />
      <ArchiveGrid />
    </div>
  );
}