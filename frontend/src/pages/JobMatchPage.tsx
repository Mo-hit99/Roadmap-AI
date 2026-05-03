import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, AlertTriangle, TrendingUp, Loader2, Search } from 'lucide-react';
import { mentorService } from '../services/api';
import type { JobRole } from '../services/api';
import { fadeUp, stagger } from '../lib/motionVariants';

const JobMatchPage: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<JobRole[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const skillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await mentorService.matchJobs(goal.trim(), skillsList);
      if (result.error) {
        setError(result.error);
      }
      setRoles(result.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 75) return 'var(--status-success)';
    if (readiness >= 50) return 'var(--accent-gold)';
    if (readiness >= 25) return 'var(--accent-ember)';
    return 'var(--status-danger)';
  };

  return (
    <div className="jobmatch-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Career Tools</span>
          <h1>Job Role Matcher</h1>
        </div>
      </div>

      <div className="jobmatch-layout">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="jobmatch-form-card"
        >
          <div className="form-card-heading">
            <div>
              <h2>Your Profile</h2>
              <p>Enter your goal and skills to find matching roles.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="roadmap-form">
            <label className="form-label">
              <span>Target Role / Goal</span>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Full Stack Developer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              <span>Current Skills</span>
              <textarea
                className="input-field textarea-field"
                placeholder="e.g. HTML, CSS, JavaScript, React, Node.js"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <p className="field-help">Comma-separated list of your skills.</p>
            </label>
            <button type="submit" disabled={loading} className="btn-primary submit-roadmap">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={18} />
                  Find Matching Roles
                </>
              )}
            </button>
          </form>
        </motion.section>

        <div className="jobmatch-results">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="error-banner"
              >
                <AlertTriangle size={18} />
                {error}
              </motion.div>
            )}

            {roles && roles.length > 0 ? (
              <motion.div
                key="results"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="jobmatch-grid"
              >
                {roles.map((role, index) => (
                  <motion.article
                    key={`${role.title}-${index}`}
                    variants={fadeUp}
                    className="jobmatch-card"
                  >
                    <div className="jobmatch-card-header">
                      <div className="jobmatch-icon">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3>{role.title}</h3>
                        <p className="jobmatch-readiness-label">Readiness</p>
                      </div>
                      <div className="jobmatch-gauge">
                        <svg viewBox="0 0 80 80" className="readiness-ring">
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            className="ring-track"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            className="ring-fill"
                            style={{
                              strokeDasharray: `${(role.readiness / 100) * 201} 201`,
                              stroke: getReadinessColor(role.readiness),
                            }}
                          />
                        </svg>
                        <span className="ring-value">{role.readiness}%</span>
                      </div>
                    </div>

                    {role.missing_skills.length > 0 && (
                      <div className="jobmatch-section">
                        <h4><AlertTriangle size={14} /> Missing Skills</h4>
                        <div className="technology-chips missing-chips">
                          {role.missing_skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {role.suggestions.length > 0 && (
                      <div className="jobmatch-section">
                        <h4><TrendingUp size={14} /> Suggestions</h4>
                        <ul className="jobmatch-suggestions">
                          {role.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.article>
                ))}
              </motion.div>
            ) : roles !== null && roles.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-result"
              >
                <Briefcase size={38} />
                <h2>No roles matched</h2>
                <p>Try adjusting your goal or adding more skills.</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-result"
              >
                <Briefcase size={38} />
                <h2>Ready to match</h2>
                <p>Submit your profile to discover job roles that fit your skills.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JobMatchPage;
