import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Download,
  Copy,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { mentorService } from '../services/api';

const RESUME_DRAFT_KEY = 'resume-builder-draft';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const ResumePage: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeHistoryId, setResumeHistoryId] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [copied, setCopied] = useState(false);
  const lastSavedResumeRef = useRef<string | null>(null);
  const hasLoadedDraftRef = useRef(false);

  useEffect(() => {
    if (hasLoadedDraftRef.current) return;
    hasLoadedDraftRef.current = true;

    const rawDraft = window.localStorage.getItem(RESUME_DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      setGoal(draft.goal ?? '');
      setSkills(draft.skills ?? '');
      setProjects(draft.projects ?? '');
      setResume(draft.resume ?? null);
      setResumeHistoryId(draft.resumeHistoryId ?? null);
      lastSavedResumeRef.current = draft.resume ?? null;
      setSaveState(draft.resume && draft.resumeHistoryId ? 'saved' : 'idle');
    } catch {
      window.localStorage.removeItem(RESUME_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const hasDraft = Boolean(goal || skills || projects || resume);
    if (!hasDraft) {
      window.localStorage.removeItem(RESUME_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(
      RESUME_DRAFT_KEY,
      JSON.stringify({ goal, skills, projects, resume, resumeHistoryId }),
    );
  }, [goal, skills, projects, resume, resumeHistoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const skillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await mentorService.generateResume({ goal, skills: skillsList, projects });
      setResume(result.resume);
      setResumeHistoryId(result.history_id);
      lastSavedResumeRef.current = result.resume;
      setSaveState(result.history_id ? 'saved' : 'idle');
    } catch {
      setResume('Error generating resume. Please try again.');
      setSaveState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!resume || !resumeHistoryId) return;
    if (resume === lastSavedResumeRef.current) return;

    setSaveState('saving');
    const timeoutId = window.setTimeout(async () => {
      try {
        const skillsList = skills.split(',').map((item) => item.trim()).filter(Boolean);
        const result = await mentorService.updateResume(resumeHistoryId, {
          resume,
          goal,
          skills: skillsList,
          projects,
        });
        lastSavedResumeRef.current = result.resume;
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [goal, skills, projects, resume, resumeHistoryId]);

  const handleCopy = async () => {
    if (!resume) return;
    await navigator.clipboard.writeText(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resume) return;
    const blob = new Blob([resume], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (goal || 'resume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    link.href = url;
    link.download = `${safeName}-resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateResumeLine = (index: number, nextLine: string) => {
    setResume((current) => {
      if (current === null) return current;
      const lines = current.split('\n');
      lines[index] = nextLine;
      return lines.join('\n');
    });
  };

  const addResumeLine = () => {
    setResume((current) => (current ? `${current}\n` : ''));
  };

  const deleteResumeLine = (index: number) => {
    setResume((current) => {
      if (current === null) return current;
      const lines = current.split('\n');
      lines.splice(index, 1);
      return lines.join('\n');
    });
  };

  const resumeLines = resume?.split('\n') ?? [];

  return (
    <div className="resume-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Career Tools</span>
          <h1>Resume Builder</h1>
        </div>
      </div>

      <div className="resume-layout">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="resume-form-card"
        >
          <div className="form-card-heading">
            <div>
              <h2>Your Info</h2>
              <p>ATS-friendly resume tailored for freshers.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="roadmap-form">
            <label className="form-label">
              <span>Target Role</span>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Frontend Developer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              <span>Skills</span>
              <textarea
                className="input-field textarea-field"
                placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </label>
            <label className="form-label">
              <span>Projects</span>
              <textarea
                className="input-field textarea-field projects-textarea"
                placeholder="Describe your projects (one per line):&#10;AI Roadmap Generator - React + Flask app&#10;Portfolio Website - HTML/CSS/JS"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                rows={5}
              />
              <p className="field-help">List projects with tech stack used. One per line.</p>
            </label>
            <button type="submit" disabled={loading} className="btn-primary submit-roadmap">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <FileText size={18} />
                  Generate Resume
                </>
              )}
            </button>
          </form>
        </motion.section>

        <div className="resume-preview-area">
          <AnimatePresence mode="wait">
            {resume ? (
              <motion.div
                key="resume"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="resume-results-grid"
              >
                <div className="resume-editor-card">
                  <div className="resume-preview-header">
                    <div>
                      <h2>Edit Resume</h2>
                      <p className="resume-helper-text">Each line stays editable and saves automatically.</p>
                    </div>
                    <div className={`resume-save-indicator ${saveState}`}>
                      {saveState === 'saving' && <Loader2 className="animate-spin" size={15} />}
                      {saveState === 'saved' && <Save size={15} />}
                      {saveState === 'error' && <AlertCircle size={15} />}
                      <span>
                        {saveState === 'saving' && 'Saving...'}
                        {saveState === 'saved' && 'Saved'}
                        {saveState === 'error' && 'Save failed'}
                        {saveState === 'idle' && 'Ready'}
                      </span>
                    </div>
                  </div>

                  <div className="resume-editor-lines">
                    {resumeLines.map((line, index) => (
                      <div className="resume-line-row" key={index}>
                        <span className="resume-line-number">{index + 1}</span>
                        <textarea
                          className="resume-line-input"
                          value={line}
                          onChange={(e) => updateResumeLine(index, e.target.value)}
                          rows={Math.max(1, line.length > 90 ? 2 : 1)}
                        />
                        <button
                          type="button"
                          className="resume-line-delete"
                          onClick={() => deleteResumeLine(index)}
                          aria-label={`Delete line ${index + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary resume-add-line" onClick={addResumeLine}>
                      <Plus size={16} />
                      Add line
                    </button>
                  </div>
                </div>

                <div className="resume-preview-card">
                  <div className="resume-preview-header">
                    <h2>Resume Preview</h2>
                    <div className="resume-actions">
                      <button type="button" className="btn-secondary" onClick={handleCopy}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={handleDownload}>
                        <Download size={16} />
                        Download
                      </button>
                      <button type="button" className="btn-secondary" onClick={handlePrint}>
                        <FileText size={16} />
                        Print / PDF
                      </button>
                    </div>
                  </div>
                  <div className="resume-content prose">
                    <ReactMarkdown>{resume}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-result"
              >
                <FileText size={38} />
                <h2>Resume preview</h2>
                <p>Fill in your details and generate an ATS-optimized resume.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
