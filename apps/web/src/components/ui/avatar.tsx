interface AvatarProps {
  name: string;
  /** URL externa opcional; sem ela, mostra iniciais sobre cor derivada do nome. */
  src?: string | null;
  /** Diâmetro em pixels. */
  size?: number;
}

// Paleta sóbria, alinhada à direção "luz do dia, foco calmo".
const COLORS = ['#0e7490', '#15803d', '#b45309', '#7c3aed', '#be123c', '#0369a1'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]![0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

/** Cor determinística a partir do nome (mesmo nome → mesma cor). */
function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length]!;
}

/** Avatar por iniciais (ou imagem, quando há URL). */
export function Avatar({ name, src, size = 36 }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        backgroundColor: colorFor(name),
      }}
    >
      {initials(name)}
    </span>
  );
}
