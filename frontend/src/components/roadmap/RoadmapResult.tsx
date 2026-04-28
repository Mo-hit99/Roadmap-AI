import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import SuccessGauge from './SuccessGauge';
import { CalendarClock, CheckCircle2, Download, Printer, Share2 } from 'lucide-react';
import { fadeUp, stagger } from '../../lib/motionVariants';
import type { RoadmapRequest } from '../../services/api';

interface RoadmapResultProps {
  success: number;
  roadmap: string;
  request?: RoadmapRequest | null;
  onDownloadPdf: () => void;
  onShare: () => Promise<void>;
  onPrint: () => void;
}

export type TimelinePhase = {
  phase: string;
  timeline: string;
  technologies: string[];
  outcome: string;
};

const knownTechnologies = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'Python',
  'Flask',
  'Django',
  'FastAPI',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Git',
  'GitHub',
  'Tailwind',
  'Testing',
  'Vitest',
  'Jest',
  'Cypress',
  'REST API',
  'GraphQL',
  'CI/CD',
  'System Design',
];

const cleanCell = (value: string) =>
  value
    .replace(/\*\*/g, '')
    .replace(/<br\s*\/?>/gi, ', ')
    .trim();

const parseTimelineTable = (roadmap: string): TimelinePhase[] => {
  const lines = roadmap.split('\n');
  const phases: TimelinePhase[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|') || /^(\|\s*-+)/.test(trimmed)) {
      continue;
    }

    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map(cleanCell);

    if (cells.length < 4 || cells[0].toLowerCase() === 'phase') {
      continue;
    }

    phases.push({
      phase: cells[0],
      timeline: cells[1],
      technologies: cells[2].split(/,|\/| and /i).map((tech) => tech.trim()).filter(Boolean).slice(0, 4),
      outcome: cells[3],
    });
  }

  return phases.slice(0, 6);
};

const extractTechnologies = (roadmap: string, request?: RoadmapRequest | null) => {
  const lowerRoadmap = roadmap.toLowerCase();
  const fromText = knownTechnologies.filter((tech) => lowerRoadmap.includes(tech.toLowerCase()));
  const fromSkills = request?.skills ?? [];
  const combined = [...fromSkills, ...fromText]
    .map((tech) => tech.trim())
    .filter(Boolean);

  return Array.from(new Set(combined)).slice(0, 12);
};

const getTimelineLabel = (index: number, total: number, request?: RoadmapRequest | null) => {
  if (!request?.deadline) {
    const start = index * 2 + 1;
    return `Week ${start}-${start + 1}`;
  }

  const deadlineTime = new Date(request.deadline).getTime();
  const now = Date.now();
  const totalWeeks = Math.max(4, Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24 * 7)));
  const weeksPerPhase = Math.max(1, Math.ceil(totalWeeks / total));
  const start = index * weeksPerPhase + 1;
  const end = Math.min(totalWeeks, start + weeksPerPhase - 1);
  return start === end ? `Week ${start}` : `Week ${start}-${end}`;
};

const fallbackTimeline = (roadmap: string, request?: RoadmapRequest | null): TimelinePhase[] => {
  const techs = extractTechnologies(roadmap, request);
  const phases = [
    { phase: 'Foundation', outcome: 'Close skill gaps and setup tools' },
    { phase: 'Core Skills', outcome: 'Build working feature-level confidence' },
    { phase: 'Integration', outcome: 'Connect technologies into real workflows' },
    { phase: 'Portfolio Project', outcome: 'Ship a complete proof-of-work project' },
    { phase: 'Interview Ready', outcome: 'Review, polish, and practice delivery' },
  ];

  return phases.map((phase, index) => {
    const start = Math.floor((index * techs.length) / phases.length);
    const end = Math.max(start + 1, Math.floor(((index + 1) * techs.length) / phases.length));
    return {
      ...phase,
      timeline: getTimelineLabel(index, phases.length, request),
      technologies: techs.slice(start, end).length ? techs.slice(start, end) : ['Practice', 'Projects'],
    };
  });
};

export const buildTimeline = (roadmap: string, request?: RoadmapRequest | null) => {
  const table = parseTimelineTable(roadmap);
  return table.length >= 3 ? table : fallbackTimeline(roadmap, request);
};

export const extractSummaryBullets = (roadmap: string) => {
  const bullets = roadmap
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''))
    .filter((line) => line.length > 12)
    .slice(0, 4);

  return bullets.length
    ? bullets
    : ['Follow the phases from fundamentals to project work.', 'Use weekly milestones to make progress visible.', 'Build proof-of-work projects as you learn.', 'Review and adjust the plan every week.'];
};

const RoadmapResult: React.FC<RoadmapResultProps> = ({ success, roadmap, request, onDownloadPdf, onShare, onPrint }) => {
  const timeline = useMemo(() => buildTimeline(roadmap, request), [roadmap, request]);
  const summary = useMemo(() => extractSummaryBullets(roadmap), [roadmap]);

  return (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="result-card">
      <div className="result-header">
        <div>
          <span className="eyebrow">Analysis complete</span>
          <h2>{request?.goal ? `${request.goal} Roadmap` : 'Your Roadmap'}</h2>
          <p>Readable plan with connected technologies, timeline, and weekly actions.</p>
        </div>
        <SuccessGauge score={success} />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="readable-summary">
        {summary.map((item) => (
          <motion.div variants={fadeUp} className="summary-point" key={item}>
            <CheckCircle2 size={16} />
            <p>{item}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="tech-timeline-card">
        <div className="timeline-heading">
          <div>
            <span className="eyebrow">Technology Timeline</span>
            <h3>Connected roadmap graph</h3>
          </div>
          <span className="timeline-hours">
            <CalendarClock size={15} />
            {request?.hours ?? 0}h/week
          </span>
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
                  {phase.technologies.map((tech) => (
                    <span key={`${phase.phase}-${tech}`}>{tech}</span>
                  ))}
                </div>
                <p>{phase.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prose roadmap-markdown human-readable-roadmap">
        <ReactMarkdown>{roadmap}</ReactMarkdown>
      </div>

      <div className="result-actions">
        <button className="btn-secondary" type="button" onClick={onDownloadPdf}>
          <Download size={17} />
          Download PDF
        </button>
        <button className="btn-secondary" type="button" onClick={() => void onShare()}>
          <Share2 size={17} />
          Share
        </button>
        <button className="btn-secondary" type="button" onClick={onPrint}>
          <Printer size={17} />
          Print
        </button>
      </div>
    </motion.section>
  );
};

export default RoadmapResult;
