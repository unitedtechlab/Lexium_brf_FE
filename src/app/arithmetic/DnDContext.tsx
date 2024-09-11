import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DnDContextType {
    type: string | null;
    setType: (type: string | null) => void;
}

const DnDContext = createContext<DnDContextType | undefined>(undefined);

interface DnDProviderProps {
    children: ReactNode;
}

export const DnDProvider = ({ children }: DnDProviderProps) => {
    const [type, setType] = useState<string | null>(null);

    return (
        <DnDContext.Provider value={{ type, setType }}>
            {children}
        </DnDContext.Provider>
    );
};

export const useDnD = (): DnDContextType => {
    const context = useContext(DnDContext);
    if (!context) {
        throw new Error('useDnD must be used within a DnDProvider');
    }
    return context;
};
