'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useI18n } from '@/providers/i18n-provider';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ]
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const { t } = useI18n();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname].map(item => ({
        ...item,
        title: t(`common.${item.title.toLowerCase().replace(/\s+/g, '_')}`)
      }));
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const key = segment.toLowerCase().replace(/-/g, '_');
      const translatedTitle = t(`common.${key}`);
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      return {
        title: translatedTitle !== `common.${key}` ? translatedTitle : title,
        link: path
      };
    });
  }, [pathname, t]);

  return breadcrumbs;
}
