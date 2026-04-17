export const CAMPAIGN_CONFIG = {
  startDate: new Date("2026-03-15T00:00:00+01:00"),
  endDate: new Date("2026-05-15T23:59:59+02:00"),
  launchDate: new Date("2026-05-15T22:59:00Z"),
};

export const getCampaignStatus = (): "upcoming" | "active" | "ended" => {
  const now = new Date();
  if (now < CAMPAIGN_CONFIG.startDate) return "upcoming";
  if (now > CAMPAIGN_CONFIG.endDate) return "ended";
  return "active";
};

export const isCampaignActive = () => getCampaignStatus() === "active";
