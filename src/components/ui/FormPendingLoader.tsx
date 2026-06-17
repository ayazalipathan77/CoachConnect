'use client';

import { useFormStatus } from 'react-dom';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

/**
 * Drop inside any `<form action={serverAction}>` that doesn't already track
 * pending state via `useActionState` (e.g. bare server-action forms rendered
 * from Server Components) to surface it on the global loader. Renders nothing.
 */
export function FormPendingLoader() {
  const { pending } = useFormStatus();
  usePendingLoader(pending);
  return null;
}
