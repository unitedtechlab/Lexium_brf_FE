"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, isValidToken, removeToken, decodeToken, isBrowser } from '@/utils/auth';
import { useEmail } from '@/app/context/emailContext';
import PasswordModal from '@/app/modals/new-password/newpassword';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const router = useRouter();
    const { setEmail, setFirstName, setLastName } = useEmail();
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const fetchTokenAndRedirect = async () => {
            if (!isBrowser()) return;

            const urlParams = new URLSearchParams(window.location.search);
            const queryToken = urlParams.get('token');
            const showModal = urlParams.get('showModal');

            if (queryToken) {
                setToken(queryToken);
                const decodedToken = decodeToken(queryToken);
                if (decodedToken) {
                    setEmail(decodedToken.email);
                    setFirstName(decodedToken.firstName);
                    setLastName(decodedToken.lastName);
                }

                if (showModal === "true") {
                    setShowPasswordModal(true);
                }
                return;
            }

            const token = getToken();
            if (!token) {
                removeToken();
                router.push('/signin');
                return;
            }

            const tokenIsValid = isValidToken(token);
            if (!tokenIsValid) {
                removeToken();
                router.push('/signin');
                return;
            }

            const decodedToken = decodeToken(token);
            if (decodedToken) {
                setEmail(decodedToken.email);
                setFirstName(decodedToken.firstName);
                setLastName(decodedToken.lastName);
                if (showModal === "true") {
                    setShowPasswordModal(true);
                }
            }
        };

        fetchTokenAndRedirect();

        const timeout = setTimeout(() => {
            if (!isBrowser()) return;

            const token = getToken();
            if (token && isValidToken(token)) {
                setIsTokenValid(false);
                removeToken();
                window.location.reload();
            }
        }, 24 * 60 * 60 * 1000); // Token expiration after 24 hours

        return () => clearTimeout(timeout);
    }, [router, setEmail, setFirstName, setLastName]);

    const handleModalCancel = () => {
        setShowPasswordModal(false);
        if (isBrowser()) {
            localStorage.setItem('dismissedPasswordModal', 'true');
        }
    };

    const handlePasswordChangeSuccess = () => {
        setShowPasswordModal(false);
        if (isBrowser()) {
            localStorage.setItem('dismissedPasswordModal', 'true');
        }
    };

    if (!isTokenValid) return null;

    return (
        <>
            {children}
            <PasswordModal
                open={showPasswordModal}
                onCancel={handleModalCancel}
                onSuccess={handlePasswordChangeSuccess}
            />
        </>
    );
};

export default PrivateRoute;
