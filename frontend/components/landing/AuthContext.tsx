'use client';

import { createContext, useContext } from 'react';

// Define what functions are available
interface AuthContextType {
    openLogin: () => void;
    openSignup: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a helper hook so you don't have to write useContext every time
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the Provider
export const AuthProvider = AuthContext.Provider;