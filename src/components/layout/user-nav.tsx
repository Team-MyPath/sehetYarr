'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useOfflineAuth } from '@/hooks/use-offline-auth';
import { useI18n } from '@/providers/i18n-provider';
export function UserNav() {
  const { t } = useI18n();
  const { user, isOffline, isCached } = useOfflineAuth();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/auth/sign-in' });
  };
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <UserAvatarProfile user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <div className='flex items-center gap-2'>
                <p className='text-sm leading-none font-medium'>
                  {user.fullName}
                </p>
                {isCached && (
                  <span className='text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'>
                    {t('common.offline')}
                  </span>
                )}
              </div>
              <p className='text-muted-foreground text-xs leading-none'>
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              {t('common.profile')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            {t('common.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
