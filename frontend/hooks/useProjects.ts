import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Project } from '@/types/type';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchProjects = useCallback(async () => {
        const token = Cookies.get('token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const res = await fetch(`${API_URL}/projects/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else {
                console.error("Failed to fetch projects");
                setError("Failed to load projects");
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    const createProjectWithImages = async (
        title: string,
        modelName: string,
        inputType: string,
        files: File[]
    ) => {
        const token = Cookies.get('token');
        if (!token) throw new Error("No token found");

        try {
            // 1. เตรียม FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('model_name', modelName);
            formData.append('input_type', inputType);

            files.forEach((file) => {
                formData.append('files', file);
            });

            // 2. ยิง Request เดียวไปที่ Endpoint ใหม่
            const res = await fetch(`${API_URL}/projects/create_bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                if (res.status === 402) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Insufficient Credits for this project");
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to create project");
            }

            // Success
            await fetchProjects(); // รีโหลดลิสต์โปรเจกต์

            const projectData = await res.json();
            return projectData.project_id;

        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    };

    const addImagesToProject = async (projectId: string, files: File[]) => {
        const token = Cookies.get('token');
        if (!token) throw new Error("No token found");

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_URL}/projects/${projectId}/images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) {
                    if (res.status === 402) {
                        const errData = await res.json();
                        throw new Error(errData.detail || "Insufficient Credits");
                    }
                    throw new Error("Failed to upload image");
                }
                return res.json();
            });

            await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error adding images:", error);
            throw error;
        }
    };

    const deleteProject = async (projectId: string) => {
        const token = Cookies.get('token');
        if (!token) throw new Error("No token found");

        try {
            const res = await fetch(`${API_URL}/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to delete project");

            return true;
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        isLoading,
        error,
        refreshProjects: fetchProjects,
        createProjectWithImages,
        addImagesToProject,
        deleteProject
    };
};