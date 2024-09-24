import React, { createContext, useContext, useState } from 'react';

const DnDContext = createContext<any>(null);

export const DnDProvider = ({ children }: { children: React.ReactNode }) => {
    const [type, setType] = useState<string | { nodeType: string; titleName: string }>('');

    return (
        <DnDContext.Provider value={{ type, setType }}>
            {children}
        </DnDContext.Provider>
    );
};

export const useDnD = () => useContext(DnDContext);
