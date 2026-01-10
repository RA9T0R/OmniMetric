'use client'

import {Sun,Moon} from "lucide-react";
import {useTheme} from "next-themes";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="relative rounded-full h-10 w-10 flex items-center justify-center" disabled>
                <div className="h-6 w-6" />
            </button>
        );
    }

    return (
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="shadow-xs shadow-text dark:shadow-Dark_text rounded-full cursor-pointer size-8 md:size-11 flex items-center justify-center">
            {theme === "dark"
              ? <Sun strokeWidth={2} className="size-5 md:size-8"/>
              : <Moon strokeWidth={2} className="size-5 md:size-8"/>}
        </button>
    )
}
export default ThemeToggle
