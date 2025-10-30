import { REWARDS } from "./rewards-data";

export default function RewardsTimeline() {
  return (
    <div className="relative w-full">
      <div className="hidden md:block absolute top-6 left-0 w-full h-[2px] bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F]" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
        {REWARDS.map((r, idx) => (
          <div key={idx} className="relative flex flex-col items-center text-center">
            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border-2 border-zinc-700 bg-[#0f0f0f] text-2xl z-10">
              {r.emoji}
            </div>
            <div className="mt-4 md:mt-6 rounded-2xl border border-zinc-800 bg-[#0f0f0f] p-4 w-full">
              <h4 className="font-semibold text-base sm:text-lg">{r.title}</h4>
              <p className="mt-2 text-sm text-zinc-200">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
