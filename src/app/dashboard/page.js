'use client';

import { useEffect, useState } from 'react';
import AssistantDashboard from '@/components/dashboard/AssistantDashboard';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import PharmacistDashboard from '@/components/dashboard/PharmacistDashboard';
import MltDashboard from '@/components/dashboard/MltDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';

export default function DashboardPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    setRole(userRole || 'assistant');
  }, []);

  if (!role) {
    return <div style={{ color: 'var(--foreground)' }}>Please wait...</div>;
  }

  // Render component based on user role
  switch (role) {
    case 'assistant':
      return <AssistantDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'mlt':
      return <MltDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    default:
      return <AssistantDashboard />;
  }
}
