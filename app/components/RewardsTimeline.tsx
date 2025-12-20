import { REWARDS } from "./rewards-data";

export default function RewardsTimeline() {
  return (
    <div className="relative w-full">
      <div className="hidden md:block absolute top-6 left-0 w-full h-[2px] bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F]" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
        {REWARDS.map((r, idx) => (
          <div key={idx} className="relative flex flex-col items-center text-center">
            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border-2 border-zinc-700 bg-[#0f0f0f] text-2xl z-10">
              {r.icon}
            </div>
            <div className="mt-4 md:mt-6 rounded-2xl border border-zinc-800 bg-[#0f0f0f] p-5 w-full hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl md:hidden">{r.icon}</span>
                <div className="text-center">
                  <h4 className="font-bold text-base sm:text-lg text-white">{r.tierName}</h4>
                  <p className="text-xs text-zinc-400 font-medium">{r.points}</p>
                </div>
              </div>

              <div className="mb-4 pb-3 border-b border-zinc-800">
                <p className="text-sm font-medium text-[#92D14F] italic">{r.positioning}</p>
              </div>

              <ul className="space-y-2 text-left">
                {r.benefits.map((benefit, bidx) => (
                  <li key={bidx} className="flex items-start gap-2 text-sm text-zinc-200">
                    <span className="text-[#8E58C7] mt-0.5 flex-shrink-0">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
