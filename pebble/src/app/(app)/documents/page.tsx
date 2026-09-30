import ScreenBackground from '@/shared/ui/ScreenBackground';
import { DocumentsView } from '@/features/documents';

export default function DocumentsPage() {
  return (
    <>
      <ScreenBackground scene="library" />
      <div className="relative z-[1] p-10 px-12">
        <DocumentsView />
      </div>
    </>
  );
}
