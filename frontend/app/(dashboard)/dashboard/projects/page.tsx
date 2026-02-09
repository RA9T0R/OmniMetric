'use client';

import React, { useState } from 'react';
import { Plus, Loader2, Layers } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectUploadModal from '@/components/ProjectUploadModal';

import { useProjects } from '@/hooks/useProjects';

const ProjectsPage = () => {
    const { projects, isLoading, refreshProjects } = useProjects();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const mappedProjects = projects.map((p) => {
        const isProcessing = p.images.some(img => img.status === 'pending' || img.status === 'processing');
        const status = isProcessing ? 'Processing' : 'Completed';

        return {
            projectId: p.project_id,
            title: p.title,
            date: new Date(p.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            modelName: p.model_name,
            inputType: p.input_type || 'Normal Image',
            imageCount: p.images.length,
            status: status
        };
    });

    return (
        <div className="w-full flex flex-col gap-8 xl:max-w-9/10 mx-auto pb-12 relative">
            <div className="flex flex-col sm:flex-row md:items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Project Overview</h1>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext">
                        View your project or create new one
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary-action flex justify-center items-center gap-2 text-white mt-4 sm:mt-0"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Create Project</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-subtext gap-3">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Loading projects...</p>
                </div>
            ) : mappedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {mappedProjects.map((project) => (
                        <ProjectCard key={project.projectId} data={project} />
                    ))}
                </div>
            ) : (
                // --- Empty State (ถ้ายังไม่มีโปรเจกต์) ---
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl opacity-60">
                    <Layers size={48} className="mb-4 text-zinc-400" />
                    <h3 className="text-lg font-bold text-Text dark:text-Dark_Text">No projects found</h3>
                    <p className="text-sm text-subtext mb-6">Create your first project to get started</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-power font-medium hover:underline text-sm"
                    >
                        Create Project Now
                    </button>
                </div>
            )}

            {isCreateModalOpen && (
                <ProjectUploadModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    mode="create"
                    onSuccess={() => {refreshProjects();}}
                />
            )}
        </div>
    );
}

export default ProjectsPage;