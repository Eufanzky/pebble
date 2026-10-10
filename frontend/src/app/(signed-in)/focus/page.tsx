import { FocusView } from '@/features/focus';
import { AmbientBackground } from '@/shared/ui';

/** `/focus`, or `/focus?task=…&step=…` for a session on one step (9.2). */
export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { task, step } = await searchParams;
  return (
    <>
      <AmbientBackground mood="focus" />
      <div className="relative z-[1]">
        <FocusView taskId={typeof task === 'string' ? task : undefined} stepId={typeof step === 'string' ? step : undefined} />
      </div>
    </>
  );
}
