import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/api';

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Fetch user data
    const fetchUser = useCallback(async (force = false) => {
        const userId = localStorage.getItem('userId');

        // Don't fetch if no userId or already loading
        if (!userId || (loading && !force)) {
            return;
        }

        // Don't fetch if user already exists and not forcing refresh
        if (user && !force) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getProfile();
            // console.log('API response:', response.data.data[0]);

            if (!response.success && response.data && response.data.data.length > 0) {
                const userData = response.data.data[0];
                setUser(userData);
                setError(null);
            } else {
                setError(response.message || 'Failed to fetch user data');
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [user, loading]);

    // Refresh user data
    const refreshUser = useCallback(() => {
        return fetchUser(true);
    }, [fetchUser]);

    // Update user data locally (optimistic updates)
    const updateUser = useCallback((updates) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });
    }, []);

    // Update user address locally
    const updateUserAddress = useCallback((addressData) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                address: addressData
            };
        });
    }, []);

    // Update user wallet locally
    const updateUserWallet = useCallback((walletData) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                wallet: Array.isArray(walletData) ? walletData : [walletData]
            };
        });
    }, []);

    // Update wallet balance
    const updateWalletBalance = useCallback((newBalance) => {
        setUser(prevUser => {
            if (!prevUser || !prevUser.wallet || prevUser.wallet.length === 0) {
                return prevUser;
            }
            return {
                ...prevUser,
                wallet: [{
                    ...prevUser.wallet[0],
                    balance: newBalance
                }]
            };
        });
    }, []);

    // Clear user data (for logout)
    const clearUser = useCallback(() => {
        setUser(null);
        setError(null);
        setLoading(false);
        setInitialized(false);
    }, []);

    // Get user wallet balance
    const getWalletBalance = useCallback(() => {
        // console.log('getWalletBalance called, user:', user);
        if (!user || !user.wallet || !Array.isArray(user.wallet) || user.wallet.length === 0) {
            // console.log('No user or valid wallet, returning 0');
            return 0;
        }
        // console.log('Wallet balance:', user.wallet[0].balance);
        return user.wallet[0].balance || 0;
    }, [user]);

    // Get user full name
    const getUserFullName = useCallback(() => {
        if (!user) return '';
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }, [user]);

    // Get user primary address
    const getPrimaryAddress = useCallback(() => {
        if (!user || !user.address || user.address.length === 0) {
            return null;
        }
        // Return the first non-deleted address or the first address
        return user.address.find(addr => !addr.is_deleted) || user.address[0];
    }, [user]);

    // Check if user has complete profile
    const hasCompleteProfile = useCallback(() => {
        if (!user) return false;

        const requiredFields = ['first_name', 'last_name', 'email', 'mobile_no', 'date_of_birth', 'gender'];
        const hasRequiredFields = requiredFields.every(field => user[field]);
        const hasAddress = user.address && user.address.length > 0;

        return hasRequiredFields && hasAddress;
    }, [user]);

    // Initialize user data when component mounts or userId changes
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        // console.log('useEffect triggered, userId:', userId, 'initialized:', initialized, 'loading:', loading);
        if (userId && !initialized && !loading) {
            fetchUser();
        }
    }, [fetchUser, initialized, loading]);

    // Listen for storage changes (for multi-tab sync)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userId') {
                if (e.newValue) {
                    // User logged in
                    fetchUser();
                } else {
                    // User logged out
                    clearUser();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchUser, clearUser]);

    // Context value
    const contextValue = {
        // State
        user,
        loading,
        error,
        initialized,

        // Actions
        fetchUser,
        refreshUser,
        updateUser,
        updateUserAddress,
        updateUserWallet,
        updateWalletBalance,
        clearUser,

        // Computed values
        getWalletBalance,
        getUserFullName,
        getPrimaryAddress,
        hasCompleteProfile,

        // User properties (for easier access)
        userId: user?._id || null,
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        mobileNo: user?.mobile_no || '',
        dateOfBirth: user?.date_of_birth || '',
        gender: user?.gender || '',
        address: user?.address || [],
        wallet: user?.wallet || [],
        walletBalance: getWalletBalance(),
        fullName: getUserFullName(),
        primaryAddress: getPrimaryAddress(),
        isProfileComplete: hasCompleteProfile()
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;