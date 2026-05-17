import HomeRedirect from './HomeRedirect';

export const metadata = {
  title: 'Welcome',
  description: 'Sign in to Faisal News to access curated headlines and your saved-article library.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export default function HomePage() {
  return <HomeRedirect />;
}
