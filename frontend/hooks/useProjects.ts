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
            const projectRes = await fetch(`${API_URL}/projects/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    model_name: modelName,
                    input_type: inputType
                })
            });

            if (!projectRes.ok) throw new Error("Failed to create project");
            const projectData = await projectRes.json();
            const projectId = projectData.project_id;

            const uploadPromises = files.map(file => {
                const formData = new FormData();
                formData.append('file', file);

                return fetch(`${API_URL}/projects/${projectId}/images`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            });

            await Promise.all(uploadPromises);

            fetchProjects();
            return projectId;

        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    };

    const addImagesToProject = async (projectId: string, files: File[]) => {
        const token = Cookies.get('token');
        if (!token) throw new Error("No token found");

        try {
            const uploadPromises = files.map(file => {
                const formData = new FormData();
                formData.append('file', file);

                return fetch(`${API_URL}/projects/${projectId}/images`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
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