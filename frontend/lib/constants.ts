import {
    House, // Home
    Blocks,      // Projects
    HandCoins,             // Price
    PencilLine,        // Description
    LogOut,
    Settings,
    Coins,           // Added for Token icon if needed
    Menu             // Added for mobile menu
} from "lucide-react";

export const icons = {
    House,
    Blocks,
    HandCoins,
    PencilLine,
    LogOut,
    Settings,
    Coins,
    Menu
};

export type SidebarItem = {
    name: string;
    path: string;
    icon: keyof typeof icons;
    separator?: boolean; // <--- ADDED THIS
};

export const sidebar_content: SidebarItem[] = [
    {
        icon: "House",
        name: "Home",
        path: "/dashboard",
    },
    {
        icon: "Blocks",
        name: "Projects",
        path: "/dashboard/projects",
    },
    {
        icon: "HandCoins",
        name: "Price",
        path: "/dashboard/price",
        separator: true, // <--- This will trigger the line BEFORE this item
    },
    {
        icon: "PencilLine",
        name: "Description",
        path: "/dashboard/description",
    },
];

// ==========================================
// USER DATA
// ==========================================
export const DUMMY_USER = {
    userId: "user_v4_123456789",
    username: "John Doe",
    email: "John.Doe_Fake@gmail.com",
    password_hash: "secret_hash_123", // We won't show this, but it exists in DB
    credit_balance: 100.00,
    created_at: "2025-01-01T00:00:00Z"
};

// ==========================================
// PRICING DATA
// ==========================================
export interface PricingTier {
    id: string;
    name: string;
    tokens: number;
    price: number;
    rate: string;
    icon: 'coins' | 'baby' | 'handshake' | 'chessKing' | 'flame' | 'star';
}

export const PRICING_TIERS: PricingTier[] = [
    {
        id: 'mini',
        name: 'MiniPack',
        tokens: 300,
        price: 39,
        rate: '7.69 token/THB',
        icon: 'baby'
    },
    {
        id: 'starter',
        name: 'StarterPack',
        tokens: 650,
        price: 79,
        rate: '8.23 token/THB',
        icon: 'handshake'
    },
    {
        id: 'standard',
        name: 'StandardPack',
        tokens: 1500,
        price: 149,
        rate: '10.07 token/THB',
        icon: 'star'
    },
    {
        id: 'pro',
        name: 'ProPack',
        tokens: 3500,
        price: 299,
        rate: '11.71 token/THB',
        icon: 'flame'
    },
    {
        id: 'power',
        name: 'PowerPack',
        tokens: 12500,
        price: 899,
        rate: '13.90 token/THB',
        icon: 'chessKing'
    }
];

// ==========================================
// DASHBOARD HOME DATA
// ==========================================

export const DASHBOARD_STATS = {
    totalProjects: 12,
    totalTokens: 100
};

export const RECENT_PROJECTS = [
    {
        id: "rp_1",
        name: "Somewhere",
        model: "ProTypeModel",
        imageCount: 10,
        icon: "star" // just a string reference for now
    },
    {
        id: "rp_2",
        name: "Nowhere",
        model: "FastTypeModel",
        imageCount: 100,
        icon: "fast"
    },
    {
        id: "rp_3",
        name: "Somewhere",
        model: "ProTypeModel",
        imageCount: 10,
        icon: "star"
    }
];

export const TYPE_PRICES = {
    models: [
        { name: "ProTypeModel", price: "XX Token", icon: "crown" },
        { name: "FastTypeModel", price: "XX Token", icon: "zap" }
    ],
    images: [
        { name: "360 Image", price: "XX Token", icon: "globe" },
        { name: "Normal", price: "XX Token", icon: "image" }
    ]
};
// ==========================================
// 1. PRICING CONFIG (For Calculator Logic)
// ==========================================
export const PRICING_CONFIG = {
    models: {
        'ProTypeModel': 10,  // Cost per image
        'FastTypeModel': 5
    },
    inputs: {
        '360_degree': 5,     // Extra cost per image
        'normal': 2
    }
};

// ==========================================
// 2. PROJECT LIST DATA
// ==========================================
export const DUMMY_PROJECTS = [
    {
        projectId: "proj_001",
        title: "Somewhere",
        date: "29 February 2024",
        modelName: "ProTypeModel",
        inputType: "Normal Image",
        imageCount: 10,
        status: "Completed", // Clickable
        thumbnail: "/images/project_thumb_1.jpg" // We'll use a placeholder color if missing
    },
    {
        projectId: "proj_002",
        title: "Nowhere",
        date: "02 October 2024",
        modelName: "FastTypeModel",
        inputType: "360 Image",
        imageCount: 100,
        status: "Processing", // NOT Clickable (Locked)
        thumbnail: "/images/project_thumb_2.jpg"
    },
    {
        projectId: "proj_003",
        title: "Somewhere",
        date: "29 February 2024",
        modelName: "FastTypeModel",
        inputType: "360 Image",
        imageCount: 100,
        status: "Failed", // Error State
        thumbnail: "/images/project_thumb_3.jpg"
    },
    {
        projectId: "proj_004",
        title: "Somewhere",
        date: "29 February 2024",
        modelName: "ProTypeModel",
        inputType: "Normal Image",
        imageCount: 10,
        status: "Completed",
        thumbnail: "/images/project_thumb_4.jpg"
    }
];

// ==========================================
// 3. PROJECT DETAIL MOCK DATA
// ==========================================

export const DUMMY_PROJECT_DETAIL = {
    id: "proj_001",
    title: "Somewhere Detail",
    description: "This is your 'somewhere' project detail",
    modelType: "ProTypeModel",
    imageType: "Normal Image",
    images: [
        {
            id: "img_01",
            url: "/images/sample_street.jpg", // You can use a placeholder if you don't have this
            depthUrl: "/images/sample_street_depth.jpg", // Placeholder for depth map
            name: "Street_View_01",
            uploadDate: "2024-02-20",
            objects: [
                {
                    id: "obj_1",
                    label: "Person 1",
                    confidence: 99,
                    distance: 7.38,
                    // Percentages for responsive positioning: { top, left, width, height }
                    box: { top: 25, left: 45, width: 10, height: 45 },
                    color: "green" // green, yellow, red
                },
                {
                    id: "obj_2",
                    label: "Person 2",
                    confidence: 85,
                    distance: 6.04,
                    box: { top: 35, left: 30, width: 8, height: 30 },
                    color: "yellow"
                },
                {
                    id: "obj_3",
                    label: "Person 3",
                    confidence: 90,
                    distance: 12.5,
                    box: { top: 38, left: 60, width: 7, height: 28 },
                    color: "green"
                }
            ]
        },
        {
            id: "img_02",
            url: "/images/sample_room.jpg",
            depthUrl: "/images/sample_room_depth.jpg",
            name: "Room_View_01",
            uploadDate: "2024-02-21",
            objects: [] // Empty for now
        }
    ]
};