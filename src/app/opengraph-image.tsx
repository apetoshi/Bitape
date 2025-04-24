import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'BitApe Mining';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  // Font
  const interSemiBold = await fetch(
    new URL('./fonts/inter-semi-bold.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: '#001420',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(#FFDD0015 1px, transparent 1px), linear-gradient(to right, #FFDD0015 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#FFDD00',
            color: '#001420',
            fontSize: 50,
            fontWeight: 'bold',
            fontFamily: 'Inter',
          }}
        >
          BIT
        </div>

        {/* Title */}
        <div
          style={{
            color: '#FFDD00',
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            fontFamily: 'Inter',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          BitApe Mining
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: 'white',
            fontSize: 28,
            lineHeight: 1.4,
            fontFamily: 'Inter',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Build your virtual mining facility on ApeChain and earn BIT tokens
        </div>

        {/* Call to action */}
        <div
          style={{
            marginTop: 30,
            backgroundColor: '#FFDD00',
            borderRadius: 8,
            padding: '10px 20px',
            color: '#001420',
            fontSize: 24,
            fontWeight: 600,
            fontFamily: 'Inter',
          }}
        >
          Start Mining Now
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: interSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
} 