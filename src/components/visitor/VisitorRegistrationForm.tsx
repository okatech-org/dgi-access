import React, { useEffect, useMemo, useState } from 'react';
import { Employee, Service } from '../../types/personnel';
import { db } from '../../services/database';
import { Visitor } from '../../types/visitor';

interface Props {
  employees: Employee[];
  services: Service[];
  onSubmit?: () => void;
}

export const VisitorRegistrationFormSimple: React.FC<Props> = ({ employees, services, onSubmit }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', company: '', purpose: 'Rendez-vous' });

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = db.searchEmployee(searchQuery);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const selectedService = useMemo(() => selectedEmployee?.service, [selectedEmployee]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEmployee || !form.firstName || !form.lastName || !form.phone) return;
    const visitor: Visitor = {
      id: crypto.randomUUID(),
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company || undefined,
      phone: form.phone,
      idType: 'CNI',
      idNumber: 'N/A',
      purpose: form.purpose,
      employeeToVisit: selectedEmployee.id,
      serviceToVisit: selectedEmployee.service.id,
      checkInTime: new Date(),
      badgeNumber: String(Math.floor(Math.random() * 9000 + 1000)),
      status: 'checked-in',
      expectedDuration: '30 min',
    };
    await db.saveVisitor(visitor);
    if (onSubmit) onSubmit();
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Enregistrement Visiteur</h2>
      <div className="grid grid-cols-2 gap-4">
        <input className="border rounded px-3 py-2" placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        <input className="border rounded px-3 py-2" placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        <input className="border rounded px-3 py-2" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className="border rounded px-3 py-2" placeholder="Société" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Employé à visiter *</label>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tapez le nom ou matricule..." className="w-full px-3 py-2 border rounded-lg" />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {suggestions.map((emp) => (
              <button key={emp.id} type="button" onClick={() => { setSelectedEmployee(emp); setSearchQuery(`${emp.firstName} ${emp.lastName} - ${emp.service.name}`); setSuggestions([]); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between">
                <span>{emp.firstName} {emp.lastName}</span>
                <span className="text-sm text-gray-500">{emp.service.name} - Bureau {emp.office}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          <div><strong>Service:</strong> {selectedEmployee.service.name}</div>
          <div><strong>Bureau:</strong> {selectedEmployee.office} (Étage {selectedEmployee.floor})</div>
          <div><strong>Poste:</strong> {selectedEmployee.position}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motif de la visite *</label>
        <select className="w-full px-3 py-2 border rounded-lg" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
          <option>Réunion professionnelle</option>
          <option>Livraison</option>
          <option>Rendez-vous</option>
          <option>Prestation de service</option>
          <option>Autre</option>
        </select>
      </div>

      <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer et Imprimer Badge</button>
    </form>
  );
};