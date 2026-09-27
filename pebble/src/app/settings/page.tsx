import { SettingsView } from '@/features/settings';
import ScreenBackground from '@/shared/ui/ScreenBackground';

export default function SettingsPage() {
  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        <SettingsView />
      </div>
    </>
  );
}
