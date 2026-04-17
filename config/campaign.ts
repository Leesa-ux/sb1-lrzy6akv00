export const CAMPAIGN_CONFIG = {
  startDate: new Date("2026-04-18T00:00:00+02:00"),
  endDate: new Date("2026-06-01T23:59:59+02:00"),
  launchDate: new Date("2026-06-01T23:59:59+02:00"),
  prizeDate: new Date("2026-06-29T00:00:00+02:00"), // 4 semaines après la fin
};

export const getCampaignStatus = (): "upcoming" | "active" | "ended" => {
  const now = new Date();
  if (now < CAMPAIGN_CONFIG.startDate) return "upcoming";
  if (now > CAMPAIGN_CONFIG.endDate) return "ended";
  return "active";
};

export const isCampaignActive = () => getCampaignStatus() === "active";
