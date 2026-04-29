import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Job, JobStatus } from "../types/job";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), orderBy("scraped_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ ...d.data() } as Job));
      setJobs(data);
    } catch (e) {
      setError("Failed to load jobs from Firestore");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 5 minutes to stay within Firestore free tier limits
    const interval = setInterval(fetchJobs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (jobId: string, status: JobStatus) => {
    await updateDoc(doc(db, "jobs", jobId), { status });
    setJobs((prev) =>
      prev.map((j) => (j.job_id === jobId ? { ...j, status } : j))
    );
  };

  return { jobs, loading, error, updateStatus, refetch: fetchJobs };
}
