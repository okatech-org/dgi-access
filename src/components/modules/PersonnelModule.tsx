import React, { useMemo, useState } from 'react';
import { db } from '../../services/database';
import { Employee, Service } from '../../types/personnel';

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const AddEmployeeForm: React.FC<{ onSubmit: (e: Employee) => void; services: Service[] }> = ({ onSubmit, services }) => {
  const [form, setForm] = useState<Partial<Employee>>({ isActive: true });
  const handleChange = (name: keyof Employee, value: any) => setForm((p) => ({ ...p, [name]: value }));
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.firstName || !form.lastName || !form.matricule || !form.service) return;
    const now = new Date();
    onSubmit({
      id: crypto.randomUUID(),
      matricule: String(form.matricule),
      firstName: String(form.firstName),
      lastName: String(form.lastName),
      email: String(form.email || ''),
      phone: String(form.phone || ''),
      service: form.service as Service,
      position: String(form.position || ''),
      office: String(form.office || ''),
      floor: String(form.floor || ''),
      isActive: Boolean(form.isActive),
      photo: form.photo as string | undefined,
      createdAt: now,
      updatedAt: now,
    });
    setForm({ isActive: true });
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Matricule" value={form.matricule || ''} onChange={(e) => handleChange('matricule', e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Prénom" value={form.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Nom" value={form.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Téléphone" value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
        <select className="border rounded px-3 py-2" value={(form.service as Service | undefined)?.id || ''} onChange={(e) => {
          const s = services.find((x) => x.id === e.target.value);
          handleChange('service', s || null);
        }} required>
          <option value="">Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input className="border rounded px-3 py-2" placeholder="Poste" value={form.position || ''} onChange={(e) => handleChange('position', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Bureau" value={form.office || ''} onChange={(e) => handleChange('office', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Étage" value={form.floor || ''} onChange={(e) => handleChange('floor', e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm"><input type="checkbox" className="mr-2" checked={!!form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} /> Actif</label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Ajouter</button>
      </div>
    </form>
  );
};

const EmployeesByService: React.FC<{ services: Service[]; employees: Employee[] }> = ({ services, employees }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-3">Liste par service</h3>
    <div className="space-y-4">
      {services.map((s) => (
        <div key={s.id}>
          <div className="font-medium text-gray-800">{s.name}</div>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {employees.filter((e) => e.service.id === s.id).map((e) => (
              <li key={e.id}>{e.firstName} {e.lastName} — {e.position} — Bureau {e.office}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export const PersonnelModule: React.FC = () => {
  const services = db.getServices();
  const employees = db.getEmployees();
  const [search, setSearch] = useState('');

  const results = useMemo(() => (search.length > 1 ? db.searchEmployee(search) : employees), [search, employees]);

  const stats = {
    totalEmployees: employees.length,
    totalServices: services.length,
    presentToday: 0,
    onLeave: 0,
  };

  const handleAddEmployee = async (e: Employee) => {
    await db.saveEmployee(e);
    window.dispatchEvent(new Event('force-update'));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Personnel" value={stats.totalEmployees} />
        <StatCard title="Services" value={stats.totalServices} />
        <StatCard title="Présents" value={stats.presentToday} />
        <StatCard title="En congé" value={stats.onLeave} />
      </div>

      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-full" placeholder="Recherche rapide..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AddEmployeeForm onSubmit={handleAddEmployee} services={services} />

      <EmployeesByService services={services} employees={results} />
    </div>
  );
};


