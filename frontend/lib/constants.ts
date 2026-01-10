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
// PROJECT DATA
// ==========================================

export const DUMMY_PROJECTS = [
    {
        id: "proj_01",
        title: "Downtown Traffic Analysis",
        inputType: "normal",
        modelName: "yolo_precise",
        imageCount: 12,
        updatedAt: "2 mins ago",
        status: "processing"
    },
    {
        id: "proj_02",
        title: "Forest Depth Map",
        inputType: "360_degree",
        modelName: "yolo_fast",
        imageCount: 4,
        updatedAt: "2 days ago",
        status: "done"
    },
    {
        id: "proj_03",
        title: "Construction Site A",
        inputType: "normal",
        modelName: "yolo_precise",
        imageCount: 150,
        updatedAt: "1 week ago",
        status: "done"
    }
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