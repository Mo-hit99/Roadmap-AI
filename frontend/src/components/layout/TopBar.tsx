import React from 'react';
import { LogOut, RefreshCw, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoadmapActions } from '../../context/RoadmapActionsContext';

const TopBar: React.FC = () => {
  const { logout } = useAuth();
  const { actions, result, loading } = useRoadmapActions();
  const hasRoadmap = Boolean(result && actions);

  return (
    <header className="topbar">
      <div>
      </div>
      <div className="topbar-actions">
        <button
          className="pill pill-ghost"
          type="button"
          onClick={() => actions?.exportRoadmap()}
          disabled={!hasRoadmap}
          title={hasRoadmap ? 'Export current roadmap' : 'Generate a roadmap first'}
        >
          <Upload size={14} />
          <span>Export</span>
        </button>
        <button
          className="pill pill-amber"
          type="button"
          onClick={() => void actions?.regenerateRoadmap()}
          disabled={!actions || loading}
          title={actions ? 'Generate the roadmap again' : 'Fill the roadmap form first'}
        >
          <RefreshCw size={14} />
          <span>Regenerate</span>
        </button>
        <button className="icon-action danger" type="button" onClick={() => logout()} aria-label="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
