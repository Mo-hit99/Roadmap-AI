import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: CalendarDays, label: 'Attendance', path: '/attendance' },
  { icon: IndianRupee, label: 'Payroll', path: '/payroll' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

const IconRail: React.FC = () => {
  return (
    <Tooltip.Provider delayDuration={120}>
      <aside className="icon-rail">
        <div className="rail-logo">A</div>
        <nav className="rail-nav" aria-label="Primary modules">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip.Root key={item.path}>
                <Tooltip.Trigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `rail-button ${isActive ? 'active' : ''}`}
                    aria-label={item.label}
                  >
                    <Icon size={18} />
                  </NavLink>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="rail-tooltip" side="right" sideOffset={10}>
                    {item.label}
                    <Tooltip.Arrow className="rail-tooltip-arrow" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </nav>
      </aside>
    </Tooltip.Provider>
  );
};

export default IconRail;
