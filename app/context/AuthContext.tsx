import {authenticateOAuth, login, setToken} from '@/services/api';
import {useRouter} from 'expo-router';
import React, { createContext, useState } from 'react';
import { useNotifications } from './NotificationsContext';
import Toast from "react-native-toast-message";
import { setUserId, resetAnalytics, logEvent, AnalyticsEvents } from '@/services/analytics';


interface UserDataModel {
  email: string;
  password: string;
  user: {
    name: string;
    surname: string;
    username: string;
    profile_picture: string;
    birthdate: Date | string; // You can adjust the type here
    type: 'user' | 'admin' | 'operator';
  };
  contacts: {
    phone: string;
    address: string;
  };
  settings: {
    currency: string;
    preferred_language: string;
    timezone: string;
  };
  finances: {
    stripe_customer_id: string;
    stripe_payment_method: string;
    stripe_payment_methods: string[];
    billing_address: string;

    subscription_plan: string;
    subscription_expiry: Date
  };
  booleans: {
    isVerified: boolean;
    isAdmin: boolean;
  };
  tokens: {
    verificationToken?: string;
    passwordResetToken?: string;
  };
  notifications: {
    expo_push_token?: string;
  };
  createdAt?: Date
}


export const AuthContext = createContext({
    role: null as string | null,
    userData: null as UserDataModel | null,
    handleInitialAuthentication: async () => { },
    sessionAuthentication: async () => { },
    sessionLogin: async (email: string, password: string) => false,
    logout: () => { },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter()
  const { initializeNotifications } = useNotifications()

  const [role, setRole] = useState(null)
  const [userData, setUserData] = useState(null)


  const handleInitialAuthentication = async () => {
    const call = await authenticateOAuth();

    if (call.success) {
      //Save user data
      setUserData(call.data)
      setRole(call.data.user.type)
      
      // Set user ID for analytics
      if (call.data?.user?.username) {
        setUserId(call.data.user.username);
      }
      
      initializeNotifications()
    }
    // Don't redirect - let the app navigate naturally
  };
  const sessionAuthentication = async () => {
    const call = await authenticateOAuth();
    if (!call.success) {
      router.replace('/auth/login')
      return
    }

    setUserData(call.data)
    setRole(call.data.user.type)
    await initializeNotifications()
  };


  const sessionLogin = async (email: string, password: string): Promise<boolean> => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Inserire email e password',
            });
            return false;
        }

        const call = await login(email, password);
        console.log(call)
        
        if (!call.success) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Email o password errati',
            });
            return false;
        }

        await setToken(call.token);
        setUserData(call.account);
        setRole(call.account?.user?.type || null);
        
        // Set user ID for analytics
        if (call.account?.user?.username) {
          setUserId(call.account.user.username);
        }
        
        await initializeNotifications();
        
        return true;
    };

    const logout = () => {
        // Reset analytics and clear user ID
        resetAnalytics();
        setUserId(null);
        logEvent(AnalyticsEvents.LOGOUT);
        
        setUserData(null);
        setRole(null);
    };

    return (
    <AuthContext.Provider value={{ handleInitialAuthentication, sessionAuthentication, role, userData, sessionLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};