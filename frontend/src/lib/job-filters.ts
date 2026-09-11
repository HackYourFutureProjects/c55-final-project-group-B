import type { Job } from "./types";

export function parseLocation(location?: string): {
  city?: string;
  province?: string;
} {
  if (!location) {
    return {};
  }
  if (location.startsWith("city:")) {
    return { city: location.slice("city:".length) };
  }
  if (location.startsWith("province:")) {
    return { province: location.slice("province:".length) };
  }
  return {};
}

export function filterJobs(
  jobs: Job[],
  q?: string,
  city?: string,
  province?: string,
): Job[] {
  const query = q?.toLowerCase();
  return jobs.filter((job) => {
    if (query) {
      const searchableText = `${job.title} ${job.companyName}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    if (city && job.locationCity !== city) return false;
    if (province && job.locationProvince !== province) return false;
    return true;
  });
}

export function getSuggestions(titles: string[], query: string): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];
  return titles
    .filter((title) => title.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);
}
