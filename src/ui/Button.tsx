import type { ButtonProps } from '../contracts';

export default function Button({ children, variant, disabled, onClick }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px 18px',
        borderRadius: 12,
        border: primary ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: primary ? 'var(--accent)' : 'transparent',
        color: primary ? '#0a0d08' : 'var(--text)',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: primary ? '0.01em' : 0,
        fontFamily: primary ? 'var(--mono)' : 'var(--sans)',
        textTransform: primary ? 'uppercase' : 'none',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform 0.08s ease, box-shadow 0.2s ease',
        boxShadow: primary ? '0 0 14px rgba(180,255,57,0.25)' : 'none',
      }}
      onPointerDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
}
