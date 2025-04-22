import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#001B44',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFD700',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <img
            src="https://bitape.org/bitape.png"
            alt="BitApe Logo"
            width={400}
            height={400}
          />
          <div style={{ 
            fontSize: 80, 
            marginTop: 40,
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            BitApe
          </div>
          <div style={{ 
            fontSize: 40, 
            marginTop: 20,
            opacity: 0.8,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            A Peer-to-Peer Electronic Ape Cash System
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 