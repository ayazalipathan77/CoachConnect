import { FileText, Clock, ShieldCheck, X, Check } from 'lucide-react';
import { approveDocument, rejectDocument } from '@/server/admin/actions';
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

export function AdminDocumentsReview({ coachId, documents }: { coachId: string; documents: Doc[] }) {
  if (documents.length === 0) {
    return <p className="text-white/30 text-sm">No documents uploaded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => {
        const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
        const StatusIcon = cfg.icon;
        return (
          <div key={doc.id} className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3">
            <FileText className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.title ?? 'Document'}</p>
              {doc.sizeBytes && <p className="text-xs text-white/30 mt-0.5">{formatBytes(doc.sizeBytes)}</p>}
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${cfg.className}`}>
              <StatusIcon className="w-3 h-3" />
              {cfg.label}
            </span>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-brand transition-colors shrink-0"
              title="View document"
            >
              <FileText className="w-4 h-4" />
            </a>
            {doc.status !== 'approved' && (
              <form action={approveDocument}>
                <FormPendingLoader />
                <input type="hidden" name="documentId" value={doc.id} />
                <input type="hidden" name="coachId" value={coachId} />
                <button type="submit" title="Approve" className="flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            {doc.status !== 'rejected' && (
              <form action={rejectDocument}>
                <FormPendingLoader />
                <input type="hidden" name="documentId" value={doc.id} />
                <input type="hidden" name="coachId" value={coachId} />
                <button type="submit" title="Reject" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/40 border border-white/10 hover:text-red-400 hover:border-red-500/20 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
