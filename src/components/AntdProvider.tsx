'use client';

import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme, App } from 'antd';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function AntdThemedConfig({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  useEffect(() => {
    // Intercept browser extension unhandled rejections (e.g., Grammarly, MetaMask, Loom)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason instanceof Event ||
        (event.reason && typeof event.reason === 'object' && 'type' in event.reason)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark
          ? {
              colorPrimary: '#FFD700',
              colorInfo: '#FFD700',
              colorSuccess: '#10B981',
              colorWarning: '#F59E0B',
              colorError: '#EF4444',
              colorBgBase: '#0A0A0A',
              colorBgContainer: '#141414',
              colorBgElevated: '#1F1F1F',
              colorBorder: '#262626',
              colorBorderSecondary: '#1F1F1F',
              colorText: '#F5F5F5',
              colorTextSecondary: '#A3A3A3',
              fontFamily: 'var(--font-body)',
              borderRadius: 6,
            }
          : {
              colorPrimary: '#D97706', // Warm amber-gold with high contrast on white/gray
              colorInfo: '#2563EB',
              colorSuccess: '#059669',
              colorWarning: '#D97706',
              colorError: '#DC2626',
              colorBgBase: '#F8FAFC',
              colorBgContainer: '#FFFFFF',
              colorBgElevated: '#FFFFFF',
              colorBorder: '#E2E8F0',
              colorBorderSecondary: '#F1F5F9',
              colorText: '#0F172A',
              colorTextSecondary: '#64748B',
              fontFamily: 'var(--font-body)',
              borderRadius: 6,
            },
        components: {
          Button: {
            colorPrimary: isDark ? '#FFD700' : '#D97706',
            colorPrimaryHover: isDark ? '#FACC15' : '#B45309',
            colorPrimaryActive: isDark ? '#EAB308' : '#92400E',
            primaryColor: isDark ? '#0A0A0A' : '#FFFFFF',
            fontWeight: 600,
            controlHeight: 40,
          },
          Table: {
            colorBgContainer: isDark ? '#141414' : '#FFFFFF',
            headerBg: isDark ? '#181818' : '#F8FAFC',
            headerColor: isDark ? '#A3A3A3' : '#475569',
            borderColor: isDark ? '#262626' : '#E2E8F0',
            rowHoverBg: isDark ? '#1F1F1F' : '#F1F5F9',
            cellPaddingBlock: 12,
            cellPaddingInline: 12,
          },
          Drawer: {
            colorBgElevated: isDark ? '#141414' : '#FFFFFF',
          },
          Card: {
            colorBgContainer: isDark ? '#141414' : '#FFFFFF',
            colorBorderSecondary: isDark ? '#262626' : '#E2E8F0',
          },
          Input: {
            colorBgContainer: isDark ? '#181818' : '#FFFFFF',
            colorBorder: isDark ? '#262626' : '#E2E8F0',
            activeBorderColor: isDark ? '#383838' : '#CBD5E1',
            hoverBorderColor: isDark ? '#383838' : '#CBD5E1',
            activeShadow: 'none',
          },
          Select: {
            colorBgContainer: isDark ? '#181818' : '#FFFFFF',
            colorBorder: isDark ? '#262626' : '#E2E8F0',
            colorPrimary: isDark ? '#383838' : '#CBD5E1',
            colorPrimaryHover: isDark ? '#383838' : '#CBD5E1',
          },
          Tabs: {
            itemSelectedColor: isDark ? '#FFD700' : '#D97706',
            inkBarColor: isDark ? '#FFD700' : '#D97706',
          },
          Switch: {
            colorPrimary: isDark ? '#FFD700' : '#D97706',
          },
        },
      }}
    >
      <App className="min-h-full">
        {children}
      </App>
    </ConfigProvider>
  );
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <AntdThemedConfig>{children}</AntdThemedConfig>
      </ThemeProvider>
    </AntdRegistry>
  );
}
