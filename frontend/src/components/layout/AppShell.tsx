import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { RoadmapActionsProvider } from '../../context/RoadmapActionsContext';

const AppShell: React.FC = () => {
  return (
    <RoadmapActionsProvider>
      <div className="app-shell noise">
        <Sidebar />
        <main className="content-area">
          <TopBar />
          <Outlet />
        </main>
      </div>
    </RoadmapActionsProvider>
  );
};

export default AppShell;
