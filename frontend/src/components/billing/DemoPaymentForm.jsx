import { useState } from 'react';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import API from '../../api/axios';
import Button from '../ui/Button';
import { PLANS } from '../../lib/plans';

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-bg border border-border text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent transition';
const labelCls = 'block text-xs font-mono uppercase tracking-wider text-ash mb-2';

const groupCard = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

// DEMO MODE: card ki maloomat sirf is component ki local state mein hain.
// Na save hoti hain (localStorage/cookies), na kisi API ko jati hain. Server ko sirf POST /company/upgrade
// (bina body ke) jata hai. Component band hote hi yeh state khatam ho jati hai.
// Fields ke `name` attribute jaan boojh kar nahi hain, taake browser unhein autofill/save na kare.
export default function DemoPaymentForm({ onBack, onSuccess }) {
  const [card, setCard] = useState({ holder: 'Demo User', number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    let value = e.target.value;
    if (key === 'number') value = groupCard(value);
    if (key === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (key === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setCard((c) => ({ ...c, [key]: value }));
  };

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // "processing" ka ehsaas
      await API.post('/company/upgrade'); // koi body nahi: card ka kuch bhi server ko nahi jata
      await onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response ? 'Upgrade failed. Please try again.' : 'Cannot reach the server. Please try again.')
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={pay} autoComplete="off">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-body text-ash hover:text-ink transition mb-3"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h2 className="font-display text-xl font-semibold text-ink pr-8">Payment</h2>

      <div role="note" className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
        <FlaskConical size={18} className="text-accent mt-0.5 shrink-0" />
        <div className="text-sm font-body text-ink/80 leading-relaxed">
          <p className="font-display font-semibold text-ink">Demo mode, no real payment</p>
          <p>
            Do not enter a real card number. Card details are never saved or sent to any server. Upgrading only switches
            your company to the Pro plan.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="demo-holder" className={labelCls}>Name on card</label>
          <input id="demo-holder" className={inputCls} value={card.holder} onChange={set('holder')} autoComplete="off" required />
        </div>
        <div>
          <label htmlFor="demo-number" className={labelCls}>Card number (test)</label>
          <input
            id="demo-number"
            className={inputCls}
            value={card.number}
            onChange={set('number')}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="demo-expiry" className={labelCls}>Expiry</label>
            <input id="demo-expiry" className={inputCls} value={card.expiry} onChange={set('expiry')} placeholder="MM/YY" inputMode="numeric" autoComplete="off" required />
          </div>
          <div>
            <label htmlFor="demo-cvc" className={labelCls}>CVC</label>
            <input id="demo-cvc" className={inputCls} value={card.cvc} onChange={set('cvc')} inputMode="numeric" autoComplete="off" required />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} size="lg" className="mt-6 w-full">
        {loading ? 'Processing...' : `Pay ${PLANS.pro.price} (demo)`}
      </Button>
    </form>
  );
}
