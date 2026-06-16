'use client';

import { useActionState, useRef } from 'react';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { updateAvatar, type ProfileState } from '@/server/coach/actions';

export function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState<ProfileState, FormData>(updateAvatar, undefined);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Image must be under 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (hiddenRef.current) {
        hiddenRef.current.value = reader.result as string;
      }
      formRef.current?.requestSubmit();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <div className="relative group shrink-0">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/10">
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentImage} alt="Your photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Camera className="w-8 h-8" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Change photo"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Text + hidden form */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/70">Profile photo</p>
        <p className="text-xs text-white/30">JPG or PNG, max 500 KB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="self-start flex items-center gap-1.5 text-sm text-brand font-medium hover:text-brand-dark transition-colors"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {pending ? 'Uploading…' : 'Change photo'}
        </button>
        {state?.success && (
          <p className="flex items-center gap-1 text-xs text-brand">
            <CheckCircle2 className="w-3.5 h-3.5" /> Photo updated
          </p>
        )}
        {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      </div>

      {/* Hidden file input + form */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <form ref={formRef} action={action} className="hidden">
        <input ref={hiddenRef} type="hidden" name="imageUrl" />
      </form>
    </div>
  );
}
