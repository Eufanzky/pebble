import { AmbientBackground } from '@/shared/ui';
import { TodayView } from '@/features/tasks';

export default function TodayPage() {
  return (
    <>
      <AmbientBackground mood="today" />
      <div className="relative z-[1] p-10 px-12">
        <TodayView />
      </div>
    </>
  );
}
