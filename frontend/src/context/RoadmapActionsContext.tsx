import React, { createContext, useContext, useMemo, useState } from 'react';
import type { RoadmapRequest, RoadmapResponse } from '../services/api';

export interface RoadmapActionHandlers {
  exportRoadmap: () => void;
  regenerateRoadmap: () => Promise<void>;
  shareRoadmap: () => Promise<void>;
  printRoadmap: () => void;
  downloadPdf: () => void;
}

interface RoadmapActionsContextValue {
  request: RoadmapRequest | null;
  result: RoadmapResponse | null;
  loading: boolean;
  actions: RoadmapActionHandlers | null;
  setRoadmapState: (state: {
    request: RoadmapRequest | null;
    result: RoadmapResponse | null;
    loading: boolean;
    actions: RoadmapActionHandlers | null;
  }) => void;
  clearRoadmapState: () => void;
}

const RoadmapActionsContext = createContext<RoadmapActionsContextValue | undefined>(undefined);

export const RoadmapActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<RoadmapRequest | null>(null);
  const [result, setResult] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<RoadmapActionHandlers | null>(null);

  const value = useMemo<RoadmapActionsContextValue>(() => ({
    request,
    result,
    loading,
    actions,
    setRoadmapState: ({ request: nextRequest, result: nextResult, loading: nextLoading, actions: nextActions }) => {
      setRequest(nextRequest);
      setResult(nextResult);
      setLoading(nextLoading);
      setActions(nextActions);
    },
    clearRoadmapState: () => {
      setRequest(null);
      setResult(null);
      setLoading(false);
      setActions(null);
    },
  }), [actions, loading, request, result]);

  return <RoadmapActionsContext.Provider value={value}>{children}</RoadmapActionsContext.Provider>;
};

export const useRoadmapActions = () => {
  const context = useContext(RoadmapActionsContext);
  if (!context) {
    throw new Error('useRoadmapActions must be used within a RoadmapActionsProvider');
  }
  return context;
};
