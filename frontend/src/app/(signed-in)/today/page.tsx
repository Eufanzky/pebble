import { AmbientBackground } from '@/shared/ui';
import { ProgressSoFar } from '@/features/stats';
import { TodayView } from '@/features/tasks';

export default function TodayPage() {
  return (
    <>
      <AmbientBackground mood="today" />
      <div className="relative z-[1]">
        <TodayView progress={<ProgressSoFar />} />
      </div>
    </>
  );
}
