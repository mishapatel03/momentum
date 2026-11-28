"use client";

import { Download, ExternalLink, FileText, Link2, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

import {
  createResumeShareLink,
  createResumeUploadUrl,
  deleteResume,
  finishResumeUpload,
} from "../actions";
import { RESUME_BUCKET, SHARE_LINK_DAYS, validateResumeFile } from "../constants";
import type { ResumeInfo } from "../queries";

export function ResumeCard({ resume }: { resume: ResumeInfo | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function upload(file: File) {
    const problem = await validateResumeFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    setUploading(true);
    try {
      const target = await createResumeUploadUrl();
      if (!target.ok) throw new Error(target.message);

      const { error } = await createClient()
        .storage.from(RESUME_BUCKET)
        .uploadToSignedUrl(target.path, target.token, file, { contentType: "application/pdf" });
      if (error) throw error;

      setShareUrl(null); // an old link would point at the replaced file's old version
      await finishResumeUpload();
      toast.success(resume ? "Resume replaced" : "Resume uploaded");
    } catch (error) {
      console.error("Resume upload failed", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function share() {
    startTransition(async () => {
      const result = await createResumeShareLink();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setShareUrl(result.url);
      try {
        await navigator.clipboard.writeText(result.url);
        toast.success(`Link copied. It works for ${SHARE_LINK_DAYS} days.`);
      } catch {
        toast.message("Link ready. Copy it from the box below.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteResume();
      if (result.ok) {
        setShareUrl(null);
        toast.success("Resume deleted");
      } else {
        toast.error(result.message);
      }
    });
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void upload(file);
      }}
    />
  );

  if (!resume) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        <FileText className="size-6" aria-hidden />
        <p>Upload your resume once. Open, download or share it in one tap.</p>
        {fileInput}
        <Button type="button" disabled={isUploading} onClick={() => inputRef.current?.click()}>
          <Upload aria-hidden />
          {isUploading ? "Uploading…" : "Upload PDF"}
        </Button>
        <p className="text-xs">PDF, up to 5 MB. Stored privately.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <FileText className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Resume.pdf</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(resume.sizeBytes)} · updated {resume.updatedLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button asChild variant="secondary">
          <a href="/resume" target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Open
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/resume?download=1">
            <Download aria-hidden />
            Download
          </a>
        </Button>
        <Button type="button" variant="secondary" disabled={isPending} onClick={share}>
          <Link2 aria-hidden />
          Copy share link
        </Button>
        {fileInput}
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden />
          {isUploading ? "Uploading…" : "Replace"}
        </Button>
      </div>

      {shareUrl && (
        <div className="flex flex-col gap-1">
          <label htmlFor="share-url" className="text-xs text-muted-foreground">
            Share link (works for {SHARE_LINK_DAYS} days)
          </label>
          <Input
            id="share-url"
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="text-xs"
          />
        </div>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="self-start text-destructive">
            <Trash2 aria-hidden />
            Delete resume
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your resume?</AlertDialogTitle>
            <AlertDialogDescription>
              Share links you sent will stop working. You can upload a new one any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
