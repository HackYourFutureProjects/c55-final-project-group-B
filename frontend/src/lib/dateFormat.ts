export function formatPostedDate(created: string | null): string | null {
  if (!created) {
    return null;
  }

  const date = new Date(created);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
