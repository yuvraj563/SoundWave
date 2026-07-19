const EmptyState = ({ icon = '🎵', title = 'Nothing here yet', subtitle = '' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 12, padding: '64px 24px', textAlign: 'center',
  }}>
    <span style={{ fontSize: 56, lineHeight: 1 }}>{icon}</span>
    <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 20 }}>{title}</p>
    {subtitle && (
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, maxWidth: 320 }}>{subtitle}</p>
    )}
  </div>
)

export default EmptyState
