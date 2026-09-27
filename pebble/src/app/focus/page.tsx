import { FocusView } from '@/features/focus';
import ScreenBackground from '@/shared/ui/ScreenBackground';

export default function FocusPage() {
  return (
    <>
      <ScreenBackground scene="study" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        <FocusView />
      </div>
    </>
  );
}
