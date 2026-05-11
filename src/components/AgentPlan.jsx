import { useState } from "react";

const initialTasks = [
  {
    id: "1",
    title: "Research Project Requirements",
    description: "Gather all necessary information about project scope and requirements",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Interview stakeholders",
        description: "Conduct interviews with key stakeholders to understand needs",
        status: "completed",
        priority: "high",
        tools: ["communication-agent", "meeting-scheduler"],
      },
      {
        id: "1.2",
        title: "Review existing documentation",
        description: "Go through all available documentation and extract requirements",
        status: "in-progress",
        priority: "medium",
        tools: ["file-system", "browser"],
      },
      {
        id: "1.3",
        title: "Compile findings report",
        description: "Create a comprehensive report of all gathered information",
        status: "need-help",
        priority: "medium",
        tools: ["file-system", "markdown-processor"],
      },
    ],
  },
  {
    id: "2",
    title: "Design System Architecture",
    description: "Create the overall system architecture based on requirements",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "2.1",
        title: "Define component structure",
        description: "Map out all required components and their interactions",
        status: "pending",
        priority: "high",
        tools: ["architecture-planner", "diagramming-tool"],
      },
      {
        id: "2.2",
        title: "Create data flow diagrams",
        description: "Design diagrams showing how data will flow through the system",
        status: "pending",
        priority: "medium",
        tools: ["diagramming-tool", "file-system"],
      },
      {
        id: "2.3",
        title: "Document API specifications",
        description: "Write detailed specifications for all APIs in the system",
        status: "pending",
        priority: "high",
        tools: ["api-designer", "openapi-generator"],
      },
    ],
  },
  {
    id: "3",
    title: "Implementation Planning",
    description: "Create a detailed plan for implementing the system",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["1", "2"],
    subtasks: [
      {
        id: "3.1",
        title: "Resource allocation",
        description: "Determine required resources and allocate them to tasks",
        status: "pending",
        priority: "medium",
        tools: ["project-manager", "resource-calculator"],
      },
      {
        id: "3.2",
        title: "Timeline development",
        description: "Create a timeline with milestones and deadlines",
        status: "pending",
        priority: "high",
        tools: ["timeline-generator", "gantt-chart-creator"],
      },
      {
        id: "3.3",
        title: "Risk assessment",
        description: "Identify potential risks and develop mitigation strategies",
        status: "pending",
        priority: "medium",
        tools: ["risk-analyzer"],
      },
    ],
  },
  {
    id: "4",
    title: "Development Environment Setup",
    description: "Set up all necessary tools and environments for development",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "4.1",
        title: "Install development tools",
        description: "Set up IDEs, version control, and other necessary development tools",
        status: "pending",
        priority: "high",
        tools: ["shell", "package-manager"],
      },
      {
        id: "4.2",
        title: "Configure CI/CD pipeline",
        description: "Set up continuous integration and deployment pipelines",
        status: "pending",
        priority: "medium",
        tools: ["github-actions", "gitlab-ci", "jenkins-connector"],
      },
      {
        id: "4.3",
        title: "Set up testing framework",
        description: "Configure automated testing frameworks for the project",
        status: "pending",
        priority: "high",
        tools: ["test-runner", "shell"],
      },
    ],
  },
  {
    id: "5",
    title: "Initial Development Sprint",
    description: "Execute the first development sprint based on the plan",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["4"],
    subtasks: [
      {
        id: "5.1",
        title: "Implement core features",
        description: "Develop the essential features identified in the requirements",
        status: "pending",
        priority: "high",
        tools: ["code-assistant", "github", "file-system", "shell"],
      },
      {
        id: "5.2",
        title: "Perform unit testing",
        description: "Create and execute unit tests for implemented features",
        status: "pending",
        priority: "medium",
        tools: ["test-runner", "code-coverage-analyzer"],
      },
      {
        id: "5.3",
        title: "Document code",
        description: "Create documentation for the implemented code",
        status: "pending",
        priority: "low",
        tools: ["documentation-generator", "markdown-processor"],
      },
    ],
  },
];

const STATUS_SEQUENCE = ["completed", "in-progress", "pending", "need-help", "failed"];

