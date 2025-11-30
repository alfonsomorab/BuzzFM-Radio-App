export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', marginBottom: '1rem' }}>
          Radio Streaming Platform
        </h1>
        <p style={{ color: '#e2e8f0', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Backend API and Management Dashboard
        </p>
        <div className="card">
          <h2 style={{ color: '#1a202c' }}>
            Phase 1: Backend Foundation ✅
          </h2>
          <ul style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <li>✅ Next.js 14+ with TypeScript initialized</li>
            <li>✅ Drizzle ORM configured with PostgreSQL</li>
            <li>✅ Database schema created (6 tables)</li>
            <li>✅ Environment variables setup</li>
            <li>✅ Seed script with sample data</li>
            <li>⏳ Ready for database migration</li>
          </ul>
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              <strong>Next Steps:</strong> Run <code>npm run db:push</code> to create database tables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
