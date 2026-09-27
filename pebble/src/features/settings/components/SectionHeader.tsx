export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
    </div>
  );
}
