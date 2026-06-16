'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Send } from 'lucide-react';
import { sendMessage } from '@/server/messaging/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 w-10 h-10 rounded-full bg-brand text-black flex items-center justify-center hover:bg-brand-dark transition-colors disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
    </button>
  );
}

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const ref = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    await sendMessage(formData);
    ref.current?.reset();
  }

  return (
    <form ref={ref} action={action} className="flex items-end gap-3 p-4 border-t border-white/10 bg-[#050505]">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        name="content"
        rows={1}
        required
        placeholder="Write a message…"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        className="flex-1 bg-[#111111] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand resize-none leading-relaxed [color-scheme:dark]"
      />
      <SubmitButton />
    </form>
  );
}
