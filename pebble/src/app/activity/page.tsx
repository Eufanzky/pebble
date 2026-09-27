import { ActivityView } from '@/features/activity';
import ScreenBackground from '@/shared/ui/ScreenBackground';

export default function ActivityPage() {
  return (
    <>
      <ScreenBackground scene="rooftop" />
      <div className="relative z-[1] p-10 px-12">
        <ActivityView />
      </div>
    </>
  );
}
