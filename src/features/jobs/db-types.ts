import type { JobPlatform, JobStatus } from "@/domain/jobs";
import type { Database } from "@/lib/supabase/database.types";

type DbEnums = Database["public"]["Enums"];

// Compile-time check: the domain lists and the database enums must match exactly.
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const platformsMatch: Equals<JobPlatform, DbEnums["job_platform"]> = true;
const statusesMatch: Equals<JobStatus, DbEnums["job_status"]> = true;
void platformsMatch;
void statusesMatch;

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
