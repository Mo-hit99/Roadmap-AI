import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import InputForm from '../components/roadmap/InputForm';
import RoadmapResult from '../components/roadmap/RoadmapResult';
import { roadmapService } from '../services/api';
import type { RoadmapRequest, RoadmapResponse } from '../services/api';
import { useRoadmapActions } from '../context/RoadmapActionsContext';

const RoadmapPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<RoadmapRequest | null>(null);
  const [formWidth, setFormWidth] = useState(430);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { setRoadmapState, clearRoadmapState } = useRoadmapActions();

  const handleGenerate = async (data: RoadmapRequest) => {
    setLoading(true);
    setError(null);
    setRequest(data);
    try {
      const response = await roadmapService.generate(data);
      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestSkills = async (goal: string) => {
    setSkillsLoading(true);
    try {
      const response = await roadmapService.suggestSkills(goal);
      return response.skills;
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const minFormWidth = 320;
    const minResultWidth = 420;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = moveEvent.clientX - rect.left;
      const maxFormWidth = Math.max(minFormWidth, rect.width - minResultWidth);
      setFormWidth(Math.min(Math.max(nextWidth, minFormWidth), maxFormWidth));
    };

    const handlePointerUp = () => {
      document.body.classList.remove('is-resizing-roadmap');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    document.body.classList.add('is-resizing-roadmap');
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  };

  const buildRoadmapExport = () => {
    if (!result) return '';

    return [
      request?.goal ? `# ${request.goal} Roadmap` : '# Roadmap',
      '',
      request ? `Goal: ${request.goal}` : '',
      request?.skills?.length ? `Skills: ${request.skills.join(', ')}` : '',
      request ? `Hours per week: ${request.hours}` : '',
      request?.deadline ? `Target date: ${request.deadline}` : '',
      `Success score: ${result.success}%`,
      '',
      result.roadmap,
    ].filter(Boolean).join('\n');
  };

  const handleExportRoadmap = () => {
    if (!result) return;

    const blob = new Blob([buildRoadmapExport()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (request?.goal || 'roadmap')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    link.href = url;
    link.download = `${safeName || 'roadmap'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintRoadmap = () => {
    if (!result) return;
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    window.print();
  };

  const handleShareRoadmap = async () => {
    if (!result) return;

    const shareText = buildRoadmapExport();
    if (navigator.share) {
      await navigator.share({
        title: request?.goal ? `${request.goal} Roadmap` : 'Roadmap',
        text: shareText,
      });
      return;
    }

    await navigator.clipboard.writeText(shareText);
    window.alert('Roadmap copied to clipboard.');
  };

  const handleRegenerate = async () => {
    if (!request || loading) return;
    await handleGenerate(request);
  };

  useEffect(() => {
    setRoadmapState({
      request,
      result,
      loading,
      actions: {
        exportRoadmap: handleExportRoadmap,
        regenerateRoadmap: handleRegenerate,
        shareRoadmap: handleShareRoadmap,
        printRoadmap: handlePrintRoadmap,
        downloadPdf: handleDownloadPdf,
      },
    });

    return () => {
      clearRoadmapState();
    };
  }, [clearRoadmapState, loading, request, result, setRoadmapState]);

  return (
    <div className="roadmap-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">AI Roadmap</span>
          <h1>Build a hiring or growth plan</h1>
        </div>
      </div>

      <div
        ref={gridRef}
        className="roadmap-grid"
        style={{ '--roadmap-form-width': `${formWidth}px` } as React.CSSProperties}
      >
        <InputForm
          onSubmit={handleGenerate}
          onSuggestSkills={handleSuggestSkills}
          loading={loading}
          skillsLoading={skillsLoading}
        />

        <button
          type="button"
          className="roadmap-resize-handle"
          onPointerDown={handleResizeStart}
          onDoubleClick={() => setFormWidth(430)}
          aria-label="Resize roadmap panels"
          title="Drag to resize panels"
        >
          <span />
        </button>

        <div className="roadmap-result-column">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="error-banner"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {result ? (
              <RoadmapResult
                key="result"
                success={result.success}
                roadmap={result.roadmap}
                request={request}
                onDownloadPdf={handleDownloadPdf}
                onShare={handleShareRoadmap}
                onPrint={handlePrintRoadmap}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-result"
              >
                <h2>Ready for the next workflow?</h2>
                <p>Submit the form to render a step graph, success gauge, and detailed plan.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
