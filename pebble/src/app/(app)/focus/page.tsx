import { FocusView } from '@/features/focus';
import { AmbientBackground } from '@/shared/ui';

export default function FocusPage() {
  return (
    <>
      <AmbientBackground mood="focus" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        <FocusView />
      </div>
    </>
  );
}
