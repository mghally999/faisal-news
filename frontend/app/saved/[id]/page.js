import ProtectedClient from '@/components/ProtectedClient';
import SavedDetail from './SavedDetail';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit saved article',
  description: 'Edit your notes on a saved Faisal News story.',
  alternates: { canonical: '/saved' },
  robots: { index: false, follow: false }
};

export default async function SavedDetailPage({ params }) {
  const p = await params;
  return (
    <ProtectedClient>
      <SavedDetail id={p.id} />
    </ProtectedClient>
  );
}
