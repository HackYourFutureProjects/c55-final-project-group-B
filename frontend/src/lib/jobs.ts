import { BACKEND_API_URL } from "./config";
import { Job } from "./types";

export type JobFilters = {
  search?: string;
  city?: string;
  province?: string;
  page: number;
};

type Locations = {
  cities: string[];
  provinces: string[];
};

export const JOBS_PAGE_SIZE = 10;

const formatCount = new Intl.NumberFormat("en-NL");

export function buildJobsQuery(filters: JobFilters): string {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.city) {
    params.set("city", filters.city);
  }

  if (filters.province) {
    params.set("province", filters.province);
  }

  params.set("page", String(filters.page));
  params.set("size", String(JOBS_PAGE_SIZE));

  return params.toString();
}

export async function getJobCount(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/jobs?size=1`);
    if (!res.ok) return null;
    const jobs: { totalItems: number } = await res.json();
    return formatCount.format(jobs.totalItems);
  } catch {
    return null;
  }
}

export async function getJobTitleCount(): Promise<number | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/job-titles`);
    if (!res.ok) return null;
    const titles = await res.json();
    return titles.length;
  } catch {
    return null;
  }
}

export async function getJobTitles(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/job-titles`);
    if (!res.ok) return [];
    const titles: string[] = await res.json();
    return titles;
  } catch {
    return [];
  }
}

export async function getLocations(): Promise<Locations> {
  try {
    const [citiesRes, provincesRes] = await Promise.all([
      fetch(`${BACKEND_API_URL}/api/locations/cities`),
      fetch(`${BACKEND_API_URL}/api/locations/provinces`),
    ]);
    if (!citiesRes.ok || !provincesRes.ok) {
      throw new Error("Could not get locations.");
    }
    return {
      cities: await citiesRes.json(),
      provinces: await provincesRes.json(),
    };
  } catch {
    return { cities: [], provinces: [] };
  }
}
