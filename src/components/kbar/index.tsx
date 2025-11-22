'use client';
import { navItems } from '@/constants/data';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useI18n } from '@/providers/i18n-provider';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return navItems.flatMap((navItem) => {
      // Helper to translate title
      const getTranslatedTitle = (title: string) => {
        const key = title.toLowerCase().replace(/\s+/g, '_');
        return t(`common.${key}`);
      };

      const translatedTitle = getTranslatedTitle(navItem.title);

      // Only include base action if the navItem has a real URL and is not just a container
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: translatedTitle,
              shortcut: navItem.shortcut,
              keywords: translatedTitle.toLowerCase(),
              section: t('common.navigation'),
              subtitle: `${t('common.go_to')} ${translatedTitle}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      // Map child items into actions
      const childActions =
        navItem.items?.map((childItem) => {
            const translatedChildTitle = getTranslatedTitle(childItem.title);
            return {
              id: `${childItem.title.toLowerCase()}Action`,
              name: translatedChildTitle,
              shortcut: childItem.shortcut,
              keywords: translatedChildTitle.toLowerCase(),
              section: translatedTitle,
              subtitle: `${t('common.go_to')} ${translatedChildTitle}`,
              perform: () => navigateTo(childItem.url)
            };
        }) ?? [];

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, t]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  const { t } = useI18n();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch 
                defaultPlaceholder={t('common.search_placeholder')}
                className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' 
              />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
