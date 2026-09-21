export type NetworkId = "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";

export const NETWORKS: Record<NetworkId, { label: string; short: string; color: string }> = {
  instagram: { label: "Instagram", short: "IG", color: "#C1387D" },
  facebook: { label: "Facebook", short: "FB", color: "#1877F2" },
  tiktok: { label: "TikTok", short: "TT", color: "#121413" },
  linkedin: { label: "LinkedIn", short: "IN", color: "#0A66C2" },
  youtube: { label: "YouTube", short: "YT", color: "#FF0000" },
};

export const NETWORK_PRIORITY: NetworkId[] = [
  "instagram",
  "facebook",
  "tiktok",
  "linkedin",
  "youtube",
];
