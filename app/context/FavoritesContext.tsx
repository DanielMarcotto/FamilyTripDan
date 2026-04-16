import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite, checkFavorite, getFavorites } from '@/services/api';

interface FavoritesContextType {
  favorites: Set<string>; // Set of POI IDs that are favorited
  isFavorite: (poiId: string) => boolean;
  toggleFavorite: (poiId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  isFavorite: () => false,
  toggleFavorite: async () => false,
  refreshFavorites: async () => {},
  isLoading: false,
});

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const { userData } = useContext(AuthContext);
  const isLoggedIn = !!userData;
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites on mount and when user logs in/out
  useEffect(() => {
    if (isLoggedIn) {
      refreshFavorites();
    } else {
      // Clear favorites when user logs out
      setFavorites(new Set());
    }
  }, [isLoggedIn]);

  const refreshFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await getFavorites();
      if (response.success && response.items) {
        const favoriteIds = new Set(response.items.map((item: any) => item.id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const isFavorite = useCallback((poiId: string): boolean => {
    return favorites.has(poiId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (poiId: string): Promise<boolean> => {
    if (!isLoggedIn || !poiId) {
      return false;
    }

    const wasFavorite = favorites.has(poiId);
    
    // Optimistic update
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (wasFavorite) {
        newSet.delete(poiId);
      } else {
        newSet.add(poiId);
      }
      return newSet;
    });

    try {
      let response;
      if (wasFavorite) {
        response = await apiRemoveFavorite(poiId);
      } else {
        response = await apiAddFavorite(poiId);
      }

      if (response.success) {
        return true;
      } else {
        // Revert on error
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (wasFavorite) {
            newSet.add(poiId);
          } else {
            newSet.delete(poiId);
          }
          return newSet;
        });
        return false;
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (wasFavorite) {
          newSet.add(poiId);
        } else {
          newSet.delete(poiId);
        }
        return newSet;
      });
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [isLoggedIn, favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