const STATUS_META = {
  completed: {
    label: "completed",
    symbol: "✓",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.14)",
    border: "rgba(34, 197, 94, 0.28)",
  },
  "in-progress": {
    label: "in-progress",
    symbol: "◌",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.14)",
    border: "rgba(59, 130, 246, 0.28)",
  },
  "need-help": {
    label: "need-help",
    symbol: "!",
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.14)",
    border: "rgba(234, 179, 8, 0.28)",
  },
  failed: {
    label: "failed",
    symbol: "×",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.14)",
    border: "rgba(239, 68, 68, 0.28)",
  },
  pending: {
    label: "pending",
    symbol: "",
    color: "var(--text, #8a8aa0)",
    bg: "var(--social-bg, rgba(148, 163, 184, 0.12))",
    border: "var(--border, rgba(148, 163, 184, 0.24))",
  },
};

const agentPlanStyles = `
.agent-plan {
  --agent-plan-bg: var(--bg, #08080c);
  --agent-plan-card: var(--cor-fundo-2, var(--social-bg, #14141e));
  --agent-plan-surface: var(--code-bg, rgba(148, 163, 184, 0.08));
  --agent-plan-border: var(--cor-borda, var(--border, #2a2a3a));
  --agent-plan-text: var(--cor-texto, var(--text-h, #e8e8f8));
  --agent-plan-muted: var(--text-muted, var(--text, #8a8aa0));
  --agent-plan-faint: color-mix(in srgb, var(--agent-plan-muted) 66%, transparent);
  --agent-plan-accent: var(--accent, #10b981);
  background: var(--agent-plan-bg);
  color: var(--agent-plan-text);
  font-family: var(--sans, system-ui, "Segoe UI", Roboto, sans-serif);
  height: 100%;
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
  text-align: left;
}

.agent-plan,
.agent-plan * {
  box-sizing: border-box;
}

.agent-plan__card {
  background: var(--agent-plan-card);
  border: 1px solid var(--agent-plan-border);
  border-radius: 8px;
  box-shadow: var(--shadow, 0 10px 24px rgba(0, 0, 0, 0.18));
  overflow: hidden;
  animation: agent-plan-enter 0.3s cubic-bezier(0.2, 0.65, 0.3, 0.9);
}

.agent-plan__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 16px;
}

.agent-plan__task {
  --agent-plan-level: 0;
  animation: agent-plan-enter 0.22s cubic-bezier(0.2, 0.65, 0.3, 0.9);
}

.agent-plan__task + .agent-plan__task {
  padding-top: 8px;
}

.agent-plan__task-row,
.agent-plan__subtask-row {
  align-items: center;
  border-radius: 6px;
  display: flex;
  gap: 8px;
  min-width: 0;
  padding: 6px 8px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.agent-plan__task-row {
  margin-left: calc(var(--agent-plan-level) * 14px);
}

.agent-plan__task-row:hover,
.agent-plan__subtask-row:hover {
  background: color-mix(in srgb, var(--agent-plan-surface) 72%, transparent);
}

.agent-plan__status-button {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 22px;
  justify-content: center;
  padding: 0;
  width: 22px;
}

.agent-plan__status-button:hover .agent-plan__status-icon {
  transform: scale(1.08);
}

.agent-plan__status-button:active .agent-plan__status-icon {
  transform: scale(0.92);
}

.agent-plan__status-button:focus-visible,
.agent-plan__expand-button:focus-visible {
  border-radius: 6px;
  outline: 2px solid var(--agent-plan-accent);
  outline-offset: 2px;
}

.agent-plan__status-icon {
  --agent-plan-status-color: var(--agent-plan-muted);
  align-items: center;
  border: 1.5px solid var(--agent-plan-status-color);
  border-radius: 999px;
  color: var(--agent-plan-status-color);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  height: 18px;
  justify-content: center;
  line-height: 1;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
  width: 18px;
}

.agent-plan__status-icon--small {
  font-size: 9px;
  height: 15px;
  width: 15px;
}

.agent-plan__status-icon--completed {
  background: rgba(34, 197, 94, 0.13);
}

.agent-plan__status-icon--in-progress {
  border-style: dashed;
}

.agent-plan__status-icon--need-help,
.agent-plan__status-icon--failed {
  font-size: 10px;
}

.agent-plan__expand-button {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 1 1 auto;
  font: inherit;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
  padding: 0;
  text-align: left;
}

.agent-plan__title,
.agent-plan__subtask-title {
  color: var(--agent-plan-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-plan__title {
  flex: 1 1 auto;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
}

.agent-plan__subtask-title {
  font-size: 13px;
  line-height: 1.4;
}

.agent-plan__title.is-completed,
.agent-plan__subtask-title.is-completed {
  color: var(--agent-plan-muted);
  text-decoration: line-through;
}

.agent-plan__meta {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  min-width: 0;
}

.agent-plan__deps,
.agent-plan__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.agent-plan__chip,
.agent-plan__badge {
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  min-height: 20px;
  padding: 4px 7px;
  white-space: nowrap;
}

.agent-plan__chip {
  background: color-mix(in srgb, var(--agent-plan-surface) 82%, transparent);
  border: 1px solid var(--agent-plan-border);
  color: var(--agent-plan-muted);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.agent-plan__chip:hover {
  border-color: var(--agent-plan-accent);
  transform: translateY(-1px);
}

.agent-plan__badge {
  --agent-plan-status-bg: var(--agent-plan-surface);
  --agent-plan-status-border: var(--agent-plan-border);
  --agent-plan-status-color: var(--agent-plan-muted);
  background: var(--agent-plan-status-bg);
  border: 1px solid var(--agent-plan-status-border);
  color: var(--agent-plan-status-color);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.agent-plan__badge-pulse {
  animation: agent-plan-badge 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.agent-plan__subtasks {
  margin-left: calc(var(--agent-plan-level) * 14px);
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  position: relative;
  transition:
    max-height 0.25s cubic-bezier(0.2, 0.65, 0.3, 0.9),
    opacity 0.2s ease,
    visibility 0.2s ease;
  visibility: hidden;
}

.agent-plan__subtasks.is-open {
  max-height: 620px;
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}

.agent-plan__subtasks::before {
  border-left: 2px dashed color-mix(in srgb, var(--agent-plan-muted) 34%, transparent);
  bottom: 6px;
  content: "";
  left: 19px;
  position: absolute;
  top: 2px;
}

.agent-plan__subtask-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  margin: 4px 8px 6px 12px;
  padding: 0 0 0 24px;
  position: relative;
  z-index: 1;
}

.agent-plan__subtask {
  animation: agent-plan-subtask 0.2s cubic-bezier(0.2, 0.65, 0.3, 0.9);
}

.agent-plan__details {
  border-left: 1px dashed color-mix(in srgb, var(--agent-plan-muted) 34%, transparent);
  color: var(--agent-plan-muted);
  font-size: 12px;
  line-height: 1.55;
  margin: 2px 0 0 20px;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding-left: 14px;
  pointer-events: none;
  transition:
    max-height 0.25s cubic-bezier(0.2, 0.65, 0.3, 0.9),
    opacity 0.2s ease,
    padding-top 0.2s ease,
    padding-bottom 0.2s ease,
    visibility 0.2s ease;
  visibility: hidden;
}

.agent-plan__details.is-open {
  max-height: 180px;
  opacity: 1;
  padding-bottom: 6px;
  padding-top: 4px;
  pointer-events: auto;
  visibility: visible;
}

.agent-plan__description {
  margin: 0;
}

.agent-plan__tools-wrap {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.agent-plan__tools-label {
  color: var(--agent-plan-muted);
  font-size: 11px;
  font-weight: 800;
}

@keyframes agent-plan-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes agent-plan-subtask {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes agent-plan-badge {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@media (max-width: 640px) {
  .agent-plan {
    padding: 6px;
  }

  .agent-plan__list {
    padding: 10px;
  }

  .agent-plan__expand-button {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .agent-plan__meta {
    max-width: 100%;
  }

  .agent-plan__title,
  .agent-plan__subtask-title {
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-plan *,
  .agent-plan *::before,
  .agent-plan *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.pending;
}

function getNextStatus(status) {
  const currentIndex = STATUS_SEQUENCE.indexOf(status);
  return STATUS_SEQUENCE[(currentIndex + 1) % STATUS_SEQUENCE.length];
}

function statusStyle(status) {
  const meta = getStatusMeta(status);
  return {
    "--agent-plan-status-bg": meta.bg,
    "--agent-plan-status-border": meta.border,
    "--agent-plan-status-color": meta.color,
  };
}

function classNames(...names) {
  return names.filter(Boolean).join(" ");
}

function StatusIcon({ status, small = false }) {
  const meta = getStatusMeta(status);

  return (
    <span
      aria-hidden="true"
      className={classNames(
        "agent-plan__status-icon",
        `agent-plan__status-icon--${status}`,
        small && "agent-plan__status-icon--small",
      )}
      style={{ "--agent-plan-status-color": meta.color }}
    >
      {meta.symbol}
    </span>
  );
}

export default function AgentPlan() {
  const [tasks, setTasks] = useState(initialTasks);
  const [expandedTasks, setExpandedTasks] = useState(["1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState({});

  function toggleTaskExpansion(taskId) {
    setExpandedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  }

  function toggleSubtaskExpansion(taskId, subtaskId) {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function toggleTaskStatus(taskId) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        const newStatus = getNextStatus(task.status);

        return {
          ...task,
          status: newStatus,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            status: newStatus === "completed" ? "completed" : subtask.status,
          })),
        };
      }),
    );
  }

  function toggleSubtaskStatus(taskId, subtaskId) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        const updatedSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id !== subtaskId) return subtask;
          return {
            ...subtask,
            status: subtask.status === "completed" ? "pending" : "completed",
          };
        });
        const allSubtasksCompleted = updatedSubtasks.every(
          (subtask) => subtask.status === "completed",
        );

        return {
          ...task,
          subtasks: updatedSubtasks,
          status: allSubtasksCompleted
            ? "completed"
            : task.status === "completed"
              ? "in-progress"
              : task.status,
        };
      }),
    );
  }

  return (
    <div className="agent-plan">
      <style>{agentPlanStyles}</style>
      <section className="agent-plan__card" aria-label="Agent plan">
        <ul className="agent-plan__list">
          {tasks.map((task) => {
            const isExpanded = expandedTasks.includes(task.id);
            const isCompleted = task.status === "completed";

            return (
              <li
                className="agent-plan__task"
                key={task.id}
                style={{ "--agent-plan-level": task.level || 0 }}
              >
                <div className="agent-plan__task-row">
                  <button
                    type="button"
                    className="agent-plan__status-button"
                    onClick={() => toggleTaskStatus(task.id)}
                    aria-label={`Change status for ${task.title}`}
                    title={`Status: ${task.status}`}
                  >
                    <StatusIcon status={task.status} />
                  </button>

                  <button
                    type="button"
                    className="agent-plan__expand-button"
                    onClick={() => toggleTaskExpansion(task.id)}
                    aria-expanded={isExpanded}
                  >
                    <span
                      className={classNames("agent-plan__title", isCompleted && "is-completed")}
                      title={task.description}
                    >
                      {task.title}
                    </span>

                    <span className="agent-plan__meta">
                      {task.dependencies.length > 0 && (
                        <span className="agent-plan__deps" aria-label="Dependencies">
                          {task.dependencies.map((dependency) => (
                            <span className="agent-plan__chip" key={dependency}>
                              {dependency}
                            </span>
                          ))}
                        </span>
                      )}

                      <span
                        className="agent-plan__badge agent-plan__badge-pulse"
                        key={task.status}
                        style={statusStyle(task.status)}
                      >
                        {getStatusMeta(task.status).label}
                      </span>
                    </span>
                  </button>
                </div>

                {task.subtasks.length > 0 && (
                  <div
                    className={classNames("agent-plan__subtasks", isExpanded && "is-open")}
                    aria-hidden={!isExpanded}
                  >
                    <ul className="agent-plan__subtask-list">
                      {task.subtasks.map((subtask) => {
                        const subtaskKey = `${task.id}-${subtask.id}`;
                        const isSubtaskExpanded = Boolean(expandedSubtasks[subtaskKey]);
                        const isSubtaskCompleted = subtask.status === "completed";

                        return (
                          <li className="agent-plan__subtask" key={subtask.id}>
                            <div className="agent-plan__subtask-row">
                              <button
                                type="button"
                                className="agent-plan__status-button"
                                onClick={() => toggleSubtaskStatus(task.id, subtask.id)}
                                aria-label={`Change status for ${subtask.title}`}
                                title={`Status: ${subtask.status}`}
                              >
                                <StatusIcon status={subtask.status} small />
                              </button>

                              <button
                                type="button"
                                className="agent-plan__expand-button"
                                onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}
                                aria-expanded={isSubtaskExpanded}
                              >
                                <span
                                  className={classNames(
                                    "agent-plan__subtask-title",
                                    isSubtaskCompleted && "is-completed",
                                  )}
                                >
                                  {subtask.title}
                                </span>
                              </button>
                            </div>

                            <div
                              className={classNames(
                                "agent-plan__details",
                                isSubtaskExpanded && "is-open",
                              )}
                              aria-hidden={!isSubtaskExpanded}
                            >
                              <p className="agent-plan__description">{subtask.description}</p>
                              {subtask.tools?.length > 0 && (
                                <div className="agent-plan__tools-wrap">
                                  <span className="agent-plan__tools-label">MCP Servers:</span>
                                  <span className="agent-plan__tools">
                                    {subtask.tools.map((tool) => (
                                      <span className="agent-plan__chip" key={tool}>
                                        {tool}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
