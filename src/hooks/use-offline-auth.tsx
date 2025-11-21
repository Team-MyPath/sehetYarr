'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useOnlineStatus } from './use-online-status';

/**
 * Cached user data structure
 */
interface CachedUserData {
  id: string;
  fullName: string | null;
  email: string;
  imageUrl: string;
  role: string;
  publicMetadata: Record<string, any>;
  timestamp: number;
}

const AUTH_CACHE_KEY = 'sehetyar_offline_auth';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hook that provides user authentication data with offline support
 * Caches Clerk user data in localStorage and serves it when offline
 */
export function useOfflineAuth() {
  const { user, isLoaded } = useUser();
  const isOnline = useOnlineStatus();
  const [cachedUser, setCachedUser] = useState<CachedUserData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load cached user on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CachedUserData;
        
        // Check if cache is still valid
        const now = Date.now();
        if (now - parsed.timestamp < CACHE_DURATION) {
          setCachedUser(parsed);
        } else {
          // Cache expired, remove it
          localStorage.removeItem(AUTH_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('[OfflineAuth] Failed to load cached user:', error);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Update cache when user changes (online)
  useEffect(() => {
    if (isOnline && isLoaded && user) {
      try {
        const userToCache: CachedUserData = {
          id: user.id,
          fullName: user.fullName,
          email: user.emailAddresses[0]?.emailAddress || '',
          imageUrl: user.imageUrl,
          role: (user.publicMetadata?.role as string) || 'patient',
          publicMetadata: user.publicMetadata || {},
          timestamp: Date.now(),
        };

        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(userToCache));
        setCachedUser(userToCache);
      } catch (error) {
        console.error('[OfflineAuth] Failed to cache user:', error);
      }
    }
  }, [user, isLoaded, isOnline]);

  // Determine which user data to return
  const effectiveUser = isOnline ? user : (cachedUser ? {
    id: cachedUser.id,
    fullName: cachedUser.fullName,
    emailAddresses: [{ emailAddress: cachedUser.email }],
    imageUrl: cachedUser.imageUrl,
    publicMetadata: cachedUser.publicMetadata,
  } : null);

  return {
    user: effectiveUser,
    isLoaded: isOnline ? isLoaded : isReady,
    isOffline: !isOnline,
    isCached: !isOnline && !!cachedUser,
  };
}

/**
 * Clear cached authentication data
 * Useful for logout or when user wants to clear offline data
 */
export function clearOfflineAuth() {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
    console.log('[OfflineAuth] Cached user data cleared');
  } catch (error) {
    console.error('[OfflineAuth] Failed to clear cached user:', error);
  }
}

