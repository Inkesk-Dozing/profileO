'use client';

import { PROJECTS_DATA } from '@/components/ArchiveGrid';
import ProjectDetailView from '@/components/ProjectDetailView';
import { notFound } from 'next/navigation';
import { DustCanvas } from '@/lib/dust-canvas';
import Navigation from '@/components/Navigation';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = PROJECTS_DATA.find((p) => p.id === id);
  
  if (!project) {
    notFound();
  }

  return (
    <div className="dark-page">
      <DustCanvas webglOpacity={1} dustOpacity={0.85} />
      <Navigation />
      <ProjectDetailView project={project} />
    </div>
  );
}