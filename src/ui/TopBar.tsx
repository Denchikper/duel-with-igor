export default function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onBack}
        aria-label="Назад"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--accent)',
          fontSize: 18,
          lineHeight: 1,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        ‹
      </button>
      <span className="eyebrow" style={{ letterSpacing: '0.2em' }}>
        {title}
      </span>
    </div>
  );
}
