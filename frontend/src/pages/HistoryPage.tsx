import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Target } from 'lucide-react';
import { roadmapService } from '../services/api';
import type { HistoryItem, RoadmapRequest } from '../services/api';
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

const HistoryDetail: React.FC<{ item: HistoryItem; onBack: () => void }> = ({ item, onBack }) => {
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

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await roadmapService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="history-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Tools</span>
          <h1>Roadmap History</h1>
        </div>
        <p>Generated plans stay here for review and future planning sessions.</p>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <HistoryDetail key="detail" item={selected} onBack={() => setSelected(null)} />
        ) : loading ? (
          <div key="loading" className="history-list">
            {[0, 1, 2].map((item) => <div className="history-card shimmer-card" key={item} />)}
          </div>
        ) : history.length === 0 ? (
          <div key="empty" className="center-state elevated">
            <Target size={38} />
            <p>No roadmaps generated yet.</p>
          </div>
        ) : (
          <motion.div key="list" variants={stagger} initial="hidden" animate="show" className="history-list">
            {history.map((item) => (
              <motion.button
                variants={fadeUp}
                key={item.id}
                className="history-card"
                type="button"
                onClick={() => setSelected(item)}
              >
                <div>
                  <h2>{item.goal}</h2>
                  <div className="history-meta">
                    <span><Calendar size={14} />{new Date(item.created_at).toLocaleDateString()}</span>
                    <span><Target size={14} />{item.success}% Success</span>
                    <span><Clock size={14} />{item.hours}h/week</span>
                  </div>
                </div>
                <ChevronRight size={20} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;
