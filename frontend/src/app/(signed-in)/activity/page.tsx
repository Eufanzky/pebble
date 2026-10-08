import { ActivityView } from '@/features/activity';
import { ProgressSoFar } from '@/features/stats';
import { AmbientBackground } from '@/shared/ui';

export default function ActivityPage() {
  return (
    <>
      <AmbientBackground mood="activity" />
      <div className="relative z-[1]">
        <ActivityView progress={<ProgressSoFar />} />
      </div>
    </>
  );
}
