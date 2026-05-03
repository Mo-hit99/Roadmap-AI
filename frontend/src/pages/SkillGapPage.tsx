import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertOctagon, Lightbulb, ArrowUpRight, Loader2 } from 'lucide-react';
import { mentorService } from '../services/api';
import type { SkillGapResponse } from '../services/api';
import { fadeUp, stagger } from '../lib/motionVariants';

const SkillGapPage: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const skillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await mentorService.analyzeSkillGaps(goal.trim(), skillsList);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skillgap-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Career Tools</span>
          <h1>Skill Gap Analyzer</h1>
        </div>
      </div>

      <div className="skillgap-layout">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="skillgap-form-card"
        >
          <div className="form-card-heading">
            <div>
              <h2>Compare Skills</h2>
              <p>See what you're missing for your target role.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="roadmap-form">
            <label className="form-label">
              <span>Target Role</span>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. DevOps Engineer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              <span>Current Skills</span>
              <textarea
                className="input-field textarea-field"
                placeholder="e.g. Linux, Bash, Python, Git"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <p className="field-help">Comma-separated list of skills you currently have.</p>
            </label>
            <button type="submit" disabled={loading} className="btn-primary submit-roadmap">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={18} />
                  Analyze Gaps
                </>
              )}
            </button>
          </form>
        </motion.section>

        <div className="skillgap-results">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="error-banner"
              >
                {error}
              </motion.div>
            )}

            {analysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="skillgap-analysis"
              >
                {/* Summary */}
                {analysis.summary && (
                  <div className="skillgap-summary-card">
                    <p>{analysis.summary}</p>
                  </div>
                )}

                {/* Critical Skills */}
                {analysis.critical.length > 0 && (
                  <section className="skillgap-section critical">
                    <div className="skillgap-section-header">
                      <AlertOctagon size={18} />
                      <h3>Missing Critical Skills</h3>
                      <span className="skillgap-count">{analysis.critical.length}</span>
                    </div>
                    <motion.div variants={stagger} initial="hidden" animate="show" className="skillgap-list">
                      {analysis.critical.map((item) => (
                        <motion.div key={item.skill} variants={fadeUp} className="skillgap-item critical">
                          <div className="skillgap-item-header">
                            <span className="skillgap-chip critical">{item.skill}</span>
                            <span className="skillgap-priority-badge">High Priority</span>
                          </div>
                          <p>{item.reason}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                )}

                {/* Optional Skills */}
                {analysis.optional.length > 0 && (
                  <section className="skillgap-section optional">
                    <div className="skillgap-section-header">
                      <Lightbulb size={18} />
                      <h3>Optional Skills</h3>
                      <span className="skillgap-count">{analysis.optional.length}</span>
                    </div>
                    <motion.div variants={stagger} initial="hidden" animate="show" className="skillgap-list">
                      {analysis.optional.map((item) => (
                        <motion.div key={item.skill} variants={fadeUp} className="skillgap-item optional">
                          <div className="skillgap-item-header">
                            <span className="skillgap-chip optional">{item.skill}</span>
                            <span className="skillgap-priority-badge optional">Nice to Have</span>
                          </div>
                          <p>{item.reason}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                )}

                {/* Priority Order */}
                {analysis.priority_order.length > 0 && (
                  <section className="skillgap-section priority">
                    <div className="skillgap-section-header">
                      <ArrowUpRight size={18} />
                      <h3>Priority Order</h3>
                    </div>
                    <div className="skillgap-priority-list">
                      {analysis.priority_order.map((skill, index) => (
                        <div key={skill} className="skillgap-priority-row">
                          <span className="priority-rank">#{index + 1}</span>
                          <span className="priority-skill">{skill}</span>
                          <div className="priority-bar-wrap">
                            <div
                              className="priority-bar"
                              style={{
                                width: `${Math.max(10, 100 - index * (80 / Math.max(analysis.priority_order.length - 1, 1)))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-result">
                <Search size={38} />
                <h2>Analyze your gaps</h2>
                <p>Enter your goal and current skills to see what's missing.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
