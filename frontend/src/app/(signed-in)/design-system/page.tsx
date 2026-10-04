import { notFound } from 'next/navigation';
import { DesignSystemPreview } from '@/shared/ui';

// Every token and primitive (roadmap 5.1), for building screens. Development only.
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DesignSystemPreview />;
}
