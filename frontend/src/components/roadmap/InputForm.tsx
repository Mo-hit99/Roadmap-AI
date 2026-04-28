import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import type { RoadmapRequest } from '../../services/api';

interface InputFormProps {
  onSubmit: (data: RoadmapRequest) => void;
  onSuggestSkills: (goal: string) => Promise<string[]>;
  loading: boolean;
  skillsLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, onSuggestSkills, loading, skillsLoading }) => {
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState(10);
  const [deadline, setDeadline] = useState('');
  const [skillError, setSkillError] = useState<string | null>(null);
  const deadlineInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      goal,
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      hours,
      deadline
    });
  };

  const handleSuggestSkills = async () => {
    if (!goal.trim()) {
      setSkillError('Enter a primary goal first.');
      return;
    }

    setSkillError(null);
    try {
      const suggestions = await onSuggestSkills(goal.trim());
      setSkills(suggestions.join(', '));
    } catch (error: unknown) {
      setSkillError(error instanceof Error ? error.message : 'Failed to generate skills.');
    }
  };

  const handleOpenDatePicker = () => {
    const input = deadlineInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="roadmap-form-card"
    >
      <div className="form-card-heading">
        <div>
          <h2>Generator</h2>
          <p>Define the target role, current skills, and planning window.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="roadmap-form">
        <label className="form-label">
          <span>
            Primary Goal
          </span>
          <input
            type="text"
            placeholder="e.g. Senior HR Executive"
            className="input-field"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </label>

        <label className="form-label">
          <div className="label-row">
            <span>
              Current Skills
            </span>
            <button
              type="button"
              className="btn-secondary skill-suggest-button"
              onClick={handleSuggestSkills}
              disabled={skillsLoading || !goal.trim()}
            >
              {skillsLoading ? <Loader2 className="animate-spin" size={16} /> :""}
              Generate from Goal
            </button>
          </div>
          <textarea
            placeholder="e.g. Payroll, Excel, PF filing"
            className="input-field textarea-field"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
          <p className="field-help">Use your existing skills, or let AI draft a starting list from the primary goal.</p>
          {skillError ? <p className="field-error">{skillError}</p> : null}
        </label>

        <div className="form-row">
          <label className="form-label">
            <span>
              Hours/Week
            </span>
            <input
              type="number"
              className="input-field"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              min="1"
              required
            />
          </label>
          <div>
            <label className="form-label">
              <span>
                Target Date
              </span>
              <div className="date-input-wrap">
                <input
                  ref={deadlineInputRef}
                  type="date"
                  className="input-field date-field"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="date-picker-button"
                  onClick={handleOpenDatePicker}
                  aria-label="Open calendar"
                >
                  <Calendar size={18} className="date-input-icon" aria-hidden="true" />
                </button>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary submit-roadmap">
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Generate Roadmap
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </motion.section>
  );
};

export default InputForm;
