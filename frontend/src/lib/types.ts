// Mirrors the backend's JobSummaryDto returned by GET /api/jobs.
export type Job = {
  jobId: string;
  title: string;
  companyName: string;
  locationCity: string | null;
  locationProvince: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created: string | null;
  redirectUrl: string | null;
  ingestedAt: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type ProblemDetail = {
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string>;
};
