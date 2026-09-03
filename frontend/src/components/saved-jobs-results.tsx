"use client";

import { useCurrentUser } from "@/context/current-user-provider";

export default function SavedJobsResults({
  q,
  location,
  jobId,
}: {
  q?: string;
  location?: string;
  jobId?: string;
}) {
  const { user, isLoading } = useCurrentUser();
}
