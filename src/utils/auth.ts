import { TOKEN_KEY } from '@/app/constants/index';

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const isValidToken = (token: string) => {
    try {
        const decodedToken = decodeToken(token);
        return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};

export const decodeToken = (token: string) => {
    return JSON.parse(atob(token.split('.')[1]));
};

export const isBrowser = () => typeof window !== 'undefined';
