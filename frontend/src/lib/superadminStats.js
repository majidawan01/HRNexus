// Superadmin dashboard ke numbers aur chart data (companies ki list se, browser mein)
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Pichhle `days` din ke har din ki signups (khaali dinon ke liye 0)
export function buildSignupSeries(companies, days = 30, now = new Date()) {
  const counts = {};
  companies.forEach((c) => {
    const k = dayKey(c.createdAt);
    counts[k] = (counts[k] || 0) + 1;
  });

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    series.push({
      key: dayKey(d),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      signups: counts[dayKey(d)] || 0,
    });
  }
  return series;
}

export function summarize(companies) {
  const pro = companies.filter((c) => c.plan === 'pro').length;
  return {
    total: companies.length,
    pro,
    free: companies.length - pro,
    employees: companies.reduce((sum, c) => sum + (c.employeeCount || 0), 0),
  };
}

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
