'use client';

import { PROJECTS_DATA } from '@/components/ArchiveGrid';
import ProjectDetailView from '@/components/ProjectDetailView';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = PROJECTS_DATA.find((p) => p.id === id);
  
  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} />;
}