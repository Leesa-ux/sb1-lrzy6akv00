'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShareNetwork, Trophy, House } from '@phosphor-icons/react';

function GlowNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Preserve URL params for success page
  const successParams = searchParams.toString();
  const successHref = successParams ? `/success?${successParams}` : '/success';

  const tabs = [
    {
      label: 'Mon lien',
      icon: ShareNetwork,
      href: successHref,
      isActive: pathname === '/success',
    },
    {
      label: 'Classement',
      icon: Trophy,
      href: '/leaderboard',
      isActive: pathname === '/leaderboard',
    },
    {
      label: 'Accueil',
      icon: House,
      href: '/',
      isActive: pathname === '/',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-white/10 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-6 transition-colors ${
                tab.isActive ? 'text-purple-400' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon weight="thin" size={24} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function GlowNav() {
  return (
    <Suspense fallback={null}>
      <GlowNavInner />
    </Suspense>
  );
}
