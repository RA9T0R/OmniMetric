import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ children, className = "" }: ContainerProps) => {
    return (
        <div className={`w-full 2xl:max-w-[1440px] xl:max-w-7xl lg:max-w-5xl md:max-w-3xl sm:max-w-2xl mx-auto border-x border-BG_light dark:border-Dark_BG_light ${className}`}>
            {children}
        </div>
    );
};

export default Container;