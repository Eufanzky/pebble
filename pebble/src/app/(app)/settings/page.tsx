import { AccountSection } from '@/features/auth';
import { auth } from '@/features/auth/server';
import { SettingsView } from '@/features/settings';
import ScreenBackground from '@/shared/ui/ScreenBackground';

export default async function SettingsPage() {
  const user = (await auth())?.user;
  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        <SettingsView />
        {user && <AccountSection name={user.name ?? user.id} userId={user.id} />}
      </div>
    </>
  );
}
