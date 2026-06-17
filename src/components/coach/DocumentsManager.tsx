'use client';

import { useActionState, useRef, useState } from 'react';
import { FileText, Trash2, Upload, Loader2, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';
import { uploadCoachDocument, deleteCoachDocument, type MediaState } from '@/server/coach/media-actions';
import { usePendingLoader } from '@/components/providers/LoadingProvider';
import { FormPendingLoader } from '@/components/ui/FormPendingLoader';

type Doc = {
  id: string;
  title: string | null;
  url: string;
  status: string;
  sizeBytes: number | null;
  createdAt: Date;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; className: string }> = {
  pending: { label: 'Pending review', icon: Clock, className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  approved: { label: 'Verified', icon: ShieldCheck, className: 'text-brand bg-brand/10 border-brand/20' },
  rejected: { label: 'Rejected', icon: X, className: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

function formatBytes(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsManager({ existing }: { existing: Doc[] }) {
  const [state, action, pending] = useActionState<MediaState, FormData>(uploadCoachDocument, undefined);
  usePendingLoader(pending);
  const fileRef = useRef<HTMLInputElement>(null);
  const dataUrlRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File must be under 2 MB.');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFileError('Only PDF, JPG, PNG or WebP files are accepted.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (dataUrlRef.current) dataUrlRef.current.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing documents */}
      {existing.length > 0 && (
        <div className="flex flex-col gap-2">
          {existing.map((doc) => {
            const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={doc.id} className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3">
                <FileText className="w-5 h-5 text-white/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title ?? 'Document'}</p>
                  {doc.sizeBytes && (
                    <p className="text-xs text-white/30 mt-0.5">{formatBytes(doc.sizeBytes)}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
                {doc.url.startsWith('data:application/pdf') ? (
                  <a
                    href={doc.url}
                    download={doc.title ?? 'document'}
                    className="text-white/30 hover:text-brand transition-colors shrink-0"
                    title="Download"
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                  </a>
                ) : (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/30 hover:text-brand transition-colors shrink-0"
                    title="View"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                )}
                <form action={deleteCoachDocument}>
                  <FormPendingLoader />
                  <input type="hidden" name="mediaId" value={doc.id} />
                  <button
                    type="submit"
                    title="Remove document"
                    className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      {existing.length === 0 && (
        <p className="text-white/30 text-sm">No documents uploaded yet.</p>
      )}

      {/* Upload form */}
      <form action={action} className="flex flex-col gap-3">
        <input ref={dataUrlRef} type="hidden" name="dataUrl" />

        <div className="flex gap-3">
          <input
            name="title"
            required
            maxLength={200}
            placeholder="Document title (e.g. UEFA B Licence)"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 border border-dashed border-white/15 rounded-xl px-4 py-3 cursor-pointer hover:border-brand/40 transition-colors"
        >
          <Upload className="w-5 h-5 text-white/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/50">{fileName || 'Click to choose a file…'}</p>
            <p className="text-xs text-white/25 mt-0.5">PDF, JPG or PNG — max 2 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {fileError && <p className="text-xs text-red-400">{fileError}</p>}
        {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
        {state?.success && (
          <p className="flex items-center gap-1.5 text-xs text-brand font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Document uploaded — pending admin review.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="self-start flex items-center gap-2 bg-white/5 border border-white/10 hover:border-brand/40 hover:text-brand text-white/70 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {pending ? 'Uploading…' : 'Upload document'}
        </button>
      </form>
    </div>
  );
}
