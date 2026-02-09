import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
    ProjectDetail,
    APIProjectResponse,
    MeasurePointResponse,
    MeasurePointPayload,
    DetectedObject
} from '@/types/type';

export const useProjectDetail = (projectId: string) => {
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchProjectDetail = useCallback(async () => {
        if (!projectId) return;

        const token = Cookies.get('token');
        if (!token) {
            setError("Unauthorized");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data: APIProjectResponse = await res.json();
                const isSequentialName = data.images.every(img => /\d/.test(img.image_name));

                const sortedRawImages = [...data.images].sort((a, b) => {
                    if (isSequentialName) {
                        return a.image_name.localeCompare(b.image_name, undefined, { numeric: true, sensitivity: 'base' });
                    } else {
                        return new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime();
                    }
                });

                const mappedProject: ProjectDetail = {
                    id: data.project_id,
                    title: data.title,
                    description: `Project created on ${new Date(data.created_at).toLocaleDateString('en-GB')}`,
                    modelType: data.model_name,
                    imageType: data.input_type,
                    inputType: data.input_type,

                    // Use 'sortedRawImages' here instead of 'data.images'
                    images: sortedRawImages.map((img) => {
                        // Map Detected Objects
                        const mappedObjects: DetectedObject[] = (img.detected_objects || []).map((obj) => {
                            let color: 'green' | 'yellow' | 'red' = 'red';
                            if (obj.confidence > 80) color = 'green';
                            else if (obj.confidence > 40) color = 'yellow';

                            return {
                                id: obj.object_id,
                                label: obj.label,
                                confidence: obj.confidence,
                                distance: obj.distance,
                                box: obj.box_data || undefined,
                                color: color
                            };
                        });

                        return {
                            id: img.image_id,
                            url: img.image_url,
                            depthUrl: img.analysis_result?.depth_map_visual_url ?? undefined,
                            name: img.image_name,
                            type: data.input_type,
                            uploadDate: new Date(img.upload_date).toLocaleDateString('en-GB'),
                            analysisResult: img.analysis_result ? {
                                depth_map_visual_url: img.analysis_result.depth_map_visual_url || null,
                                raw_depth_file_url: img.analysis_result.raw_depth_file_url || null,
                                calibration_data: img.analysis_result.calibration_data || null
                            } : null,
                            objects: mappedObjects
                        };
                    })
                };
                console.log(data)
                setProject(mappedProject);
                setError(null);
            } else {
                setError("Project not found");
            }
        } catch (err) {
            console.error("Fetch Project Error:", err);
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, projectId]);

    useEffect(() => {
        fetchProjectDetail();
    }, [fetchProjectDetail]);

    const measurePoint = useCallback(async (payload: MeasurePointPayload): Promise<MeasurePointResponse | null> => {
        const token = Cookies.get('token');
        if (!token) {
            console.error("No token found");
            return null;
        }
        try {
            const res = await fetch(`${API_URL}/analysis/measure-point`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to measure point");
            }

            return await res.json();

        } catch (error) {
            console.error("Measure Point Error:", error);
            throw error;
        }
    }, [API_URL]);

    return {
        project,
        isLoading,
        error,
        refreshProject: fetchProjectDetail,
        measurePoint
    };
};