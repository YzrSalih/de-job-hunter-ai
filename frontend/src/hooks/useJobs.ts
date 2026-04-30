import { useState, useEffect, useCallback, useRef } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Job, JobStatus } from "../types/job";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const nextRefreshRef = useRef<number>(Date.now() + REFRESH_INTERVAL_MS);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "jobs"), orderBy("scraped_at", "desc"));
      const snapshot = await getDocs(q);
      setJobs(snapshot.docs.map((d) => ({ ...d.data() } as Job)));
      setLastUpdated(new Date());
      nextRefreshRef.current = Date.now() + REFRESH_INTERVAL_MS;
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch (e) {
      setError("Failed to load jobs from Firestore");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Countdown ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const remaining = Math.max(0, Math.round((nextRefreshRef.current - Date.now()) / 1000));
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const updateStatus = async (jobId: string, status: JobStatus) => {
    await updateDoc(doc(db, "jobs", jobId), { status });
    setJobs((prev) => prev.map((j) => (j.job_id === jobId ? { ...j, status } : j)));
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return {
    jobs,
    loading,
    error,
    updateStatus,
    refetch: fetchJobs,
    lastUpdated: formatLastUpdated(),
    nextRefresh: formatCountdown(),
  };
}
