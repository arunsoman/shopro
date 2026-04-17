import React from 'react';
import { Settings, Users, Building2, Bell, Shield, Palette, Database, CreditCard } from 'lucide-react';
import { DefaultLayout, KPICard, NavCard } from '@/components/shared/DefaultLayout';
import { useMemo } from 'react';

const SettingsPage: React.FC = () => {
  // Navigation cards for settings sections
  const navCards: NavCard[] = useMemo(() => [
    {
      id: 'restaurant',
      title: 'Restaurant Profile',
      description: 'Name, location, timezone',
      icon: Building2,
      onClick: () => console.log('Restaurant settings')
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Staff roles and permissions',
      icon: Users,
      badge: 5,
      badgeVariant: 'default',
      onClick: () => console.log('User management')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email and push alerts',
      icon: Bell,
      onClick: () => console.log('Notifications')
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password and 2FA',
      icon: Shield,
      onClick: () => console.log('Security')
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme and display',
      icon: Palette,
      onClick: () => console.log('Appearance')
    },
    {
      id: 'data',
      title: 'Data & Export',
      description: 'Backups and exports',
      icon: Database,
      onClick: () => console.log('Data')
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Subscription and payments',
      icon: CreditCard,
      onClick: () => console.log('Billing')
    }
  ], [])

  return (
    <DefaultLayout
      title="Settings"
      subtitle="Configure your restaurant and application preferences"
      icon={Settings}
      category="Administration"
      navCards={navCards}
      navCardsTitle="Configuration"
      empty={false}
    />
  );
};

export default SettingsPage;
