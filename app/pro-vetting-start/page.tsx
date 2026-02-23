"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProVettingStartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pro/apply");
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Redirection...</h1>
      <p>Si vous n'êtes pas redirigé automatiquement, <a href="/pro/apply" style={{ color: '#0070f3', textDecoration: 'underline' }}>cliquez ici</a>.</p>
    </div>
  );
}
