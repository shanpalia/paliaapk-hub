'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function CapacitorBackHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let subscription: { remove: () => Promise<void> } | undefined;
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) window.history.back();
      else App.exitApp();
    }).then(handle => { subscription = handle; });
    return () => { subscription?.remove(); };
  }, []);
  return null;
}
