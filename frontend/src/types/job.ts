export type JobStatus = "new" | "applied" | "interview" | "rejected";

export interface JobAnalysis {
  is_english_friendly: boolean;
  german_required: boolean;
  german_level_mentioned: string | null;
  tech_match_score: number;
  matched_techs: string[];
  missing_techs: string[];
  summary: string;
  recommendation: "apply" | "skip" | "maybe";
}

export interface Job {
  job_id: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  url: string;
  source: string;
  description: string;
  posted_at: string;
  scraped_at: string;
  status: JobStatus;
  analysis: JobAnalysis;
  salary?: string;
  workplace_type?: string;
  tags?: string[];
}
