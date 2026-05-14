import React, { useEffect, useState } from "react";
import "./App.css";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "R. Collier" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The harder you work, the greater you'll feel when you achieve it.", author: "Unknown" },
];
const todayQuote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

// ── Urgency helper — returns label + color based on days left ──
const getDueInfo = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { label: "Overdue!",      color: "#ef4444" };
  if (diff === 0) return { label: "Due today!",    color: "#ef4444" };
  if (diff === 1) return { label: "Due tomorrow",  color: "#f59e0b" };
  if (diff <= 3)  return { label: `In ${diff} days`, color: "#f59e0b" };
  if (diff <= 7)  return { label: `In ${diff} days`, color: "#3b82f6" };
  return           { label: `In ${diff} days`,    color: "#10b981" };
};

function App() {
  const today   = new Date().toLocaleString("en-US", { weekday: "long" });
  const hour    = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // ── Auth ─────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("studyUser");
    return s ? JSON.parse(s) : null;
  });
  const [authMode, setAuthMode]         = useState("login");
  const [authName, setAuthName]         = useState("");
  const [authEmail, setAuthEmail]       = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError]       = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearAuthForm = () => {
    setAuthName(""); setAuthEmail(""); setAuthPassword(""); setAuthError("");
  };

  const handleSignup = () => {
    if (!authName.trim())                            { setAuthError("Please enter your name."); return; }
    if (!authEmail.includes("@"))                    { setAuthError("Please enter a valid email."); return; }
    if (authPassword.length < 6)                     { setAuthError("Password must be at least 6 characters."); return; }
    const users = JSON.parse(localStorage.getItem("studyUsers") || "[]");
    if (users.find((u) => u.email.toLowerCase() === authEmail.toLowerCase())) {
      setAuthError("An account with this email already exists."); return;
    }
    const newUser = { name: authName.trim(), email: authEmail.trim().toLowerCase(), password: authPassword };
    localStorage.setItem("studyUsers", JSON.stringify([...users, newUser]));
    const loggedIn = { name: newUser.name, email: newUser.email };
    localStorage.setItem("studyUser", JSON.stringify(loggedIn));
    setUser(loggedIn); clearAuthForm();
  };

  const handleLogin = () => {
    if (!authEmail || !authPassword) { setAuthError("Please fill in all fields."); return; }
    const users = JSON.parse(localStorage.getItem("studyUsers") || "[]");
    const found = users.find((u) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword);
    if (!found) { setAuthError("Incorrect email or password."); return; }
    const loggedIn = { name: found.name, email: found.email };
    localStorage.setItem("studyUser", JSON.stringify(loggedIn));
    setUser(loggedIn); clearAuthForm();
  };

  const handleLogout = () => { localStorage.removeItem("studyUser"); setUser(null); };
  const firstName = user ? user.name.split(" ")[0] : "";

  // ── Dark mode ────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);

  // ── Weekly schedule ──────────────────────────────
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const s = localStorage.getItem("weeklySchedule");
    return s ? JSON.parse(s) : { Monday:[], Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Sunday:[] };
  });
  useEffect(() => { localStorage.setItem("weeklySchedule", JSON.stringify(weeklySchedule)); }, [weeklySchedule]);

  const [formDay, setFormDay]               = useState(today);
  const [className, setClassName]           = useState("");
  const [classTime, setClassTime]           = useState("");
  const [classEndTime, setClassEndTime]     = useState("");
  const [classRoom, setClassRoom]           = useState("");
  const [classProfessor, setClassProfessor] = useState("");
  const [classColor, setClassColor]         = useState("#7c5cff");
  const colorOptions = ["#7c5cff","#3b82f6","#10b981","#f59e0b","#ec4899","#ef4444","#14b8a6"];

  // ── Tasks ────────────────────────────────────────
  const defaultTasks = [
    { id: 1, text: "Read Chemistry Chapter 4",     done: false },
    { id: 2, text: "Draft Economics Essay Outline", done: false },
    { id: 3, text: "Submit Lab Report Part 2",      done: false, high: true },
    { id: 4, text: "Review Calculus Notes",         done: true },
  ];
  const [activePage, setActivePage] = useState("dashboard");
  const [tasks, setTasks] = useState(() => {
    const s = localStorage.getItem("studyTasks");
    return s ? JSON.parse(s) : defaultTasks;
  });
  const [newTask, setNewTask] = useState("");
  useEffect(() => { localStorage.setItem("studyTasks", JSON.stringify(tasks)); }, [tasks]);

  // ── Notes ────────────────────────────────────────
  const [notes, setNotes] = useState(localStorage.getItem("studyNotes") || "");
  useEffect(() => { localStorage.setItem("studyNotes", notes); }, [notes]);

  // ── Focus timer ──────────────────────────────────
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) setSeconds((s) => s - 1);
        else if (minutes > 0) { setMinutes((m) => m - 1); setSeconds(59); }
        else setIsRunning(false);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]);

  // ── 📆 DEADLINES (new!) ──────────────────────────
  const defaultDeadlines = [
    { id: 1, title: "History Term Paper", subject: "History",     dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], priority: "high",   done: false, color: "#ef4444" },
    { id: 2, title: "Math Quiz",          subject: "Mathematics", dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], priority: "medium", done: false, color: "#3b82f6" },
  ];
  const [deadlines, setDeadlines] = useState(() => {
    const s = localStorage.getItem("studyDeadlines");
    return s ? JSON.parse(s) : defaultDeadlines;
  });
  useEffect(() => { localStorage.setItem("studyDeadlines", JSON.stringify(deadlines)); }, [deadlines]);

  // Deadline form state
  const [dlTitle, setDlTitle]       = useState("");
  const [dlSubject, setDlSubject]   = useState("");
  const [dlDate, setDlDate]         = useState("");
  const [dlPriority, setDlPriority] = useState("medium");
  const [dlColor, setDlColor]       = useState("#7c5cff");

  // ── Handlers ─────────────────────────────────────
  const toggleTask    = (id) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask    = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const addTask       = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };

  const addSchedule = () => {
    if (!className.trim() || !classTime.trim()) return;
    setWeeklySchedule((prev) => ({
      ...prev,
      [formDay]: [...prev[formDay], { id: Date.now(), name: className, time: classTime, endTime: classEndTime, room: classRoom, professor: classProfessor, color: classColor }],
    }));
    setClassName(""); setClassTime(""); setClassEndTime(""); setClassRoom(""); setClassProfessor("");
  };
  const deleteSchedule = (id, day) =>
    setWeeklySchedule((prev) => ({ ...prev, [day]: prev[day].filter((i) => i.id !== id) }));

  const addDeadline = () => {
    if (!dlTitle.trim() || !dlDate) return;
    setDeadlines([...deadlines, { id: Date.now(), title: dlTitle.trim(), subject: dlSubject.trim(), dueDate: dlDate, priority: dlPriority, done: false, color: dlColor }]);
    setDlTitle(""); setDlSubject(""); setDlDate(""); setDlPriority("medium");
  };
  const toggleDeadline = (id) => setDeadlines(deadlines.map((d) => d.id === id ? { ...d, done: !d.done } : d));
  const deleteDeadline = (id) => setDeadlines(deadlines.filter((d) => d.id !== id));

  // ── Computed values ──────────────────────────────
  const completedTasks = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Upcoming deadlines for dashboard — pending only, sorted by date, top 4
  const upcomingDeadlines = [...deadlines]
    .filter((d) => !d.done)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  // ══════════════════════════════════════════
  // AUTH PAGE
  // ══════════════════════════════════════════
  if (!user) {
    return (
      <div className={`app ${darkMode ? "dark" : ""}`}>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-box">S</div>
              <h1>StudyBloom</h1>
            </div>
            <h2 className="auth-heading">
              {authMode === "login" ? "Welcome back! 👋" : "Create your account 🌱"}
            </h2>
            <p className="auth-subtitle">
              {authMode === "login"
                ? "Sign in to continue your study journey."
                : "Join StudyBloom and start studying smarter."}
            </p>

            {authError && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {authError}
              </div>
            )}

            {authMode === "signup" && (
              <div className="auth-field">
                <label>Your Name</label>
                <input type="text" placeholder="e.g. Naomi Johnson" value={authName}
                  onChange={(e) => { setAuthName(e.target.value); setAuthError(""); }} autoFocus />
              </div>
            )}
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" placeholder="you@university.edu" value={authEmail}
                onChange={(e) => { setAuthEmail(e.target.value); setAuthError(""); }}
                autoFocus={authMode === "login"} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={authMode === "signup" ? "Min. 6 characters" : "Enter your password"}
                  value={authPassword}
                  onChange={(e) => { setAuthPassword(e.target.value); setAuthError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
                />
                <button className="show-password-btn" onClick={() => setShowPassword(!showPassword)} type="button">
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" onClick={authMode === "login" ? handleLogin : handleSignup}>
              {authMode === "login" ? "Log In" : "Create Account"}
            </button>
            <p className="auth-switch">
              {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); clearAuthForm(); }}>
                {authMode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════
  const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );

  const renderPage = () => {
    switch (activePage) {

      // ─── TASKS ─────────────────────────────────
      case "tasks":
        return (
          <div className="card">
            <h3>✓ Task Manager</h3>
            <div className="task-input">
              <input type="text" placeholder="Add a new task..." value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <button onClick={addTask}>Add</button>
            </div>
            <div className="task-list">
              {tasks.length === 0 && <p className="empty-msg">No tasks yet — add one above!</p>}
              {tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.done ? "done" : ""} ${task.high ? "high-priority" : ""}`}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <span>{task.text}</span>
                  {task.high && <span className="badge">HIGH</span>}
                  <button className="task-delete-btn" onClick={() => deleteTask(task.id)}><TrashIcon /></button>
                </div>
              ))}
            </div>
          </div>
        );

      // ─── SCHEDULE ──────────────────────────────
      case "schedule":
        return (
          <div className="schedule-page">
            <div className="card form-card">
              <h3>➕ Add a Class</h3>
              <div className="schedule-form-grid">
                <div className="form-group"><label>Class Name *</label>
                  <input type="text" placeholder="e.g. Organic Chemistry" value={className} onChange={(e) => setClassName(e.target.value)} /></div>
                <div className="form-group"><label>Professor</label>
                  <input type="text" placeholder="e.g. Dr. Aris" value={classProfessor} onChange={(e) => setClassProfessor(e.target.value)} /></div>
                <div className="form-group"><label>Start Time *</label>
                  <input type="time" value={classTime} onChange={(e) => setClassTime(e.target.value)} /></div>
                <div className="form-group"><label>End Time</label>
                  <input type="time" value={classEndTime} onChange={(e) => setClassEndTime(e.target.value)} /></div>
                <div className="form-group"><label>Room / Hall</label>
                  <input type="text" placeholder="e.g. Hall B, Room 204" value={classRoom} onChange={(e) => setClassRoom(e.target.value)} /></div>
                <div className="form-group"><label>Day</label>
                  <select value={formDay} onChange={(e) => setFormDay(e.target.value)}>
                    {Object.keys(weeklySchedule).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select></div>
              </div>
              <div className="color-row">
                <label>Subject Colour</label>
                <div className="color-options">
                  {colorOptions.map((c) => (
                    <button key={c} className={`color-dot ${classColor === c ? "selected" : ""}`}
                      style={{ background: c }} onClick={() => setClassColor(c)} />
                  ))}
                </div>
              </div>
              <button className="add-class-btn" onClick={addSchedule}>Add Class</button>
            </div>
            <div className="card grid-card">
              <h3>📅 Your Weekly Timetable</h3>
              <p className="grid-subtitle">Set once — repeats every week automatically ✓</p>
              <div className="weekly-grid">
                {Object.keys(weeklySchedule).map((day) => (
                  <div key={day} className="day-column">
                    <div className={`day-header ${day === today ? "is-today" : ""}`}>
                      <span className="day-abbr">{day.slice(0, 3)}</span>
                      {day === today && <span className="today-dot" />}
                    </div>
                    {weeklySchedule[day].length === 0 ? <div className="empty-day">—</div> : (
                      [...weeklySchedule[day]].sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
                        <div key={item.id} className="class-card" style={{ borderLeftColor: item.color || "#7c5cff" }}>
                          <div className="class-card-body">
                            <span className="class-time-label">{item.time}{item.endTime ? ` – ${item.endTime}` : ""}</span>
                            <strong className="class-name">{item.name}</strong>
                            {item.professor && <span className="class-meta">{item.professor}</span>}
                            {item.room && <span className="class-meta class-room">{item.room}</span>}
                          </div>
                          <button className="card-delete-btn" onClick={() => deleteSchedule(item.id, day)}>✕</button>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // ─── 📆 DEADLINES (new!) ───────────────────
      case "deadlines":
        return (
          <div className="deadlines-page">
            {/* Add form */}
            <div className="card">
              <h3>➕ Add Assignment / Deadline</h3>
              <div className="deadline-form-grid">
                <div className="form-group">
                  <label>Assignment Title *</label>
                  <input type="text" placeholder="e.g. History Term Paper" value={dlTitle}
                    onChange={(e) => setDlTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDeadline()} />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" placeholder="e.g. History" value={dlSubject}
                    onChange={(e) => setDlSubject(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={dlDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDlDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={dlPriority} onChange={(e) => setDlPriority(e.target.value)}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
              <div className="color-row">
                <label>Subject Colour</label>
                <div className="color-options">
                  {colorOptions.map((c) => (
                    <button key={c} className={`color-dot ${dlColor === c ? "selected" : ""}`}
                      style={{ background: c }} onClick={() => setDlColor(c)} />
                  ))}
                </div>
              </div>
              <button className="add-class-btn" onClick={addDeadline}>Add Deadline</button>
            </div>

            {/* Full deadlines list */}
            <div className="card">
              <div className="deadlines-list-header">
                <h3>📋 All Assignments</h3>
                <div className="dl-counts">
                  <span className="dl-count-chip pending">
                    {deadlines.filter((d) => !d.done).length} pending
                  </span>
                  <span className="dl-count-chip submitted">
                    {deadlines.filter((d) => d.done).length} submitted
                  </span>
                </div>
              </div>

              {deadlines.length === 0 ? (
                <p className="empty-msg">No assignments yet — add one above!</p>
              ) : (
                <div className="deadlines-full-list">
                  {/* Pending */}
                  {deadlines.filter((d) => !d.done).length > 0 && (
                    <p className="dl-section-label">PENDING</p>
                  )}
                  {[...deadlines]
                    .filter((d) => !d.done)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map((d) => {
                      const { label, color } = getDueInfo(d.dueDate);
                      return (
                        <div key={d.id} className="deadline-row" style={{ borderLeftColor: d.color || "#7c5cff" }}>
                          <input type="checkbox" checked={d.done} onChange={() => toggleDeadline(d.id)} />
                          <div className="deadline-row-info">
                            <strong>{d.title}</strong>
                            {d.subject && <span className="dl-subject">{d.subject}</span>}
                          </div>
                          <span className="dl-due-badge" style={{ color, background: `${color}22` }}>
                            {label}
                          </span>
                          <span className={`dl-priority-badge priority-${d.priority}`}>
                            {d.priority.toUpperCase()}
                          </span>
                          <button className="task-delete-btn" onClick={() => deleteDeadline(d.id)}><TrashIcon /></button>
                        </div>
                      );
                    })}

                  {/* Submitted */}
                  {deadlines.filter((d) => d.done).length > 0 && (
                    <p className="dl-section-label" style={{ marginTop: "16px" }}>SUBMITTED</p>
                  )}
                  {[...deadlines]
                    .filter((d) => d.done)
                    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                    .map((d) => (
                      <div key={d.id} className="deadline-row deadline-done" style={{ borderLeftColor: d.color || "#7c5cff" }}>
                        <input type="checkbox" checked={d.done} onChange={() => toggleDeadline(d.id)} />
                        <div className="deadline-row-info">
                          <strong>{d.title}</strong>
                          {d.subject && <span className="dl-subject">{d.subject}</span>}
                        </div>
                        <span className="dl-due-badge" style={{ color: "#10b981", background: "#10b98122" }}>
                          ✓ Submitted
                        </span>
                        <button className="task-delete-btn" onClick={() => deleteDeadline(d.id)}><TrashIcon /></button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );

      // ─── FOCUS ─────────────────────────────────
      case "focus":
        return (
          <div className="card focus-page">
            <h3>🎯 Focus Mode</h3>
            <div className="preset-times">
              <button onClick={() => { setMinutes(25); setSeconds(0); setIsRunning(false); }}>25 min</button>
              <button onClick={() => { setMinutes(45); setSeconds(0); setIsRunning(false); }}>45 min</button>
              <button onClick={() => { setMinutes(60); setSeconds(0); setIsRunning(false); }}>1 hr</button>
              <button onClick={() => { setMinutes(120); setSeconds(0); setIsRunning(false); }}>2 hr</button>
            </div>
            <h2 className="countdown-display">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </h2>
            <div className="focus-buttons">
              <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? "Pause" : "Start"}</button>
              <button onClick={() => { setIsRunning(false); setMinutes(25); setSeconds(0); }}>Reset</button>
            </div>
          </div>
        );

      // ─── NOTES ─────────────────────────────────
      case "notes":
        return (
          <div className="card">
            <h3>📝 Notes</h3>
            <textarea placeholder="Write your notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        );

      // ─── DASHBOARD ─────────────────────────────
      default:
        return (
          <>
            <div className="quote-card">
              <svg className="quote-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.066 1.514-1.867 2.557-2.404L18.48 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003z"/>
              </svg>
              <div className="quote-text-wrap">
                <p className="quote-text">"{todayQuote.text}"</p>
                <span className="quote-author">— {todayQuote.author}</span>
              </div>
            </div>

            <div className="main-grid">
              {/* LEFT — Tasks */}
              <div className="left-column">
                <div className="card">
                  <h3>✓ Today's Tasks</h3>
                  <div className="task-list">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id} className={`task-item ${task.done ? "done" : ""} ${task.high ? "high-priority" : ""}`}>
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                        <span>{task.text}</span>
                        {task.high && <span className="badge">HIGH</span>}
                        <button className="task-delete-btn" onClick={() => deleteTask(task.id)}><TrashIcon /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — Schedule + Deadlines */}
              <div className="right-column">
                <div className="card">
                  <h3>📅 {today}'s Schedule</h3>
                  <div className="schedule-timeline">
                    {!weeklySchedule[today] || weeklySchedule[today].length === 0 ? (
                      <p className="empty-msg">No classes today — add some in Schedule!</p>
                    ) : (
                      [...weeklySchedule[today]]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => (
                          <div key={item.id} className="timeline-item">
                            <span className="timeline-time">{item.time}</span>
                            <div className="timeline-details" style={{ borderLeftColor: item.color || "#7c5cff" }}>
                              <strong>{item.name}</strong>
                              {item.professor && <p>{item.room} • {item.professor}</p>}
                              {!item.professor && item.room && <p>{item.room}</p>}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* ✅ DYNAMIC deadlines from state */}
                <div className="card">
                  <div className="deadlines-list-header">
                    <h3 className="deadlines-title">UPCOMING DEADLINES</h3>
                    <button className="view-all-btn" onClick={() => setActivePage("deadlines")}>
                      View all →
                    </button>
                  </div>

                  {upcomingDeadlines.length === 0 ? (
                    <p className="empty-msg">No upcoming deadlines 🎉</p>
                  ) : (
                    <div className="deadlines-grid-dashboard">
                      {upcomingDeadlines.map((d) => {
                        const { label, color } = getDueInfo(d.dueDate);
                        return (
                          <div key={d.id} className="deadline-chip">
                            <span className="dot" style={{ background: d.color || color }}></span>
                            <div className="deadline-chip-info">
                              <strong>{d.title}</strong>
                              <span style={{ color }}>{label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <div className="dashboard">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div>
            <div className="logo">
              <div className="logo-box">S</div>
              <h2>StudyBloom</h2>
            </div>

            <div className="user-chip">
              <div className="user-avatar">{firstName.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>

            <nav>
              <button className={activePage === "dashboard" ? "active" : ""} onClick={() => setActivePage("dashboard")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </button>
              <button className={activePage === "tasks" ? "active" : ""} onClick={() => setActivePage("tasks")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Task Manager
              </button>
              <button className={activePage === "schedule" ? "active" : ""} onClick={() => setActivePage("schedule")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Schedule
              </button>
              <button className={activePage === "deadlines" ? "active" : ""} onClick={() => setActivePage("deadlines")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Deadlines
                {upcomingDeadlines.filter(d => getDueInfo(d.dueDate).color === "#ef4444").length > 0 && (
                  <span className="nav-badge">
                    {upcomingDeadlines.filter(d => getDueInfo(d.dueDate).color === "#ef4444").length}
                  </span>
                )}
              </button>
              <button className={activePage === "focus" ? "active" : ""} onClick={() => setActivePage("focus")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Focus Mode
              </button>
              <button className={activePage === "notes" ? "active" : ""} onClick={() => setActivePage("notes")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Notes
              </button>

              <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Light Mode</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Dark Mode</>
                }
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log Out
              </button>
            </nav>
          </div>

          <div className="progress-card">
            <p className="progress-label">TODAY'S PROGRESS</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <small>{completedTasks} of {tasks.length} tasks completed</small>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <div className="top-card">
            <div className="top-card-left">
              <h1>{greeting}, {firstName}! 👋</h1>
              <p>
                You have {weeklySchedule[today]?.length || 0} classes today,{" "}
                {tasks.filter((t) => !t.done).length} pending tasks and{" "}
                {upcomingDeadlines.length} upcoming deadlines.
              </p>
            </div>
            <div className="top-card-right">
              <span className="focus-label">FOCUS TIMER</span>
              <h2 className="top-timer">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </h2>
              <button className="start-focus-btn" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? "Pause" : "Start Focus"}
              </button>
            </div>
          </div>
          {renderPage()}
        </main>

      </div>
    </div>
  );
}

export default App;