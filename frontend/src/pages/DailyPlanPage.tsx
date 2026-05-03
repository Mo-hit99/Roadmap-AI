import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, BookOpen, Wrench, Trophy, Loader2, RefreshCw } from 'lucide-react';
import { mentorService } from '../services/api';
import type { DailyPlanDay } from '../services/api';
import { fadeUp, stagger } from '../lib/motionVariants';

const dayIcons = [CalendarDays, BookOpen, Wrench, Trophy, CalendarDays, BookOpen, Wrench];

const DailyPlanPage: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DailyPlanDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const skillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await mentorService.generateDailyPlan(goal.trim(), skillsList, hours);
      if (result.error) setError(result.error);
      setDays(result.days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!goal.trim() || loading) return;
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  return (
    <div className="dailyplan-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Career Tools</span>
          <h1>Daily Planner</h1>
        </div>
      </div>

      <div className="dailyplan-layout">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dailyplan-form-card"
        >
          <div className="form-card-heading">
            <div>
              <h2>Plan Config</h2>
              <p>Get a focused 7-day study plan.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="roadmap-form">
            <label className="form-label">
              <span>Goal</span>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Backend Developer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              <span>Current Skills</span>
              <textarea
                className="input-field textarea-field"
                placeholder="e.g. Python, Flask, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </label>
            <label className="form-label">
              <span>Hours/Week</span>
              <input
                type="number"
                className="input-field"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 10)}
                min={1}
              />
            </label>
            <button type="submit" disabled={loading} className="btn-primary submit-roadmap">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CalendarDays size={18} />
                  Generate 7-Day Plan
                </>
              )}
            </button>
          </form>
        </motion.section>

        <div className="dailyplan-results">
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

            {days && days.length > 0 ? (
              <div key="plan">
                <div className="dailyplan-header-row">
                  <h2>Your 7-Day Plan</h2>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleRegenerate}
                    disabled={loading}
                  >
                    <RefreshCw size={16} />
                    Regenerate
                  </button>
                </div>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="dailyplan-grid"
                >
                  {days.map((day, index) => {
                    const Icon = dayIcons[index % dayIcons.length];
                    return (
                      <motion.article
                        key={day.day}
                        variants={fadeUp}
                        className="dailyplan-card"
                      >
                        <div className="dailyplan-card-header">
                          <div className="dailyplan-day-badge">
                            <Icon size={16} />
                            <span>Day {day.day}</span>
                          </div>
                          <span className="dailyplan-label">{day.label}</span>
                        </div>
                        <div className="dailyplan-card-body">
                          <div className="dailyplan-item">
                            <BookOpen size={14} />
                            <div>
                              <strong>Learn</strong>
                              <p>{day.learning}</p>
                            </div>
                          </div>
                          <div className="dailyplan-item">
                            <Wrench size={14} />
                            <div>
                              <strong>Practice</strong>
                              <p>{day.practice}</p>
                            </div>
                          </div>
                          <div className="dailyplan-item">
                            <Trophy size={14} />
                            <div>
                              <strong>Outcome</strong>
                              <p>{day.outcome}</p>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              </div>
            ) : days !== null && days.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-result">
                <CalendarDays size={38} />
                <h2>Could not generate plan</h2>
                <p>Try adjusting your inputs and regenerating.</p>
              </motion.div>
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-result">
                <CalendarDays size={38} />
                <h2>Plan your week</h2>
                <p>Submit your goal and skills to get a day-by-day learning plan.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanPage;
