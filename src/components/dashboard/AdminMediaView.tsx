"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Upload, X } from "lucide-react";
import { MediaItem } from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";

interface AdminMediaViewProps {
  media: MediaItem[];
  canManage: boolean;
  onAdd: (item: Omit<MediaItem, "id" | "uploadedAt">) => void;
  onDelete: (id: string) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30";

export default function AdminMediaView({
  media,
  canManage,
  onAdd,
  onDelete,
}: AdminMediaViewProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  const resetUpload = (keepPreview: boolean) => {
    // On submit the preview URL is handed to the new media item, so only
    // revoke it when the upload is cancelled.
    if (previewUrl && !keepPreview) URL.revokeObjectURL(previewUrl);
    setUploadOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    if (!title) setTitle(picked.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !previewUrl || !title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      src: previewUrl,
    });
    resetUpload(true);
  };

  return (
    <StaggerList className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">
          {media.length} {media.length === 1 ? "item" : "items"} in the library
        </p>
        {canManage && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Media</span>
          </button>
        )}
      </div>

      {media.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setLightbox(item)}
                className="relative block w-full aspect-video bg-neutral-900 cursor-pointer"
                aria-label={`Preview ${item.title}`}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  unoptimized={item.src.startsWith("blob:")}
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-500 font-mono mt-2">
                    {item.uploadedAt}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    title="Delete media"
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No media yet</p>
          <p className="text-xs text-neutral-400 mt-1">
            Upload photos from your events to build the gallery.
          </p>
        </div>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => resetUpload(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="Close upload dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Upload Media
            </h3>

            <label className="relative flex flex-col items-center justify-center aspect-video rounded-xl border border-dashed border-white/20 bg-[#18181b] hover:border-white/40 text-xs text-neutral-400 cursor-pointer overflow-hidden transition-colors">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Selected file preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <>
                  <Upload className="w-5 h-5 mb-2" />
                  <span>Click to choose an image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="sr-only"
              />
            </label>

            <input
              type="text"
              required
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
            <textarea
              rows={3}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => resetUpload(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || !title.trim()}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900">
              <Image
                src={lightbox.src}
                alt={lightbox.title}
                fill
                unoptimized={lightbox.src.startsWith("blob:")}
                sizes="768px"
                className="object-contain"
              />
            </div>
            <p className="mt-3 text-sm font-bold text-white">{lightbox.title}</p>
            {lightbox.description && (
              <p className="text-xs text-neutral-400 mt-1">{lightbox.description}</p>
            )}
          </div>
        </div>
      )}
    </StaggerList>
  );
}
