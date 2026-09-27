import ScreenBackground from '@/shared/ui/ScreenBackground';
import { TodayView } from '@/features/tasks';

export default function TodayPage() {
  return (
    <>
      <ScreenBackground scene="cafe" />
      <div className="relative z-[1] p-10 px-12">
        <TodayView />
      </div>
    </>
  );
}
