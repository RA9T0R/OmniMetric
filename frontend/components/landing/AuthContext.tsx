'use client';

import { createContext, useContext } from 'react';

interface AuthContextType {
    openLogin: () => void;
    openSignup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = AuthContext.Provider;