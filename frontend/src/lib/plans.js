// Plans ki ek hi jagah definition: landing ka pricing aur (baad mein) upgrade modal dono yahin se parhte hain.
// Backend: free = 10 employees, pro = unlimited (employeeLimit null).
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 'Rs. 0',
    period: 'forever',
    employeeLimit: 10,
    tagline: 'For small teams getting started.',
    features: [
      'Up to 10 employees',
      'Attendance, leave and payroll',
      'PDF payslips and Excel exports',
      'Role-based access for your team',
      'Biometric device webhook',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 'Rs. 4,999',
    period: '/ month',
    employeeLimit: null,
    tagline: 'For companies that keep growing.',
    features: [
      'Unlimited employees',
      'Everything in Free, no feature gates',
      'Upgrade in one click from your dashboard',
    ],
  },
};
