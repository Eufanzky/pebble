import { StatsView } from '@/features/stats';
import { AmbientBackground } from '@/shared/ui';

export default function StatsPage() {
  return (
    <>
      <AmbientBackground mood="activity" />
      <div className="relative z-[1]">
        <StatsView />
      </div>
    </>
  );
}
