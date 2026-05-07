'use client';

import { useEffect } from 'react';

import { BASE_SERVER_URL } from '@/lib/constants';

const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const pingBackend = async (): Promise<void> => {
  try {
    await fetch(BASE_SERVER_URL, {
      method: 'GET',
      cache: 'no-store'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Render keepalive ping failed:', error);
    }
  }
};

const RenderKeepalive = () => {
  useEffect(() => {
    pingBackend();
    const intervalId = setInterval(pingBackend, KEEPALIVE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null;
};

export { RenderKeepalive };
