import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
            width={300}
            height={300}
          />
          <div style={{ 
            fontSize: 60, 
            marginTop: 30,
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            BitApe
          </div>
          <div style={{ 
            fontSize: 30, 
            marginTop: 15,
            opacity: 0.8,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            Mine $BIT with your virtual mining facility
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