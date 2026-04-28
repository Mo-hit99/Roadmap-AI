import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../lib/motionVariants';

const summaryStats = [
  { label: 'Completion', value: '38', suffix: '%', delta: '+12% this week', tone: 'good' },
  { label: 'Est. Timeline', value: '8', suffix: 'mo', delta: '1mo behind', tone: 'warn' },
  { label: 'Skills Unlocked', value: '7', suffix: '/18', delta: '+2 this month', tone: 'good' },
];

const feed = [
  { color: '#f59e0b', text: 'Focus on memoization and bundle splitting this week.', time: 'AI - 2h ago' },
  { color: '#22c55e', text: 'Testing milestone 35% - great pace, add Vitest mocks.', time: 'AI - 6h ago' },
  { color: '#e8754a', text: 'Timeline slipping - reduce scope or accelerate Phase 2.', time: 'AI - 1d ago' },
  { color: '#a89880', text: 'New resource: design systems notes - high signal.', time: 'AI - 2d ago' },
];

const node = (
  x: number,
  y: number,
  label: string,
  sub: string,
  status: 'done' | 'active' | 'locked',
  width = 88,
) => {
  const classes = {
    done: 'roadmap-node done',
    active: 'roadmap-node active',
    locked: 'roadmap-node locked',
  };

  return (
    <g className={classes[status]} key={`${label}-${x}-${y}`}>
      <rect x={x} y={y} width={width} height="38" rx="8" />
      {status === 'active' && <circle cx={x + width - 8} cy={y + 8} r="4" />}
      <text x={x + 14} y={y + 18} className="node-title">{label}</text>
      <text x={x + 14} y={y + 30} className="node-subtitle">{sub}</text>
    </g>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="roadmap-dashboard">
      <div className="roadmap-main">
        <motion.section variants={fadeUp} initial="hidden" animate="show" className="graph-panel">
          <div className="graph-panel-header">
            <div>
              <div className="panel-title">Learning Roadmap</div>
              <div className="panel-sub">5 phases - 18 milestones</div>
            </div>
            <div className="pill pill-ghost">Phase 2 / 5</div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-fill" />
          </div>

          <div className="graph-container">
            <svg width="100%" viewBox="0 0 460 320" className="roadmap-svg" role="img" aria-label="Learning roadmap graph">
              <defs>
                <marker id="roadmap-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>

              <text x="38" y="14" className="phase-label">FOUNDATION</text>
              <text x="132" y="14" className="phase-label active">CURRENT</text>
              <text x="222" y="14" className="phase-label">ADVANCED</text>
              <text x="316" y="14" className="phase-label">LEADERSHIP</text>
              <text x="408" y="14" className="phase-label">STAFF</text>

              {[96, 188, 280, 372].map((x) => (
                <line key={x} x1={x} y1="20" x2={x} y2="305" className="phase-guide" />
              ))}
              <rect x="100" y="20" width="88" height="286" rx="6" className="active-column" />

              <line x1="66" y1="72" x2="144" y2="72" className="connector done" markerEnd="url(#roadmap-arrow)" />
              <line x1="66" y1="144" x2="144" y2="144" className="connector done" markerEnd="url(#roadmap-arrow)" />
              <line x1="66" y1="216" x2="144" y2="144" className="connector done muted" markerEnd="url(#roadmap-arrow)" />
              <line x1="166" y1="72" x2="236" y2="72" className="connector pending" markerEnd="url(#roadmap-arrow)" />
              <line x1="166" y1="144" x2="236" y2="144" className="connector pending" markerEnd="url(#roadmap-arrow)" />
              <line x1="166" y1="108" x2="236" y2="216" className="connector pending light" markerEnd="url(#roadmap-arrow)" />
              <line x1="258" y1="72" x2="328" y2="108" className="connector pending light" markerEnd="url(#roadmap-arrow)" />
              <line x1="258" y1="144" x2="328" y2="108" className="connector pending light" markerEnd="url(#roadmap-arrow)" />
              <line x1="258" y1="216" x2="328" y2="180" className="connector pending light" markerEnd="url(#roadmap-arrow)" />
              <line x1="350" y1="108" x2="420" y2="180" className="connector pending light" markerEnd="url(#roadmap-arrow)" />
              <line x1="350" y1="180" x2="420" y2="180" className="connector pending light" markerEnd="url(#roadmap-arrow)" />

              {node(22, 53, 'React Core', 'Complete', 'done')}
              {node(22, 125, 'TypeScript', 'Complete', 'done')}
              {node(22, 197, 'CSS / Design', 'Complete', 'done')}
              {node(110, 53, 'Perf. Optim.', '60%', 'active')}
              {node(110, 125, 'Testing', '35%', 'active')}
              {node(200, 53, 'Arch. Design', 'Locked', 'locked')}
              {node(200, 125, 'State Mastery', 'Locked', 'locked')}
              {node(200, 197, 'API Design', 'Locked', 'locked')}
              {node(292, 89, 'Tech Leading', 'Locked', 'locked')}
              {node(292, 161, 'Mentorship', 'Locked', 'locked')}
              {node(384, 161, 'Staff Eng', 'Goal', 'locked', 72)}

              <rect x="22" y="255" width="10" height="10" rx="2" className="legend-box done" />
              <text x="36" y="264" className="legend-text">Completed</text>
              <rect x="100" y="255" width="10" height="10" rx="2" className="legend-box active" />
              <text x="114" y="264" className="legend-text">Active</text>
              <rect x="158" y="255" width="10" height="10" rx="2" className="legend-box locked" />
              <text x="172" y="264" className="legend-text">Upcoming</text>
            </svg>
          </div>
        </motion.section>

        <motion.div variants={stagger} initial="hidden" animate="show" className="summary-grid">
          {summaryStats.map((stat) => (
            <motion.article variants={fadeUp} className="stat-card compact" key={stat.label}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">
                {stat.value}
                <span>{stat.suffix}</span>
              </div>
              <div className={`stat-delta ${stat.tone === 'warn' ? 'warn' : ''}`}>{stat.delta}</div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <aside className="right-col">
        <div className="stat-card compact">
          <div className="stat-label">Success Score</div>
          <div className="score-row">
            <div className="stat-value large">78</div>
            <span>/100</span>
          </div>
          <div className="mini-progress">
            <div />
          </div>
          <div className="stat-delta">High confidence path</div>
        </div>

        <div className="feed-card">
          <div className="feed-title">AI Feed</div>
          {feed.map((item) => (
            <div className="feed-item" key={item.text}>
              <span className="feed-dot" style={{ background: item.color }} />
              <div>
                <div className="feed-text">{item.text}</div>
                <div className="feed-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
