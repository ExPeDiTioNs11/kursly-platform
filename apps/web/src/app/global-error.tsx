'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bir şeyler ters gitti</h1>
        <p style={{ color: '#6b7280', maxWidth: '28rem' }}>
          Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar dene.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: '0.5rem',
            background: '#4f46e5',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
