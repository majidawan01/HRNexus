import Layout from '../components/Layout';

// Abhi sirf placeholder, asli dashboard (stats, charts, companies table) agle hisse mein aayega
export default function SuperadminDashboard() {
  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <p className="font-mono text-xs text-ash uppercase tracking-widest mb-1">Platform</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Companies</h1>
        <p className="mt-4 text-sm font-body text-ink/70">The superadmin dashboard is coming in a later step.</p>
      </div>
    </Layout>
  );
}
