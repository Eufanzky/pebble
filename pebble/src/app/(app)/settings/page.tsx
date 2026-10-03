import { AccountSection } from '@/features/auth';
import { auth } from '@/features/auth/server';
import { SettingsView } from '@/features/settings';
import { AmbientBackground } from '@/shared/ui';

export default async function SettingsPage() {
  const user = (await auth())?.user;
  return (
    <>
      <AmbientBackground mood="settings" />
      <div className="relative z-[1]">
        <SettingsView account={user && <AccountSection name={user.name ?? user.id} userId={user.id} />} />
      </div>
    </>
  );
}
