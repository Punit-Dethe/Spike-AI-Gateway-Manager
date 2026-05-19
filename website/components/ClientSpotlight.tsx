'use client';

import dynamic from 'next/dynamic';

const CursorSpotlight = dynamic(() => import('./CursorSpotlight'), {
  ssr: false,
});

export default function ClientSpotlight() {
  return <CursorSpotlight />;
}
