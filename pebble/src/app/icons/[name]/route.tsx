import { ImageResponse } from 'next/og';

// App icons (roadmap 5.8): Pebble's face, drawn the way the character is (rounded
// shapes, no artwork), rendered to PNG at build time. The file names carry a
// dot, so src/proxy.ts lets them through without sign-in.
export const dynamic = 'force-static';

const ICONS: Record<string, { size: number; maskable: boolean }> = {
  'pebble-180.png': { size: 180, maskable: false },
  'pebble-192.png': { size: 192, maskable: false },
  'pebble-512.png': { size: 512, maskable: false },
  'pebble-maskable-512.png': { size: 512, maskable: true },
};

const BACKGROUND = '#0F0D0A';
const LAVENDER = '#C4B5D4';
const EYE = '#2A2A2E';

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

/** Pebble's head: two ears, two eyes, a little nose, filling `scale` of the square. */
function Face({ size, scale }: { size: number; scale: number }) {
  const head = size * scale;
  const ear = head * 0.28;
  const eye = head * 0.11;
  return (
    <div style={{ position: 'relative', width: head, height: head * 1.05, display: 'flex' }}>
      {[0.13, 0.59].map((left) => (
        <div
          key={left}
          style={{
            position: 'absolute',
            top: head * 0.05,
            left: head * left,
            width: ear,
            height: ear,
            background: LAVENDER,
            borderRadius: ear * 0.12,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: head,
          height: head * 0.86,
          borderRadius: '50%',
          background: LAVENDER,
          display: 'flex',
        }}
      >
        {[0.3, 0.6].map((left) => (
          <div
            key={left}
            style={{
              position: 'absolute',
              top: head * 0.36,
              left: head * left,
              width: eye,
              height: eye,
              borderRadius: '50%',
              background: EYE,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: head * 0.52,
            left: head * 0.47,
            width: head * 0.06,
            height: head * 0.04,
            borderRadius: '50%',
            background: '#E8A0B0',
          }}
        />
      </div>
    </div>
  );
}

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const icon = ICONS[(await params).name];
  if (!icon) return new Response('Not found', { status: 404 });
  const { size, maskable } = icon;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BACKGROUND,
          // A maskable icon keeps Pebble inside the centre safe zone
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <Face size={size} scale={maskable ? 0.5 : 0.66} />
      </div>
    ),
    { width: size, height: size },
  );
}
