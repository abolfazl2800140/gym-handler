import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(authService.getUser());

    // تابع برای به‌روزرسانی وضعیت احراز هویت
    const updateAuthState = () => {
        setIsAuthenticated(authService.isAuthenticated());
        setUser(authService.getUser());
    };

    // تابع login
    const login = async (credentials, type = 'admin') => {
        try {
            let response;
            if (type === 'admin') {
                response = await authService.login(credentials);
            } else {
                response = await authService.memberLogin(credentials);
            }

            if (response.success) {
                updateAuthState();
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    // تابع logout
    const logout = async () => {
        await authService.logout();
        updateAuthState();
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            updateAuthState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
