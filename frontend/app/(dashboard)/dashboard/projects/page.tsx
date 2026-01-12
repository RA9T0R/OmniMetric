'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DUMMY_PROJECTS } from '@/lib/constants';
import ProjectCard from '@/components/ProjectCard';
import ProjectUploadModal from '@/components/ProjectUploadModal';

const ProjectsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="w-full flex flex-col gap-8 xl:max-w-9/10 mx-auto pb-12 relative">

            {/* 1. Header Section */}
            <div className="flex flex-col sm:flex-row md:items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-Text dark:text-Dark_Text">Project Overview</h1>
                    <p className="text-xs font-light text-subtext dark:text-Dark_subtext">
                        View your project or create new one
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)} // Open Modal
                    className="btn-primary-action flex justify-center items-center gap-2 text-white mt-4 sm:mt-0"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Create Project</span>
                </button>
            </div>

            {/* 2. Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {DUMMY_PROJECTS.map((project) => (
                    <ProjectCard key={project.projectId} data={project} />
                ))}
            </div>

            {/* 3. The Smart Popup */}
            <ProjectUploadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode="create"
            />
        </div>
    );
}

export default ProjectsPage;