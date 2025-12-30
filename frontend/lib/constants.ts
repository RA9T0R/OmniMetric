import {
    House,
    FolderGit2,
    Briefcase,
    Newspaper,
    User,
    Mail,

} from "lucide-react";

// 1. Define the icon map
export const icons = {
    House,
    FolderGit2,
    Briefcase,
    Newspaper,
    User,
    Mail,
};

// 2. Define and export the type
export type SidebarItem = {
    name: string;
    path: string;
    icon: keyof typeof icons; // Uses the map above
    separator?: boolean;
};

// 3. Define and export the data *with the explicit type*
export const sidebar_content: SidebarItem[] = [
    {
        icon: "House",
        name: "Overview",
        path: "/",
    },
    {
        icon: "FolderGit2",
        name: "Projects",
        path: "/projects",
    },
    {
        icon: "Briefcase",
        name: "Experience",
        path: "/experience",
    },
    {
        icon: "Newspaper",
        name: "Blog",
        path: "/blogs",
        separator: true,
    },
    {
        icon: "User",
        name: "About",
        path: "/about",
    },
    {
        icon: "Mail",
        name: "Contact",
        path: "/contact",
    },
];