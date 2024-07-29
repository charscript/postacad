import React from 'react';
import { createContext, useState, useContext, ReactNode } from 'react';

interface ToggleContextType {
    isToggled: boolean;
    toggle: () => void;
}

const ToggleContext = createContext<ToggleContextType | undefined>(undefined);

export const ToggleProvider = ({ children }: { children: ReactNode }) => {
    const [isToggled, setIsToggled] = useState(false);

    const toggle = () => {
        setIsToggled(prev => !prev);
    };

    return (
        <ToggleContext.Provider value={{ isToggled, toggle }}>
            {children}
        </ToggleContext.Provider>
    );
};

export const useToggle = () => {
    const context = useContext(ToggleContext);
    if (!context) {
        throw new Error('useToggle must be used within a ToggleProvider');
    }
    return context;
};
