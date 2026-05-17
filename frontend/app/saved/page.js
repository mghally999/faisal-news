import ProtectedClient from '@/components/ProtectedClient';
import SavedList from './SavedList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your library',
  description: 'Your personal library of saved Faisal News stories.',
  alternates: { canonical: '/saved' },
  robots: { index: false, follow: false }
};

export default function SavedPage() {
  return (
    <ProtectedClient>
      <SavedList />
    </ProtectedClient>
  );
}
