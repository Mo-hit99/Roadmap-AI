import React from 'react';
import { NavLink } from 'react-router-dom';
import { GitBranch, History } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type SidebarItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const sections: SidebarSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'RoadMap', path: '/roadmap', icon: GitBranch},
      { label: 'History', path: '/history', icon: History },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const email = user?.email ?? 'workspace';
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div>
          <strong>RoadMap AI</strong>
          <span>Career Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-sections" aria-label="Workspace navigation">
        {sections.map((section) => (
          <section key={section.title} className="sidebar-section">
            <div className="section-trigger">{section.title}</div>
            <div className="section-items">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {item.badge && <small>{item.badge}</small>}
                  </NavLink>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div>
            <div className="user-name">{email}</div>
            <div className="user-role">Signed in</div>
          </div>
          <span className="dot-green" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
