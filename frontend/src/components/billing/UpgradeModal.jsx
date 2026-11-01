import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PlanCompare from './PlanCompare';
import DemoPaymentForm from './DemoPaymentForm';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';

// Flow: plans ka comparison -> demo payment -> (success par modal band + toast)
export default function UpgradeModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Upgrade to Pro" maxWidth="max-w-2xl">
      <UpgradeFlow onClose={onClose} />
    </Modal>
  );
}

// Modal band hone par yeh component unmount hota hai, to step aur card ki state khud reset ho jati hai
function UpgradeFlow({ onClose }) {
  const { company, refreshCompany } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState('compare');

  if (company?.plan === 'pro') {
    return (
      <div className="text-center py-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mb-4">
          <PartyPopper size={22} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink">You are on Pro</h2>
        <p className="mt-1 text-sm font-body text-ink/70">Unlimited employees are enabled for your company.</p>
        <Button onClick={onClose} className="mt-6">
          Done
        </Button>
      </div>
    );
  }

  if (step === 'pay') {
    return (
      <DemoPaymentForm
        onBack={() => setStep('compare')}
        onSuccess={async () => {
          onClose();
          toast.success('You are now on Pro. Add as many employees as you need!');
          await refreshCompany();
        }}
      />
    );
  }

  return <PlanCompare currentPlan={company?.plan || 'free'} onContinue={() => setStep('pay')} />;
}
