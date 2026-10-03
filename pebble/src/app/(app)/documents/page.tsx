import { AmbientBackground } from '@/shared/ui';
import { DocumentsView } from '@/features/documents';

export default function DocumentsPage() {
  return (
    <>
      <AmbientBackground mood="documents" />
      <div className="relative z-[1]">
        <DocumentsView />
      </div>
    </>
  );
}
