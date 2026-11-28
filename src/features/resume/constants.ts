export const RESUME_BUCKET = "resumes";
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_DOWNLOAD_NAME = "Resume.pdf";
/** How long a share link works. */
export const SHARE_LINK_DAYS = 7;

/** One resume per user, in their own folder (the storage policies depend on this layout). */
export function resumePath(userId: string): string {
  return `${userId}/resume.pdf`;
}

/** Client-side checks before uploading. The bucket enforces type and size again on the server. */
export async function validateResumeFile(file: File): Promise<string | null> {
  if (file.size === 0) return "That file is empty.";
  if (file.size > RESUME_MAX_BYTES) return "The PDF must be 5 MB or smaller.";
  const isPdfName = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const header = await file.slice(0, 5).text();
  if (!isPdfName || header !== "%PDF-") return "Please choose a PDF file.";
  return null;
}
