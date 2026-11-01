import { useState } from 'react';
import Modal from './ui/Modal';
import Field from './ui/Field';
import Button from './ui/Button';
import API from '../api/axios';
import { errorText } from '../lib/errors';
import { useToast } from '../context/toast-context';
import { useUpgrade } from '../context/upgrade-context';

const EMPTY = {
  employeeCode: '',
  fullName: '',
  cnic: '',
  contactNumber: '',
  email: '',
  department: '',
  designation: '',
  baseSalary: '',
};

export default function EmployeeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { openUpgrade } = useUpgrade();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/employees', { ...formData, baseSalary: Number(formData.baseSalary) });
      toast.success(`${formData.fullName} added.`);
      setFormData(EMPTY);
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.code === 'PLAN_LIMIT') {
        // Free plan ki hadd: form band karke Upgrade modal dikhao
        onClose();
        toast.error(err.response.data.message);
        openUpgrade();
      } else {
        setError(errorText(err, 'Failed to add employee.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text') => (
    <Field label={label} name={name} type={type} value={formData[name]} onChange={handleChange} required />
  );

  return (
    <Modal open={isOpen} onClose={onClose} title="Add employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Employee code', 'employeeCode')}
          {field('Full name', 'fullName')}
          {field('CNIC', 'cnic')}
          {field('Contact', 'contactNumber')}
          {field('Email', 'email', 'email')}
          {field('Base salary', 'baseSalary', 'number')}
          {field('Department', 'department')}
          {field('Designation', 'designation')}
        </div>

        {error && (
          <p role="alert" className="text-rust text-sm font-body bg-rust/10 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Adding...' : 'Add employee'}
        </Button>
      </form>
    </Modal>
  );
}
