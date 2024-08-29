"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

interface EmailContextProps {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    setEmail: (email: string | null) => void;
    setFirstName: (first_name: string | null) => void;
    setLastName: (last_name: string | null) => void;
}

const EmailContext = createContext<EmailContextProps | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [email, setEmail] = useState<string | null>(null);
    const [first_name, setFirstName] = useState<string | null>(null);
    const [last_name, setLastName] = useState<string | null>(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        const storedFirstName = localStorage.getItem("first_name");
        const storedLastName = localStorage.getItem("last_name");
        if (storedEmail) setEmail(storedEmail);
        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
    }, []);

    const updateLocalStorage = (key: string, value: string | null) => {
        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    };

    const handleSetEmail = (email: string | null) => {
        setEmail(email);
        updateLocalStorage("email", email);
    };

    const handleSetFirstName = (first_name: string | null) => {
        setFirstName(first_name);
        updateLocalStorage("first_name", first_name);
    };

    const handleSetLastName = (last_name: string | null) => {
        setLastName(last_name);
        updateLocalStorage("last_name", last_name);
    };

    const contextValue = useMemo(
        () => ({
            email,
            first_name,
            last_name,
            setEmail: handleSetEmail,
            setFirstName: handleSetFirstName,
            setLastName: handleSetLastName,
        }),
        [email, first_name, last_name]
    );

    return (
        <EmailContext.Provider value={contextValue}>
            {children}
        </EmailContext.Provider>
    );
};

export const useEmail = (): EmailContextProps => {
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error("useEmail must be used within an EmailProvider");
    }
    return context;
};
