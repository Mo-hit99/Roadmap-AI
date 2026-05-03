import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  MessageSquare,
  Briefcase,
  FileText,
  Search,
  CalendarDays,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { roadmapService, mentorService } from '../services/api';
import type { HistoryItem, RoadmapRequest, CareerToolHistoryItem } from '../services/api';
import { fadeUp, stagger } from '../lib/motionVariants';
import { buildTimeline, extractSummaryBullets } from '../components/roadmap/RoadmapResult';

const sectionTitles = ['Projects', 'Resources', 'Success Tips', 'Weekly Plan'];

const stripMarkdown = (text: string) =>
  text
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\|/g, ' ')
    .trim();

const extractSectionItems = (roadmap: string, title: string) => {
  const lines = roadmap.split('\n');
  const startIndex = lines.findIndex((line) => line.replace(/^#+\s*/, '').trim().toLowerCase() === title.toLowerCase());
  if (startIndex === -1) return [];

  const items: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (/^#{1,3}\s+/.test(line)) break;
    if (!line || /^\|?\s*-{2,}/.test(line) || line.toLowerCase().includes('timeline |')) continue;
    const readable = stripMarkdown(line);
    if (readable.length > 8) items.push(readable);
  }

  return items.slice(0, 8);
};

// ─── Roadmap Detail ───────────────────────────────────────

const RoadmapDetail: React.FC<{ item: HistoryItem; onBack: () => void }> = ({ item, onBack }) => {
  const request: RoadmapRequest = useMemo(
    () => ({
      goal: item.goal,
      skills: item.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      hours: item.hours,
      deadline: item.deadline,
    }),
    [item],
  );
  const timeline = useMemo(() => buildTimeline(item.roadmap, request), [item.roadmap, request]);
  const summary = useMemo(() => extractSummaryBullets(item.roadmap), [item.roadmap]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="history-detail">
      <button className="btn-secondary history-back" type="button" onClick={onBack}>
        <ChevronLeft size={17} />
        Back to history
      </button>

      <div className="history-detail-hero">
        <div>
          <span className="eyebrow">Saved roadmap</span>
          <h2>{item.goal}</h2>
          <div className="history-meta">
            <span><Calendar size={14} />{new Date(item.created_at).toLocaleDateString()}</span>
            <span><Target size={14} />{item.success}% Success</span>
            <span><Clock size={14} />{item.hours}h/week</span>
          </div>
        </div>
      </div>

      <div className="readable-summary history-readable-summary">
        {summary.map((point) => (
          <div className="summary-point" key={point}>
            <Target size={16} />
            <p>{point}</p>
          </div>
        ))}
      </div>

      <div className="tech-timeline-card">
        <div className="timeline-heading">
          <div>
            <span className="eyebrow">Technology Timeline</span>
            <h3>Connected learning path</h3>
          </div>
          <span className="timeline-hours"><Clock size={15} />{item.hours}h/week</span>
        </div>
        <div className="tech-timeline-graph">
          {timeline.map((phase, index) => (
            <div className="timeline-phase" key={`${phase.phase}-${index}`}>
              {index < timeline.length - 1 && <span className="timeline-connector" />}
              <div className={index === 0 ? 'timeline-dot active' : 'timeline-dot'}>{index + 1}</div>
              <div className="timeline-phase-card">
                <div className="timeline-phase-top">
                  <strong>{phase.phase}</strong>
                  <span>{phase.timeline}</span>
                </div>
                <div className="technology-chips">
                  {phase.technologies.map((tech) => <span key={`${phase.phase}-${tech}`}>{tech}</span>)}
                </div>
                <p>{phase.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="history-sections-grid">
        {sectionTitles.map((title) => {
          const items = extractSectionItems(item.roadmap, title);
          if (!items.length) return null;
          return (
            <section className="history-readable-card" key={title}>
              <h3>{title}</h3>
              <div className="history-readable-list">
                {items.map((entry) => <p key={entry}>{entry}</p>)}
              </div>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Tool Detail ──────────────────────────────────────────

const ToolDetail: React.FC<{ item: CareerToolHistoryItem; onBack: () => void }> = ({ item, onBack }) => {
  const renderContent = () => {
    switch (item.tool_type) {
      case 'mentor_chat':
        return (
          <div className="chat-messages">
            <div className="chat-bubble user">
              <div className="bubble-content">
                <p>{item.content.message}</p>
              </div>
            </div>
            <div className="chat-bubble assistant">
              <div className="bubble-content">
                <div className="bubble-markdown">
                  <ReactMarkdown>{item.content.reply}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        );
      case 'resume':
        return (
          <div className="resume-preview-card">
            <div className="resume-content">
              <ReactMarkdown>{item.content.resume}</ReactMarkdown>
            </div>
          </div>
        );
      case 'daily_plan':
        return (
          <div className="dailyplan-grid">
            {item.content.days.map((day: any) => (
              <div key={day.day} className="dailyplan-card">
                <div className="dailyplan-card-header">
                  <span className="dailyplan-day-badge">Day {day.day}</span>
                  <span className="dailyplan-label">{day.label}</span>
                </div>
                <div className="dailyplan-card-body">
                  <div className="dailyplan-item">
                    <strong>Learn</strong>
                    <p>{day.learning}</p>
                  </div>
                  <div className="dailyplan-item">
                    <strong>Practice</strong>
                    <p>{day.practice}</p>
                  </div>
                  <div className="dailyplan-item">
                    <strong>Outcome</strong>
                    <p>{day.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'job_match':
        return (
          <div className="jobmatch-grid">
            {item.content.roles.map((role: any, idx: number) => (
              <div key={idx} className="jobmatch-card">
                <div className="jobmatch-card-header">
                  <h3>{role.title}</h3>
                  <div className="jobmatch-gauge">
                    <span className="ring-value">{role.readiness}%</span>
                  </div>
                </div>
                <div className="jobmatch-section">
                  <h4>Missing Skills</h4>
                  <div className="technology-chips missing-chips">
                    {role.missing_skills.map((s: string) => <span key={s}>{s}</span>)}
                  </div>
                </div>
                <div className="jobmatch-section">
                  <h4>Suggestions</h4>
                  <ul className="jobmatch-suggestions">
                    {role.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case 'skill_gap':
        return (
          <div className="skillgap-analysis">
            <div className="skillgap-summary-card"><p>{item.content.summary}</p></div>
            <section className="skillgap-section critical">
              <h3>Critical Gaps</h3>
              <div className="skillgap-list">
                {item.content.critical.map((g: any) => (
                  <div key={g.skill} className="skillgap-item">
                    <strong>{g.skill}</strong>
                    <p>{g.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      default:
        return <pre>{JSON.stringify(item.content, null, 2)}</pre>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="history-detail">
      <button className="btn-secondary history-back" type="button" onClick={onBack}>
        <ChevronLeft size={17} />
        Back to history
      </button>

      <div className="history-detail-hero">
        <div>
          <span className="eyebrow">{item.tool_type.replace('_', ' ')}</span>
          <h2>{item.title}</h2>
          <div className="history-meta">
            <span><Calendar size={14} />{new Date(item.created_at).toLocaleDateString()}</span>
            <span><Clock size={14} />{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="history-tool-content" style={{ marginTop: '20px' }}>
        {renderContent()}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────

type Tab = 'roadmaps' | 'tools';

const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('roadmaps');
  const [roadmapHistory, setRoadmapHistory] = useState<HistoryItem[]>([]);
  const [toolHistory, setToolHistory] = useState<CareerToolHistoryItem[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<HistoryItem | null>(null);
  const [selectedTool, setSelectedTool] = useState<CareerToolHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rData, tData] = await Promise.all([
          roadmapService.getHistory(),
          mentorService.getHistory(),
        ]);
        setRoadmapHistory(rData);
        setToolHistory(tData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'mentor_chat': return <MessageSquare size={18} />;
      case 'job_match': return <Briefcase size={18} />;
      case 'resume': return <FileText size={18} />;
      case 'daily_plan': return <CalendarDays size={18} />;
      case 'skill_gap': return <Search size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="history-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>History</h1>
        </div>
        <p>Review your saved roadmaps and career tool generations.</p>
      </div>

      {!selectedRoadmap && !selectedTool && (
        <div className="tabs-bar" style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            className={`tab-btn ${activeTab === 'roadmaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmaps')}
            style={{
              padding: '12px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'roadmaps' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'roadmaps' ? 'var(--accent-gold)' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Roadmaps
          </button>
          <button
            className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
            style={{
              padding: '12px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'tools' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'tools' ? 'var(--accent-gold)' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Career Tools
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedRoadmap ? (
          <RoadmapDetail key="rd" item={selectedRoadmap} onBack={() => setSelectedRoadmap(null)} />
        ) : selectedTool ? (
          <ToolDetail key="td" item={selectedTool} onBack={() => setSelectedTool(null)} />
        ) : loading ? (
          <div key="loading" className="history-list">
            {[0, 1, 2].map((i) => <div key={i} className="history-card shimmer-card" />)}
          </div>
        ) : activeTab === 'roadmaps' ? (
          <motion.div key="rlist" variants={stagger} initial="hidden" animate="show" className="history-list">
            {roadmapHistory.length === 0 ? (
              <div className="center-state elevated"><Target size={38} /><p>No roadmaps generated yet.</p></div>
            ) : (
              roadmapHistory.map((item) => (
                <motion.button
                  variants={fadeUp}
                  key={item.id}
                  className="history-card"
                  onClick={() => setSelectedRoadmap(item)}
                >
                  <div>
                    <h2>{item.goal}</h2>
                    <div className="history-meta">
                      <span><Calendar size={14} />{new Date(item.created_at).toLocaleDateString()}</span>
                      <span><Target size={14} />{item.success}% Success</span>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </motion.button>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div key="tlist" variants={stagger} initial="hidden" animate="show" className="history-list">
            {toolHistory.length === 0 ? (
              <div className="center-state elevated"><Clock size={38} /><p>No tool results saved yet.</p></div>
            ) : (
              toolHistory.map((item) => (
                <motion.button
                  variants={fadeUp}
                  key={item.id}
                  className="history-card"
                  onClick={() => setSelectedTool(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="tool-icon-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(128,83,24,0.08)', display: 'grid', placeItems: 'center', color: 'var(--accent-gold)' }}>
                      {getToolIcon(item.tool_type)}
                    </div>
                    <div>
                      <h2>{item.title}</h2>
                      <div className="history-meta">
                        <span><Calendar size={14} />{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;
