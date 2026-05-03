import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GitBranch,
  MessageSquare,
  Briefcase,
  FileText,
  CalendarDays,
  Search,
  History,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

const navItems = [
  { icon: GitBranch, label: 'Roadmap', path: '/roadmap' },
  { icon: MessageSquare, label: 'AI Mentor', path: '/mentor' },
  { icon: CalendarDays, label: 'Daily Planner', path: '/daily-plan' },
  { icon: Briefcase, label: 'Job Match', path: '/job-match' },
  { icon: FileText, label: 'Resume', path: '/resume' },
  { icon: Search, label: 'Skill Gap', path: '/skill-gap' },
  { icon: History, label: 'History', path: '/history' },
];

const IconRail: React.FC = () => {
  return (
    <Tooltip.Provider delayDuration={120}>
      <aside className="icon-rail">
        <div className="rail-logo">R</div>
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
