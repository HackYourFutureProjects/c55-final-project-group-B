import type { Job } from "./types";

export type LocationOption = {
  label: string;
  value: string;
  kind: "city" | "province";
};

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

export function buildLocationOptions(
  cities: string[],
  provinces: string[],
): LocationOption[] {
  const cityOptions = cities.map(
    (city): LocationOption => ({
      label: city,
      value: `city:${city}`,
      kind: "city",
    }),
  );
  const provinceOptions = provinces.map(
    (province): LocationOption => ({
      label: province,
      value: `province:${province}`,
      kind: "province",
    }),
  );

  return [...cityOptions, ...provinceOptions];
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

export function getLocationSuggestions(
  options: LocationOption[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];
  const matches = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedQuery),
  );

  const beginsWith = (option: LocationOption) =>
    option.label.toLowerCase().startsWith(normalizedQuery);
  const prefixMatches = matches.filter(beginsWith);
  const otherMatches = matches.filter((option) => !beginsWith(option));

  return [...prefixMatches, ...otherMatches].slice(0, 8);
}
