// ==========================================
// 1. Core Entities (ข้อมูลพื้นฐานหลักของระบบ)
// ==========================================

export interface UserProfile {
    user_id: string;
    username: string;
    email: string;
    credit_balance: number;
    profile_picture_url?: string;
}

export interface UserUpdatePayload {
    username?: string;
    email?: string;
    old_password?: string;
    new_password?: string;
}

export interface Transaction {
    transaction_id: string;
    amount: number;
    type: 'purchase' | 'spend';
    created_at: string;
    payment_id?: string;
}

export interface Project {
    project_id: string;
    user_id: string;
    title: string;
    input_type: string;
    model_name: string;
    created_at: string;
    images: Image[];
}

export interface Image {
    image_id: string;
    image_url: string;
    image_name: string;
    status: string;
    upload_date: string;
}

// ==========================================
// 2. Geometry & Detection (ข้อมูลเชิงพื้นที่และการตรวจจับ)
// ==========================================

export interface BoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface DetectedObject {
    id: string;
    label: string;
    confidence: number;
    distance: number;
    box?: BoundingBox;
    color?: 'green' | 'yellow' | 'red';
}

// ==========================================
// 3. Analysis & Calibration (ผลลัพธ์การวิเคราะห์เชิงลึก)
// ==========================================

export interface CalibrationData {
    [key: string]: unknown;
}

export interface AnalysisResult {
    depth_map_visual_url: string | null;
    raw_depth_file_url: string | null;
    calibration_data: CalibrationData | null;
}

// ==========================================
// 4. API DTOs (Data Transfer Objects)
// ==========================================

export interface APIDetectedObject {
    object_id: string;
    label: string;
    confidence: number;
    box_data: BoundingBox | null;
    distance: number;
}

export interface APIImage {
    image_id: string;
    image_url: string;
    image_name: string;
    scene_label: string;
    upload_date: string;
    analysis_result?: {
        depth_map_visual_url?: string;
        raw_depth_file_url?: string;
        calibration_data?: any;
    } | null;
    detected_objects?: APIDetectedObject[];
}

export interface APIProjectResponse {
    project_id: string;
    title: string;
    model_name: string;
    input_type: string;
    created_at: string;
    images: APIImage[];
}

// ==========================================
// 5. Frontend/UI Models (ข้อมูลสำหรับหน้าเว็บ)
// ==========================================

export interface ProjectImageDetail {
    id: string;
    url: string;
    depthUrl?: string;
    name: string;
    sceneLabel?: string | null;
    type: string;
    uploadDate: string;
    objects: DetectedObject[];
    analysisResult?: AnalysisResult | null;
}

export interface ProjectDetail {
    id: string;
    title: string;
    description: string;
    modelType: string;
    imageType: string;
    inputType: string;
    images: ProjectImageDetail[];
}

export interface ImageViewerProps {
    url: string;
    depthUrl?: string;
    viewMode: 'normal' | 'depth';
    isPointerActive: boolean;
    objects: DetectedObject[];
    selectedObjectId: string | null;
    onObjectClick: (id: string) => void;
    onPixelSelect: (data: { x: number; y: number }) => void;
}

export interface SceneSummary {
    label: string;
    count: number;
}

// ==========================================
// 6. Interaction & Measurement (การโต้ตอบและการวัดค่า)
// ==========================================

export interface PixelSelectionData {
    x: number;
    y: number;
}

export interface MeasurePointPayload {
    image_id: string;
    x: number;
    y: number;
}

export interface MeasurePointResponse {
    distance: number;
    unit: string;
}