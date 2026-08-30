export function formatPostedDateShort(created: string | null): string | null {
  if (!created) return null;

  const date = new Date(created);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d";
  if (diffDays < 30) return `${diffDays}d`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1m";
  if (diffMonths < 12) return `${diffMonths}m`;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return "1y";
  return `${diffYears}y`;
}
