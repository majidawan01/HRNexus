// "Load sample data" ke liye demo employees aur attendance (sirf ek company ke andar, companyId ke saath)
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const PKT_OFFSET_MS = 5 * HOUR_MS;

const PEOPLE = [
  { fullName: 'Ayesha Khan', department: 'Engineering', designation: 'Software Engineer', baseSalary: 180000 },
  { fullName: 'Bilal Ahmed', department: 'Engineering', designation: 'QA Engineer', baseSalary: 140000 },
  { fullName: 'Fatima Noor', department: 'HR', designation: 'HR Manager', baseSalary: 150000 },
  { fullName: 'Hamza Ali', department: 'Sales', designation: 'Sales Executive', baseSalary: 95000 },
  { fullName: 'Sana Iqbal', department: 'Finance', designation: 'Accountant', baseSalary: 120000 },
  { fullName: 'Usman Tariq', department: 'Operations', designation: 'Operations Lead', baseSalary: 130000 },
  { fullName: 'Mariam Siddiqui', department: 'Sales', designation: 'Account Manager', baseSalary: 110000 },
  { fullName: 'Zain Malik', department: 'Engineering', designation: 'DevOps Engineer', baseSalary: 170000 },
];

const SAMPLE_COUNT = PEOPLE.length;
const codeFor = (i) => `DEMO-${String(i + 1).padStart(3, '0')}`;
const emailFor = (i) => `demo.${i + 1}@sample.hrnexus.test`;

const sampleCodes = () => PEOPLE.map((_, i) => codeFor(i));
const sampleEmails = () => PEOPLE.map((_, i) => emailFor(i));

const buildSampleEmployees = (companyId) =>
  PEOPLE.map((p, i) => ({
    companyId,
    employeeCode: codeFor(i),
    fullName: p.fullName,
    cnic: `00000-000000${i}-0`,
    email: emailFor(i),
    contactNumber: `0300-000000${i}`,
    department: p.department,
    designation: p.designation,
    baseSalary: p.baseSalary,
    status: 'active',
    joiningDate: new Date(Date.now() - (120 + i * 30) * DAY_MS),
  }));

// Pichhle 7 din (Asia/Karachi calendar). Date UTC aadhi raat ke taur par store hoti hai (biometric ki tarah).
// Itwar chhor kar, lekin aaj hamesha shamil, taake dashboard par "Present today" nazar aaye.
const buildSampleAttendance = (companyId, employees) => {
  const pktNow = Date.now() + PKT_OFFSET_MS;
  const todayMs = Math.floor(pktNow / DAY_MS) * DAY_MS;
  const records = [];

  for (let d = 0; d < 7; d++) {
    const dateMs = todayMs - d * DAY_MS;
    if (d > 0 && new Date(dateMs).getUTCDay() === 0) continue;

    employees.forEach((emp, i) => {
      const v = (i * 3 + d * 2) % 11;
      const base = { companyId, employeeId: emp._id, date: new Date(dateMs), source: 'system', remarks: 'Sample data' };
      const inAt = dateMs + 4 * HOUR_MS; // 09:00 PKT
      const outAt = d === 0 ? undefined : new Date(dateMs + 13 * HOUR_MS); // 18:00 PKT, aaj ka check-out nahi

      if (v === 0) {
        records.push({ ...base, status: 'absent' });
      } else if (v === 1 || v === 2) {
        const late = 12 + ((i + d) % 4) * 8;
        records.push({ ...base, status: 'late', lateMinutes: late, checkIn: new Date(inAt + late * 60000), checkOut: outAt });
      } else {
        records.push({
          ...base,
          status: 'present',
          overtimeMinutes: v % 5 === 4 ? 60 : 0,
          checkIn: new Date(inAt),
          checkOut: outAt,
        });
      }
    });
  }
  return records;
};

module.exports = { SAMPLE_COUNT, sampleCodes, sampleEmails, buildSampleEmployees, buildSampleAttendance };
