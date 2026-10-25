'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  emptyAdminNotificationsSummary,
  type AdminNotificationsSummary,
} from '@/lib/utils/admin-notifications';

interface AdminNotificationsContextValue {
  summary: AdminNotificationsSummary;
  loading: boolean;
  refresh: () => Promise<AdminNotificationsSummary | null>;
}

const AdminNotificationsContext =
  createContext<AdminNotificationsContextValue | null>(null);

export function AdminNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [summary, setSummary] = useState<AdminNotificationsSummary>(
    emptyAdminNotificationsSummary
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications/summary', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to load admin notifications (${res.status})`);
      }

      const data = (await res.json()) as AdminNotificationsSummary;
      setSummary(data);
      return data;
    } catch (error) {
      console.error('[AdminNotificationsProvider] Failed to refresh', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, 30_000);

    const handleFocus = () => {
      void refresh();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      summary,
      loading,
      refresh,
    }),
    [summary, loading, refresh]
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);

  if (!context) {
    throw new Error(
      'useAdminNotifications must be used within AdminNotificationsProvider'
    );
  }

  return context;
}
