import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <div>
        <p style={{ color: 'var(--gold)', letterSpacing: '0.16em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 12 }}>
          404 · Not found
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: '0 0 16px' }}>This page wandered off.</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 28px' }}>
          The story you were looking for has moved or never existed. Head back to the front page.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '12px 22px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
          color: 'var(--bg)',
          fontWeight: 700
        }}>Back to home</Link>
      </div>
    </section>
  );
}
