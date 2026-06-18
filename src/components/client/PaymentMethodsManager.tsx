'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2, CreditCard, Landmark, Star, X, Info } from 'lucide-react';
import {
  addCard,
  addRefundAccount,
  setDefaultPaymentMethod,
  removePaymentMethod,
  type PaymentMethodState,
} from '@/server/client/payment-method-actions';
import { usePendingLoader } from '@/components/providers/LoadingProvider';
import { FormPendingLoader } from '@/components/ui/FormPendingLoader';

type Method = {
  id: string;
  kind: 'card' | 'bank';
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  bankName: string | null;
  accountHolderName: string | null;
  accountLast4: string | null;
  isDefault: boolean;
};

export function PaymentMethodsManager({ methods }: { methods: Method[] }) {
  const cards = methods.filter((m) => m.kind === 'card');
  const banks = methods.filter((m) => m.kind === 'bank');

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 text-amber-200">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          For demonstration only — no real card or bank data is processed or stored. Only a masked
          brand/last-4 representation is kept.
        </p>
      </div>

      <section>
        <h2 className="font-bold text-white/60 text-xs uppercase tracking-widest mb-3">Saved cards</h2>
        <div className="flex flex-col gap-2 mb-4">
          {cards.length === 0 && <p className="text-white/30 text-sm">No cards saved yet.</p>}
          {cards.map((m) => (
            <MethodRow key={m.id} method={m} icon={<CreditCard className="w-4 h-4 text-brand" />}>
              {m.brand} •••• {m.last4} · exp {String(m.expMonth).padStart(2, '0')}/{m.expYear}
            </MethodRow>
          ))}
        </div>
        <AddCardForm />
      </section>

      <section>
        <h2 className="font-bold text-white/60 text-xs uppercase tracking-widest mb-3">Refund account</h2>
        <div className="flex flex-col gap-2 mb-4">
          {banks.length === 0 && <p className="text-white/30 text-sm">No refund account set up yet.</p>}
          {banks.map((m) => (
            <MethodRow key={m.id} method={m} icon={<Landmark className="w-4 h-4 text-brand" />}>
              {m.bankName} · {m.accountHolderName} · •••• {m.accountLast4}
            </MethodRow>
          ))}
        </div>
        <AddBankForm />
      </section>
    </div>
  );
}

function MethodRow({ method, icon, children }: { method: Method; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#111111] border border-white/10 rounded-xl px-5 py-3">
      <div className="flex items-center gap-3 text-sm">
        {icon}
        <span>{children}</span>
        {method.isDefault && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
            <Star className="w-3 h-3 fill-brand" /> Default
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!method.isDefault && (
          <form action={setDefaultPaymentMethod}>
            <FormPendingLoader />
            <input type="hidden" name="methodId" value={method.id} />
            <input type="hidden" name="kind" value={method.kind} />
            <button type="submit" className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Set default
            </button>
          </form>
        )}
        <form action={removePaymentMethod}>
          <FormPendingLoader />
          <input type="hidden" name="methodId" value={method.id} />
          <button type="submit" title="Remove" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/30 border border-white/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function AddCardForm() {
  const [state, action, pending] = useActionState<PaymentMethodState, FormData>(addCard, undefined);
  usePendingLoader(pending);

  return (
    <form action={action} className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 max-w-md">
      {state?.success && <p className="flex items-center gap-1.5 text-brand text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Card added.</p>}
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Brand</span>
          <input name="brand" required maxLength={40} placeholder="Visa" className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Card number</span>
          <input name="cardNumber" required inputMode="numeric" placeholder="4242 4242 4242 4242" className={input} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Exp month</span>
          <input name="expMonth" type="number" required min={1} max={12} placeholder="12" className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Exp year</span>
          <input name="expYear" type="number" required min={new Date().getFullYear()} placeholder="2030" className={input} />
        </label>
      </div>
      <button type="submit" disabled={pending} className="self-start flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add card'}
      </button>
    </form>
  );
}

function AddBankForm() {
  const [state, action, pending] = useActionState<PaymentMethodState, FormData>(addRefundAccount, undefined);
  usePendingLoader(pending);

  return (
    <form action={action} className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 max-w-md">
      {state?.success && <p className="flex items-center gap-1.5 text-brand text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Refund account saved.</p>}
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Bank name</span>
        <input name="bankName" required maxLength={160} placeholder="e.g. Monzo" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Account holder name</span>
        <input name="accountHolderName" required maxLength={160} className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Account number</span>
        <input name="accountNumber" required inputMode="numeric" placeholder="12345678" className={input} />
      </label>
      <button type="submit" disabled={pending} className="self-start flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save refund account'}
      </button>
    </form>
  );
}

const input =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]';
