import React, { useEffect, useState } from "react";
import "./App.css";

/* eslint-disable react-hooks/exhaustive-deps */

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

const getLevelInfo = (xp) => {
  const levels = [
    { min: 0, title: "🌱 Seed", color: "#10b981" },
    { min: 100, title: "🌿 Sprout", color: "#34d399" },
    { min: 300, title: "🌸 Bloom", color: "#f59e0b" },
    { min: 600, title: "📚 Scholar", color: "#3b82f6" },
    { min: 1000, title: "🔥 Master", color: "#ef4444" },
    { min: 1500, title: "🏆 Legend", color: "#8b5cf6" },
  ];
  let currentLevel = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].min) {
      currentLevel = levels[i];
      break;
    }
  }
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];
  const xpToNext = nextLevel ? nextLevel.min - xp : 0;
  const currentLevelMin = currentLevel.min;
  const xpInCurrent = xp - currentLevelMin;
  const xpNeededForCurrent = nextLevel ? nextLevel.min - currentLevelMin : 100;
  const progressPercent = nextLevel ? (xpInCurrent / xpNeededForCurrent) * 100 : 100;
  
  return {
    title: currentLevel.title,
    color: currentLevel.color,
    level: levels.indexOf(currentLevel) + 1,
    xpToNext,
    progressPercent,
    nextTitle: nextLevel ? nextLevel.title : "MAX"
  };
};

// ========== DAILY CHALLENGES ==========
const CHALLENGES = [
  { id: 1, text: "Complete 3 tasks today", requirement: { type: "tasks", count: 3 }, reward: 40 },
  { id: 2, text: "Study for 30 minutes in Focus Mode", requirement: { type: "focusMinutes", count: 30 }, reward: 35 },
  { id: 3, text: "Add a new deadline", requirement: { type: "addDeadline", count: 1 }, reward: 25 },
  { id: 4, text: "Complete a task before 10 AM", requirement: { type: "morningTask", count: 1 }, reward: 30 },
  { id: 5, text: "Study 2 different subjects", requirement: { type: "subjects", count: 2 }, reward: 30 },
  { id: 6, text: "Complete 1 focus session", requirement: { type: "focusSession", count: 1 }, reward: 25 },
  { id: 7, text: "Add a new task", requirement: { type: "addTask", count: 1 }, reward: 15 },
  { id: 8, text: "Reach a 3-day streak", requirement: { type: "streak", count: 3 }, reward: 50 },
];

// ========== ACHIEVEMENTS / BADGES ==========
const ALL_ACHIEVEMENTS = [
  { id: "first_task", name: "🌱 First Step", description: "Complete your first task", requirement: { type: "totalTasks", count: 1 }, reward: 20 },
  { id: "streak_3", name: "🔥 3-Day Streak", description: "Active for 3 days in a row", requirement: { type: "streak", count: 3 }, reward: 50 },
  { id: "streak_7", name: "🔥🔥 7-Day Streak", description: "Active for 7 days in a row", requirement: { type: "streak", count: 7 }, reward: 100 },
  { id: "streak_30", name: "🏆 30-Day Streak", description: "Active for 30 days in a row", requirement: { type: "streak", count: 30 }, reward: 500 },
  { id: "speed_demon", name: "⚡ Speed Demon", description: "Complete 5 tasks in one hour", requirement: { type: "tasksInHour", count: 5 }, reward: 40 },
  { id: "bookworm", name: "📚 Bookworm", description: "Complete 20 tasks total", requirement: { type: "totalTasks", count: 20 }, reward: 60 },
  { id: "zen_master", name: "🧠 Zen Master", description: "Complete 10 focus sessions", requirement: { type: "focusSessions", count: 10 }, reward: 80 },
  { id: "night_owl", name: "🦉 Night Owl", description: "Study after 11 PM", requirement: { type: "nightStudy", count: 1 }, reward: 30 },
  { id: "early_bird", name: "🌅 Early Bird", description: "Complete a task before 8 AM", requirement: { type: "morningTask", count: 1 }, reward: 30 },
  { id: "deadline_crusher", name: "📅 Deadline Crusher", description: "Complete 5 deadlines", requirement: { type: "totalDeadlines", count: 5 }, reward: 70 },
  { id: "all_rounder", name: "💪 All-Rounder", description: "Complete one of each (task, deadline, focus session)", requirement: { type: "allRounder", count: 1 }, reward: 50 },
  { id: "legend", name: "🏆 Study Legend", description: "Reach Level 5 (Master)", requirement: { type: "level", count: 5 }, reward: 200 },
];

function App() {
  const today   = new Date().toLocaleString("en-US", { weekday: "long" });
  const hour    = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // ── Auth ─────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("studyUser");
    return s ? JSON.parse(s) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearAuthForm = () => {
    setAuthName(""); setAuthEmail(""); setAuthPassword(""); setAuthError("");
  };
  
  // ── Onboarding State ─────────────────────────────
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    const u = localStorage.getItem("studyUser");
    return u ? JSON.parse(u).onboardingComplete || false : false;
  });
  const [major, setMajor] = useState("");
  const [goal, setGoal] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [priority, setPriority] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [deadlineText, setDeadlineText] = useState("");

  // ── GAMIFICATION STATE ───────────────────────────
  const [xp, setXp] = useState(() => {
    const u = localStorage.getItem("studyUser");
    if (u) {
      const parsed = JSON.parse(u);
      return parsed.xp || 0;
    }
    return 0;
  });
  const [streak, setStreak] = useState(() => {
    const u = localStorage.getItem("studyUser");
    if (u) {
      const parsed = JSON.parse(u);
      return parsed.streak || 0;
    }
    return 0;
  });
  const [lastActiveDate, setLastActiveDate] = useState(() => {
    const u = localStorage.getItem("studyUser");
    if (u) {
      const parsed = JSON.parse(u);
      return parsed.lastActiveDate || null;
    }
    return null;
  });
  const [focusStreak, setFocusStreak] = useState(() => {
    const u = localStorage.getItem("studyUser");
    if (u) {
      const parsed = JSON.parse(u);
      return parsed.focusStreak || 0;
    }
    return 0;
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    const u = localStorage.getItem("studyUser");
    if (u) {
      const parsed = JSON.parse(u);
      return parsed.dailyGoal || { target: 3, completed: 0, date: new Date().toDateString() };
    }
    return { target: 3, completed: 0, date: new Date().toDateString() };
  });
  const [showXpToast, setShowXpToast] = useState(null);
  
  // Daily Challenge State
  const [dailyChallenge, setDailyChallenge] = useState(() => {
    const saved = localStorage.getItem("dailyChallenge");
    if (saved) {
      const parsed = JSON.parse(saved);
      const todayDate = new Date().toDateString();
      if (parsed.date === todayDate) {
        return parsed;
      }
    }
    // Pick random challenge for new day
    const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    return {
      ...randomChallenge,
      date: new Date().toDateString(),
      progress: 0,
      completed: false
    };
  });
  
  // Achievements State
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem("unlockedAchievements");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Stats tracking for achievements
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("studyStats");
    return saved ? JSON.parse(saved) : {
      totalTasksCompleted: 0,
      totalFocusSessions: 0,
      totalDeadlinesCompleted: 0,
      fastestHourTasks: 0,
      lastTaskHour: null,
      hasDoneNightStudy: false,
      hasDoneMorningTask: false,
      hasDoneAllRounder: false,
      subjectsStudied: []
    };
  });

  // ── Dark mode ────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  
  // ── Weekly schedule ──────────────────────────────
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const s = localStorage.getItem("weeklySchedule");
    return s ? JSON.parse(s) : { Monday:[], Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Sunday:[] };
  });

  const [formDay, setFormDay] = useState(today);
  const [className, setClassName] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classEndTime, setClassEndTime] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [classProfessor, setClassProfessor] = useState("");
  const [classColor, setClassColor] = useState("#7c5cff");
  const colorOptions = ["#7c5cff","#3b82f6","#10b981","#f59e0b","#ec4899","#ef4444","#14b8a6"];

  // ── Tasks ────────────────────────────────────────
  const defaultTasks = [
    { id: 1, text: "Read Chemistry Chapter 4", done: false },
    { id: 2, text: "Draft Economics Essay Outline", done: false },
    { id: 3, text: "Submit Lab Report Part 2", done: false, high: true },
    { id: 4, text: "Review Calculus Notes", done: true },
  ];
  const [activePage, setActivePage] = useState("dashboard");
  const [tasks, setTasks] = useState(() => {
    const s = localStorage.getItem("studyTasks");
    return s ? JSON.parse(s) : defaultTasks;
  });
  const [newTask, setNewTask] = useState("");

  // ── Notes ────────────────────────────────────────
  const [notes, setNotes] = useState(localStorage.getItem("studyNotes") || "");

  // ── Focus timer ──────────────────────────────────
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // ── Deadlines ────────────────────────────────────
  const defaultDeadlines = [
    { id: 1, title: "History Term Paper", subject: "History", dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], priority: "high", done: false, color: "#ef4444" },
    { id: 2, title: "Math Quiz", subject: "Mathematics", dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], priority: "medium", done: false, color: "#3b82f6" },
  ];
  const [deadlines, setDeadlines] = useState(() => {
    const s = localStorage.getItem("studyDeadlines");
    return s ? JSON.parse(s) : defaultDeadlines;
  });

  const [dlTitle, setDlTitle] = useState("");
  const [dlSubject, setDlSubject] = useState("");
  const [dlDate, setDlDate] = useState("");
  const [dlPriority, setDlPriority] = useState("medium");
  const [dlColor, setDlColor] = useState("#7c5cff");

  // ── Effects ──────────────────────────────────────
  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem("weeklySchedule", JSON.stringify(weeklySchedule)); }, [weeklySchedule]);
  useEffect(() => { localStorage.setItem("studyTasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("studyNotes", notes); }, [notes]);
  useEffect(() => { localStorage.setItem("studyDeadlines", JSON.stringify(deadlines)); }, [deadlines]);

  // Save daily challenge
  useEffect(() => {
    localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallenge));
  }, [dailyChallenge]);

  // Save achievements and stats
  useEffect(() => {
    localStorage.setItem("unlockedAchievements", JSON.stringify(unlockedAchievements));
    localStorage.setItem("studyStats", JSON.stringify(stats));
  }, [unlockedAchievements, stats]);

  // Update gamification in localStorage
  useEffect(() => {
    if (user) {
      const allUsers = JSON.parse(localStorage.getItem("studyUsers") || "[]");
      const updatedUsersList = allUsers.map((u) => 
        u.email === user.email ? { ...u, xp, streak, lastActiveDate, focusStreak, dailyGoal } : u
      );
      localStorage.setItem("studyUsers", JSON.stringify(updatedUsersList));
      
      const updatedUser = { ...user, xp, streak, lastActiveDate, focusStreak, dailyGoal };
      localStorage.setItem("studyUser", JSON.stringify(updatedUser));
    }
  }, [xp, streak, lastActiveDate, focusStreak, dailyGoal, user]);

  // Check streak on app load
  useEffect(() => {
    const todayDate = new Date().toDateString();
    if (lastActiveDate !== todayDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastActiveDate === yesterdayString) {
        // Streak continues
        const newStreak = streak + 1;
        setStreak(newStreak);
        // Check for streak achievements
        checkAndUnlockAchievement("streak", newStreak);
      } else if (lastActiveDate !== null && lastActiveDate !== todayDate) {
        setStreak(1);
        checkAndUnlockAchievement("streak", 1);
      } else if (lastActiveDate === null) {
        setStreak(1);
      }
      setLastActiveDate(todayDate);
    }
  }, []);

  // Focus timer effect
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
          const totalMinutes = sessionStartTime ? 
            Math.floor((Date.now() - sessionStartTime) / 60000) : 25;
          const xpEarned = Math.floor(totalMinutes / 5) * 10;
          if (xpEarned > 0) {
            addXp(xpEarned, `Completed ${totalMinutes} min focus session! 🧠`);
          }
          // Update stats for focus sessions
          setStats(prev => ({
            ...prev,
            totalFocusSessions: prev.totalFocusSessions + 1
          }));
          setFocusStreak(prev => prev + 1);
          setSessionStartTime(null);
          
          // Update daily challenge
          updateChallengeProgress("focusSession", 1);
          updateChallengeProgress("focusMinutes", totalMinutes);
          
          if (!isMuted) {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(e => console.log("Audio play failed", e));
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds, isMuted, sessionStartTime]);

  // ── Helper Functions ────────────────────────────
  const checkAndUnlockAchievement = (type, value) => {
    const newUnlocks = [];
    
    for (const achievement of ALL_ACHIEVEMENTS) {
      if (unlockedAchievements.includes(achievement.id)) continue;
      
      let achieved = false;
      switch (achievement.requirement.type) {
        case "totalTasks":
          if (stats.totalTasksCompleted >= achievement.requirement.count) achieved = true;
          break;
        case "streak":
          if (streak >= achievement.requirement.count) achieved = true;
          break;
        case "focusSessions":
          if (stats.totalFocusSessions >= achievement.requirement.count) achieved = true;
          break;
        case "totalDeadlines":
          if (stats.totalDeadlinesCompleted >= achievement.requirement.count) achieved = true;
          break;
        case "level":
          const levelInfo = getLevelInfo(xp);
          if (levelInfo.level >= achievement.requirement.count) achieved = true;
          break;
        case "tasksInHour":
          if (stats.fastestHourTasks >= achievement.requirement.count) achieved = true;
          break;
        case "nightStudy":
          if (stats.hasDoneNightStudy) achieved = true;
          break;
        case "morningTask":
          if (stats.hasDoneMorningTask) achieved = true;
          break;
        case "allRounder":
          if (stats.hasDoneAllRounder) achieved = true;
          break;
        default:
          break;
      }
      
      if (achieved) {
        newUnlocks.push(achievement.id);
        addXp(achievement.reward, `Achievement unlocked: ${achievement.name}! 🏅`);
      }
    }
    
    if (newUnlocks.length > 0) {
      setUnlockedAchievements([...unlockedAchievements, ...newUnlocks]);
    }
  };

  const updateChallengeProgress = (type, amount = 1) => {
    if (dailyChallenge.completed) return;
    if (dailyChallenge.requirement.type === type) {
      const newProgress = Math.min(dailyChallenge.progress + amount, dailyChallenge.requirement.count);
      setDailyChallenge(prev => ({ ...prev, progress: newProgress }));
      
      if (newProgress >= dailyChallenge.requirement.count && !dailyChallenge.completed) {
        setDailyChallenge(prev => ({ ...prev, completed: true }));
        addXp(dailyChallenge.reward, `Daily challenge complete! 🎯 ${dailyChallenge.text}`);
      }
    }
  };

  const addXp = (amount, reason) => {
    setXp(prev => prev + amount);
    setShowXpToast({ amount, reason });
    setTimeout(() => setShowXpToast(null), 2000);
  };

  const updateDailyGoal = () => {
    const todayDate = new Date().toDateString();
    if (dailyGoal.date !== todayDate) {
      setDailyGoal({ target: 3, completed: 0, date: todayDate });
    } else {
      const newCompleted = dailyGoal.completed + 1;
      setDailyGoal(prev => ({ ...prev, completed: newCompleted }));
      
      if (newCompleted === dailyGoal.target) {
        addXp(50, "Daily goal completed! 🎯");
      }
    }
  };

  const handleSignup = () => {
    if (!authName.trim()) { setAuthError("Please enter your name."); return; }
    if (!authEmail.includes("@")) { setAuthError("Please enter a valid email."); return; }
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    const users = JSON.parse(localStorage.getItem("studyUsers") || "[]");
    if (users.find((u) => u.email.toLowerCase() === authEmail.toLowerCase())) {
      setAuthError("An account with this email already exists."); return;
    }
    const newUser = { 
      name: authName.trim(), 
      email: authEmail.trim().toLowerCase(), 
      password: authPassword,
      xp: 0,
      streak: 0,
      focusStreak: 0,
      dailyGoal: { target: 3, completed: 0, date: new Date().toDateString() }
    };
    localStorage.setItem("studyUsers", JSON.stringify([...users, newUser]));
    const loggedIn = { 
      name: newUser.name, 
      email: newUser.email,
      xp: 0,
      streak: 0,
      focusStreak: 0,
      dailyGoal: { target: 3, completed: 0, date: new Date().toDateString() }
    };
    localStorage.setItem("studyUser", JSON.stringify(loggedIn));
    setUser(loggedIn);
    setXp(0);
    setStreak(0);
    setFocusStreak(0);
    clearAuthForm();
  };

  const handleLogin = () => {
    if (!authEmail || !authPassword) { setAuthError("Please fill in all fields."); return; }
    const users = JSON.parse(localStorage.getItem("studyUsers") || "[]");
    const found = users.find((u) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword);
    if (!found) { setAuthError("Incorrect email or password."); return; }
    
    const loggedIn = { 
      name: found.name, 
      email: found.email, 
      onboardingComplete: found.onboardingComplete || false,
      major: found.major || "",
      goal: found.goal || "",
      xp: found.xp || 0,
      streak: found.streak || 0,
      focusStreak: found.focusStreak || 0,
      dailyGoal: found.dailyGoal || { target: 3, completed: 0, date: new Date().toDateString() }
    };
    
    localStorage.setItem("studyUser", JSON.stringify(loggedIn));
    setUser(loggedIn);
    setXp(loggedIn.xp);
    setStreak(loggedIn.streak);
    setFocusStreak(loggedIn.focusStreak);
    setDailyGoal(loggedIn.dailyGoal);
    setHasOnboarded(loggedIn.onboardingComplete);
    clearAuthForm();
  };

  // Helper functions for generating content
  const generateTasksFromPriority = (priorityVal, majorVal, goalVal) => {
    const newTasks = [];
    const baseId = Date.now();
    
    if (priorityVal === "exam") {
      newTasks.push({ id: baseId, text: `📚 Review ${majorVal || "your subject"} chapters 1-5`, done: false, high: true });
      newTasks.push({ id: baseId + 1, text: "📝 Create study guide / flashcards", done: false, high: false });
      newTasks.push({ id: baseId + 2, text: "✅ Take practice exam", done: false, high: false });
      if (goalVal) newTasks.push({ id: baseId + 3, text: `🎯 ${goalVal}`, done: false, high: true });
    } 
    else if (priorityVal === "project") {
      newTasks.push({ id: baseId, text: `📋 Research & outline for ${majorVal || "project"}`, done: false, high: true });
      newTasks.push({ id: baseId + 1, text: "✍️ Complete first draft", done: false, high: false });
      newTasks.push({ id: baseId + 2, text: "🔍 Review, edit, and submit", done: false, high: true });
      if (goalVal) newTasks.push({ id: baseId + 3, text: `🎯 ${goalVal}`, done: false, high: false });
    }
    else if (priorityVal === "catchup") {
      newTasks.push({ id: baseId, text: "📖 Review past 2 weeks of notes", done: false, high: true });
      newTasks.push({ id: baseId + 1, text: "✅ Complete all pending assignments", done: false, high: true });
      newTasks.push({ id: baseId + 2, text: "📅 Create catch-up study schedule", done: false, high: false });
      if (goalVal) newTasks.push({ id: baseId + 3, text: `🎯 ${goalVal}`, done: false, high: false });
    }
    else {
      newTasks.push({ id: baseId, text: `📚 Study ${majorVal || "your subject"}`, done: false, high: false });
      newTasks.push({ id: baseId + 1, text: "✅ Complete priority task", done: false, high: true });
      if (goalVal) newTasks.push({ id: baseId + 2, text: `🎯 ${goalVal}`, done: false, high: false });
    }
    
    return newTasks;
  };

  const generateScheduleFromHours = (hours, majorVal) => {
    if (hours < 5) return {};
    
    const dailyHours = Math.min(4, Math.floor(hours / 5));
    if (dailyHours < 1) return {};
    
    const newSchedule = { Monday:[], Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Sunday:[] };
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const startHour = 14;
    
    days.forEach((day, idx) => {
      newSchedule[day].push({
        id: Date.now() + idx * 1000 + Math.random(),
        name: `📚 Study: ${majorVal || "Focus Block"}`,
        time: `${startHour.toString().padStart(2, "0")}:00`,
        endTime: `${(startHour + dailyHours).toString().padStart(2, "0")}:00`,
        room: "",
        professor: "",
        color: "#7c5cff"
      });
    });
    
    return newSchedule;
  };

  const parseDeadlinesFromText = (text, majorVal) => {
    if (!text || !text.trim()) return [];
    
    const deadlines = [];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const lowerText = text.toLowerCase();
    const baseId = Date.now();
    
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lowerText.includes(daysOfWeek[i])) {
        const targetDay = i;
        const currentDay = todayDate.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const dueDate = new Date(todayDate);
        dueDate.setDate(todayDate.getDate() + daysUntil);
        
        let title = text.split(daysOfWeek[i])[0].trim();
        if (!title) title = `Assignment due ${daysOfWeek[i]}`;
        
        deadlines.push({
          id: baseId + i,
          title: title,
          subject: majorVal || "General",
          dueDate: dueDate.toISOString().split("T")[0],
          priority: "high",
          done: false,
          color: "#ef4444"
        });
        break;
      }
    }
    
    if (lowerText.includes("tomorrow")) {
      const tomorrow = new Date(todayDate);
      tomorrow.setDate(todayDate.getDate() + 1);
      let title = text.split("tomorrow")[0].trim();
      if (!title) title = "Deadline";
      deadlines.push({
        id: baseId + 100,
        title: title,
        subject: majorVal || "General",
        dueDate: tomorrow.toISOString().split("T")[0],
        priority: "high",
        done: false,
        color: "#ef4444"
      });
    }
    
    return deadlines;
  };

  const finishOnboardingAndGenerate = () => {
    if (!major.trim()) return;
    
    const newTasks = generateTasksFromPriority(priority, major, goal);
    const newScheduleBlocks = generateScheduleFromHours(weeklyHours, major);
    const newDeadlines = parseDeadlinesFromText(deadlineText, major);
    
    const updatedTasks = tasks.length === 0 ? newTasks : [...tasks, ...newTasks];
    const updatedDeadlines = deadlines.length === 0 ? newDeadlines : [...deadlines, ...newDeadlines];
    
    let updatedSchedule = { ...weeklySchedule };
    Object.keys(newScheduleBlocks).forEach(day => {
      if (newScheduleBlocks[day] && newScheduleBlocks[day].length > 0) {
        updatedSchedule[day] = [...updatedSchedule[day], ...newScheduleBlocks[day]];
      }
    });
    
    setTasks(updatedTasks);
    setDeadlines(updatedDeadlines);
    setWeeklySchedule(updatedSchedule);
    
    localStorage.setItem("studyTasks", JSON.stringify(updatedTasks));
    localStorage.setItem("studyDeadlines", JSON.stringify(updatedDeadlines));
    localStorage.setItem("weeklySchedule", JSON.stringify(updatedSchedule));
    
    addXp(100, "Completed onboarding! 🎉");
    
    const updatedUser = { 
      ...user, 
      onboardingComplete: true, 
      major: major.trim(), 
      goal: goal.trim(),
      priority: priority,
      weeklyHours: weeklyHours,
      xp: xp + 100,
      streak: streak,
      focusStreak: focusStreak,
      dailyGoal: dailyGoal
    };
    setUser(updatedUser);
    setHasOnboarded(true);
    localStorage.setItem("studyUser", JSON.stringify(updatedUser));
    
    const allUsers = JSON.parse(localStorage.getItem("studyUsers") || "[]");
    const updatedUsersList = allUsers.map((u) => 
      u.email === user.email ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem("studyUsers", JSON.stringify(updatedUsersList));
  };

  const nextOnboardingStep = () => {
    if (onboardingStep === 0 && !major.trim()) return;
    setOnboardingStep(onboardingStep + 1);
  };

  const handleLogout = () => { localStorage.removeItem("studyUser"); setUser(null); };
  const firstName = user ? user.name.split(" ")[0] : "";
  const levelInfo = getLevelInfo(xp);

  // ── Handlers with XP rewards ─────────────────────
  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
      // Update stats
      const now = new Date();
      const currentHour = now.getHours();
      
      setStats(prev => {
        const newStats = { ...prev, totalTasksCompleted: prev.totalTasksCompleted + 1 };
        
        // Track tasks in one hour for Speed Demon
        if (prev.lastTaskHour === currentHour) {
          const newHourCount = (prev.fastestHourTasks || 0) + 1;
          newStats.fastestHourTasks = Math.max(newHourCount, prev.fastestHourTasks || 0);
        } else {
          newStats.fastestHourTasks = Math.max(1, prev.fastestHourTasks || 0);
        }
        newStats.lastTaskHour = currentHour;
        
        // Track morning task (before 8 AM)
        if (currentHour < 8 && !prev.hasDoneMorningTask) {
          newStats.hasDoneMorningTask = true;
          checkAndUnlockAchievement("morningTask", 1);
        }
        
        // Track night study (after 11 PM)
        if (currentHour >= 23 && !prev.hasDoneNightStudy) {
          newStats.hasDoneNightStudy = true;
          checkAndUnlockAchievement("nightStudy", 1);
        }
        
        return newStats;
      });
      
      addXp(15, `Completed: ${task.text.substring(0, 30)}${task.text.length > 30 ? "..." : ""} ✓`);
      updateDailyGoal();
      updateChallengeProgress("tasks", 1);
      
      // Check achievements
      checkAndUnlockAchievement("totalTasks", stats.totalTasksCompleted + 1);
      checkAndUnlockAchievement("tasksInHour", stats.fastestHourTasks);
      
      // Update streak
      const todayDate = new Date().toDateString();
      if (lastActiveDate !== todayDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastActiveDate === yesterday.toDateString()) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          checkAndUnlockAchievement("streak", newStreak);
          addXp(20, `${newStreak} day streak! 🔥`);
        } else if (lastActiveDate === null) {
          setStreak(1);
        }
        setLastActiveDate(todayDate);
      }
    }
    setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };
  
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
  
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
    updateChallengeProgress("addTask", 1);
  };

  const addSchedule = () => {
    if (!className.trim() || !classTime.trim()) return;
    setWeeklySchedule((prev) => ({
      ...prev,
      [formDay]: [...prev[formDay], { id: Date.now(), name: className, time: classTime, endTime: classEndTime, room: classRoom, professor: classProfessor, color: classColor }],
    }));
    addXp(10, `Added class: ${className} 📚`);
    setClassName(""); setClassTime(""); setClassEndTime(""); setClassRoom(""); setClassProfessor("");
  };
  
  const deleteSchedule = (id, day) =>
    setWeeklySchedule((prev) => ({ ...prev, [day]: prev[day].filter((i) => i.id !== id) }));

  const addDeadline = () => {
    if (!dlTitle.trim() || !dlDate) return;
    setDeadlines([...deadlines, { id: Date.now(), title: dlTitle.trim(), subject: dlSubject.trim(), dueDate: dlDate, priority: dlPriority, done: false, color: dlColor }]);
    addXp(10, `Added deadline: ${dlTitle} 📅`);
    updateChallengeProgress("addDeadline", 1);
    setDlTitle(""); setDlSubject(""); setDlDate(""); setDlPriority("medium");
  };
  
  const toggleDeadline = (id) => {
    const deadline = deadlines.find(d => d.id === id);
    if (deadline && !deadline.done) {
      setStats(prev => ({
        ...prev,
        totalDeadlinesCompleted: prev.totalDeadlinesCompleted + 1
      }));
      addXp(25, `Completed: ${deadline.title} 🎯`);
      updateDailyGoal();
      updateChallengeProgress("deadlines", 1);
      checkAndUnlockAchievement("totalDeadlines", stats.totalDeadlinesCompleted + 1);
    }
    setDeadlines(deadlines.map((d) => d.id === id ? { ...d, done: !d.done } : d));
  };
  
  const deleteDeadline = (id) => setDeadlines(deadlines.filter((d) => d.id !== id));

  const startFocusSession = () => {
    setIsRunning(true);
    setSessionStartTime(Date.now());
  };

  // ── Computed values ──────────────────────────────
  const completedTasks = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const upcomingDeadlines = [...deadlines]
    .filter((d) => !d.done)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);
  


  // Achievement icons mapping
  const getAchievementIcon = (id) => {
    const icons = {
      first_task: "🌱", streak_3: "🔥", streak_7: "🔥🔥", streak_30: "🏆",
      speed_demon: "⚡", bookworm: "📚", zen_master: "🧠", night_owl: "🦉",
      early_bird: "🌅", deadline_crusher: "📅", all_rounder: "💪", legend: "🏆"
    };
    return icons[id] || "🏅";
  };

  // ═══════════════════════════════════════════════════════════════════
  // AUTH PAGE
  // ═══════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════
  // ONBOARDING PAGE
  // ═══════════════════════════════════════════════════════════════════
  if (!hasOnboarded) {
    if (onboardingStep === 0) {
      return (
        <div className={`app ${darkMode ? "dark" : ""}`}>
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-logo"><div className="logo-box">S</div><h1>StudyBloom</h1></div>
              <div className="step-indicator">Step 1 of 4</div>
              <h2 className="auth-heading">What's your major? 📚</h2>
              <p className="auth-subtitle">This helps us tailor your study plan.</p>
              <div className="auth-field"><label>Your Major / Field of Study</label><input type="text" placeholder="e.g. Computer Science, Nursing, Business" value={major} onChange={(e) => setMajor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nextOnboardingStep()} autoFocus /></div>
              <button className="auth-submit-btn" onClick={nextOnboardingStep}>Next →</button>
            </div>
          </div>
        </div>
      );
    }
    if (onboardingStep === 1) {
      return (
        <div className={`app ${darkMode ? "dark" : ""}`}>
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-logo"><div className="logo-box">S</div><h1>StudyBloom</h1></div>
              <div className="step-indicator">Step 2 of 4</div>
              <h2 className="auth-heading">What's your #1 priority this week? 🎯</h2>
              <p className="auth-subtitle">We'll create tasks based on your answer.</p>
              <div className="priority-options">
                <button className={`priority-btn ${priority === "exam" ? "selected" : ""}`} onClick={() => setPriority("exam")}>📝 Exam Prep</button>
                <button className={`priority-btn ${priority === "project" ? "selected" : ""}`} onClick={() => setPriority("project")}>📋 Project / Paper</button>
                <button className={`priority-btn ${priority === "catchup" ? "selected" : ""}`} onClick={() => setPriority("catchup")}>🔄 Catching Up</button>
                <button className={`priority-btn ${priority === "other" ? "selected" : ""}`} onClick={() => setPriority("other")}>💪 Other Goal</button>
              </div>
              <div className="auth-field" style={{ marginTop: "20px" }}><label>Your main goal this semester (optional)</label><input type="text" placeholder="e.g. Get an A in Calculus" value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
              <button className="auth-submit-btn" onClick={nextOnboardingStep} disabled={!priority}>Next →</button>
            </div>
          </div>
        </div>
      );
    }
    if (onboardingStep === 2) {
      return (
        <div className={`app ${darkMode ? "dark" : ""}`}>
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-logo"><div className="logo-box">S</div><h1>StudyBloom</h1></div>
              <div className="step-indicator">Step 3 of 4</div>
              <h2 className="auth-heading">How many hours can you study per week? ⏰</h2>
              <p className="auth-subtitle">We'll create a study schedule for you.</p>
                         <div className="hours-options">
                {[5, 10, 15, 20, 25].map(h => (<button key={h} className={`hours-btn ${weeklyHours === h ? "selected" : ""}`} onClick={() => setWeeklyHours(h)}>{h} {h === 25 ? "+" : ""} hrs/week</button>))}
              </div>
              <button className="auth-submit-btn" onClick={nextOnboardingStep}>Next →</button>
            </div>
          </div>
        </div>
      );
    }
    if (onboardingStep === 3) {
      return (
        <div className={`app ${darkMode ? "dark" : ""}`}>
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-logo"><div className="logo-box">S</div><h1>StudyBloom</h1></div>
              <div className="step-indicator">Step 4 of 4</div>
              <h2 className="auth-heading">Any upcoming deadlines? 📅</h2>
              <p className="auth-subtitle">Tell us about assignments or exams coming up (optional).</p>
              <div className="auth-field"><label>Example: "Math quiz Friday" or "Essay due next Tuesday"</label><input type="text" placeholder="e.g. History paper Friday, Calculus exam next week" value={deadlineText} onChange={(e) => setDeadlineText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && finishOnboardingAndGenerate()} /></div>
              <button className="auth-submit-btn" onClick={finishOnboardingAndGenerate}>Start Studying 🚀</button>
              <button className="skip-btn" onClick={finishOnboardingAndGenerate}>Skip for now</button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN APP RENDER
  // ═══════════════════════════════════════════════════════════════════
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

      case "schedule":
        return (
          <div className="schedule-page">
            <div className="card form-card">
              <h3>➕ Add a Class</h3>
              <div className="schedule-form-grid">
                <div className="form-group"><label>Class Name *</label><input type="text" placeholder="e.g. Organic Chemistry" value={className} onChange={(e) => setClassName(e.target.value)} /></div>
                <div className="form-group"><label>Professor</label><input type="text" placeholder="e.g. Dr. Aris" value={classProfessor} onChange={(e) => setClassProfessor(e.target.value)} /></div>
                <div className="form-group"><label>Start Time *</label><input type="time" value={classTime} onChange={(e) => setClassTime(e.target.value)} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={classEndTime} onChange={(e) => setClassEndTime(e.target.value)} /></div>
                <div className="form-group"><label>Room / Hall</label><input type="text" placeholder="e.g. Hall B, Room 204" value={classRoom} onChange={(e) => setClassRoom(e.target.value)} /></div>
                <div className="form-group"><label>Day</label><select value={formDay} onChange={(e) => setFormDay(e.target.value)}>{Object.keys(weeklySchedule).map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="color-row"><label>Subject Colour</label><div className="color-options">{colorOptions.map((c) => (<button key={c} className={`color-dot ${classColor === c ? "selected" : ""}`} style={{ background: c }} onClick={() => setClassColor(c)} />))}</div></div>
              <button className="add-class-btn" onClick={addSchedule}>Add Class</button>
            </div>
            <div className="card grid-card">
              <h3>📅 Your Weekly Timetable</h3>
              <p className="grid-subtitle">Set once — repeats every week automatically ✓</p>
              <div className="weekly-grid">
                {Object.keys(weeklySchedule).map((day) => (
                  <div key={day} className="day-column">
                    <div className={`day-header ${day === today ? "is-today" : ""}`}><span className="day-abbr">{day.slice(0, 3)}</span>{day === today && <span className="today-dot" />}</div>
                    {weeklySchedule[day].length === 0 ? (
                      <div className="empty-day">—</div>
                    ) : (
                      [...weeklySchedule[day]]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => (
                          <div key={item.id} className="class-card" style={{ borderLeftColor: item.color || "#7c5cff" }}>
                            <div className="class-card-body">
                              <span className="class-time-label">
                                {item.time}
                                {item.endTime ? ` – ${item.endTime}` : ""}
                              </span>
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

      case "deadlines":
        return (
          <div className="deadlines-page">
            <div className="card">
              <h3>➕ Add Assignment / Deadline</h3>
              <div className="deadline-form-grid">
                <div className="form-group"><label>Assignment Title *</label><input type="text" placeholder="e.g. History Term Paper" value={dlTitle} onChange={(e) => setDlTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDeadline()} /></div>
                <div className="form-group"><label>Subject</label><input type="text" placeholder="e.g. History" value={dlSubject} onChange={(e) => setDlSubject(e.target.value)} /></div>
                <div className="form-group"><label>Due Date *</label><input type="date" value={dlDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDlDate(e.target.value)} /></div>
                <div className="form-group"><label>Priority</label><select value={dlPriority} onChange={(e) => setDlPriority(e.target.value)}><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
              </div>
              <div className="color-row"><label>Subject Colour</label><div className="color-options">{colorOptions.map((c) => (<button key={c} className={`color-dot ${dlColor === c ? "selected" : ""}`} style={{ background: c }} onClick={() => setDlColor(c)} />))}</div></div>
              <button className="add-class-btn" onClick={addDeadline}>Add Deadline</button>
            </div>
            <div className="card">
              <div className="deadlines-list-header"><h3>📋 All Assignments</h3><div className="dl-counts"><span className="dl-count-chip pending">{deadlines.filter((d) => !d.done).length} pending</span><span className="dl-count-chip submitted">{deadlines.filter((d) => d.done).length} submitted</span></div></div>
              {deadlines.length === 0 ? (<p className="empty-msg">No assignments yet — add one above!</p>) : (<div className="deadlines-full-list">
                {deadlines.filter((d) => !d.done).length > 0 && (<p className="dl-section-label">PENDING</p>)}
                {[...deadlines].filter((d) => !d.done).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map((d) => { const { label, color } = getDueInfo(d.dueDate); return (<div key={d.id} className="deadline-row" style={{ borderLeftColor: d.color || "#7c5cff" }}><input type="checkbox" checked={d.done} onChange={() => toggleDeadline(d.id)} /><div className="deadline-row-info"><strong>{d.title}</strong>{d.subject && <span className="dl-subject">{d.subject}</span>}</div><span className="dl-due-badge" style={{ color, background: `${color}22` }}>{label}</span><span className={`dl-priority-badge priority-${d.priority}`}>{d.priority.toUpperCase()}</span><button className="task-delete-btn" onClick={() => deleteDeadline(d.id)}><TrashIcon /></button></div>);})}
                {deadlines.filter((d) => d.done).length > 0 && (<p className="dl-section-label" style={{ marginTop: "16px" }}>SUBMITTED</p>)}
                {[...deadlines].filter((d) => d.done).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).map((d) => (<div key={d.id} className="deadline-row deadline-done" style={{ borderLeftColor: d.color || "#7c5cff" }}><input type="checkbox" checked={d.done} onChange={() => toggleDeadline(d.id)} /><div className="deadline-row-info"><strong>{d.title}</strong>{d.subject && <span className="dl-subject">{d.subject}</span>}</div><span className="dl-due-badge" style={{ color: "#10b981", background: "#10b98122" }}>✓ Submitted</span><button className="task-delete-btn" onClick={() => deleteDeadline(d.id)}><TrashIcon /></button></div>))}
              </div>)}
            </div>
          </div>
        );

      case "focus":
        return (
          <div className="card focus-page">
            <h3>🎯 Focus Mode</h3>
            <div className="preset-times">
              <button onClick={() => { setMinutes(25); setSeconds(0); setIsRunning(false); setSessionStartTime(null); }}>25 min</button>
              <button onClick={() => { setMinutes(45); setSeconds(0); setIsRunning(false); setSessionStartTime(null); }}>45 min</button>
              <button onClick={() => { setMinutes(60); setSeconds(0); setIsRunning(false); setSessionStartTime(null); }}>1 hr</button>
              <button onClick={() => { setMinutes(120); setSeconds(0); setIsRunning(false); setSessionStartTime(null); }}>2 hr</button>
            </div>
            <h2 className="countdown-display">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</h2>
            <button className="mute-btn" onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', color: isMuted ? '#999' : 'inherit' }}>{isMuted ? "🔇 Sound Off" : "🔊 Sound On"}</button>
            <div className="focus-buttons">
              <button onClick={startFocusSession}>{isRunning ? "Pause" : "Start"}</button>
              <button onClick={() => { setIsRunning(false); setMinutes(25); setSeconds(0); setSessionStartTime(null); }}>Reset</button>
            </div>
            <div style={{ marginTop: "16px", padding: "12px", background: "var(--primary-soft)", borderRadius: "12px" }}><span>🔥 Focus Sessions Completed: {stats.totalFocusSessions}</span></div>
          </div>
        );

      case "notes":
        return (
          <div className="card">
            <h3>📝 Notes</h3>
            <textarea placeholder="Write your notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        );

      case "achievements":
        return (
          <div className="card">
            <h3>🏆 Achievements & Badges</h3>
            <div className="achievements-grid">
              {ALL_ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div key={ach.id} className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}>
                    <div className="achievement-icon">{getAchievementIcon(ach.id)}</div>
                    <div className="achievement-info">
                      <div className="achievement-name">{ach.name}</div>
                      <div className="achievement-desc">{ach.description}</div>
                      {!isUnlocked && <div className="achievement-reward">+{ach.reward} XP</div>}
                      {isUnlocked && <div className="achievement-unlocked">✓ Unlocked!</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Quote */}
            <div className="quote-card">
              <svg className="quote-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.066 1.514-1.867 2.557-2.404L18.48 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003z"/>
              </svg>
              <div className="quote-text-wrap">
                <p className="quote-text">"{todayQuote.text}"</p>
                <span className="quote-author">— {todayQuote.author}</span>
              </div>
            </div>

            {/* Gamification Strip */}
            <div className="stats-strip">
              <div className="stat-strip-card">
                <div className="stat-strip-top">
                  <span className="stat-strip-badge" style={{ background: levelInfo.color }}>
                    Lv.{levelInfo.level}
                  </span>
                  <span className="stat-strip-title">{levelInfo.title}</span>
                </div>
                <div className="stat-strip-bar">
                  <div style={{ width: `${levelInfo.progressPercent}%`, background: levelInfo.color }}></div>
                </div>
                <span className="stat-strip-sub">{xp} XP · {levelInfo.xpToNext > 0 ? `${levelInfo.xpToNext} to next` : "Max!"}</span>
              </div>

              <div className="stat-strip-card stat-strip-center">
                <div className="stat-strip-big">🔥</div>
                <div className="stat-strip-title">{streak} day streak</div>
                <span className="stat-strip-sub">Keep it going!</span>
              </div>

              <div className="stat-strip-card">
                <div className="stat-strip-top">
                  <span className="stat-strip-emoji">🎯</span>
                  <span className="stat-strip-title">Daily Challenge</span>
                  {dailyChallenge.completed && <span className="challenge-done-badge">Done ✓</span>}
                </div>
                <p className="stat-strip-challenge-text">{dailyChallenge.text}</p>
                <div className="stat-strip-bar">
                  <div style={{
                    width: `${Math.min((dailyChallenge.progress / dailyChallenge.requirement.count) * 100, 100)}%`,
                    background: dailyChallenge.completed ? "#10b981" : "#7c5cff"
                  }}></div>
                </div>
                <span className="stat-strip-sub">
                  {dailyChallenge.progress}/{dailyChallenge.requirement.count} · +{dailyChallenge.reward} XP
                </span>
              </div>

              <div className="stat-strip-card stat-strip-center"
                style={{ cursor: "pointer" }}
                onClick={() => setActivePage("achievements")}>
                <div className="stat-strip-big">🏆</div>
                <div className="stat-strip-title">{unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length}</div>
                <span className="stat-strip-sub">Badges earned</span>
              </div>
            </div>

            {/* Dashboard grid */}
            <div className="main-grid">
              <div className="left-column">
                <div className="card">
                  <h3>✓ Today's Tasks</h3>
                  <div className="task-list">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id}
                        className={`task-item ${task.done ? "done" : ""} ${task.high ? "high-priority" : ""}`}>
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                        <span>{task.text}</span>
                        {task.high && <span className="badge">HIGH</span>}
                        <button className="task-delete-btn" onClick={() => deleteTask(task.id)}><TrashIcon /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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

                <div className="card">
                  <div className="deadlines-list-header">
                    <h3 className="deadlines-title">UPCOMING DEADLINES</h3>
                    <button className="view-all-btn" onClick={() => setActivePage("deadlines")}>View all →</button>
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
      {showXpToast && (
        <div className="xp-toast">✨ +{showXpToast.amount} XP {showXpToast.reason}</div>
      )}
      <div className="dashboard">
        {menuOpen && (
          <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
        )}

        <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div>
            <div className="sidebar-top">
              <div className="logo">
                <div className="logo-box">S</div>
                <h2>StudyBloom</h2>
              </div>
              <button className="sidebar-close-btn" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="user-chip">
              <div className="user-avatar" style={{ background: levelInfo.color }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-level-inline">{levelInfo.title} · {xp} XP</span>
              </div>
            </div>

            <div className="sidebar-stats-row">
              <div className="sidebar-stat">
                <span className="sidebar-stat-icon">🔥</span>
                <div>
                  <div className="sidebar-stat-value">{streak}</div>
                  <div className="sidebar-stat-label">Streak</div>
                </div>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-icon">🎯</span>
                <div>
                  <div className="sidebar-stat-value">{dailyGoal.completed}/{dailyGoal.target}</div>
                  <div className="sidebar-stat-label">Goal</div>
                </div>
              </div>
              <div className="sidebar-stat" style={{ cursor: "pointer" }}
                onClick={() => { setActivePage("achievements"); setMenuOpen(false); }}>
                <span className="sidebar-stat-icon">🏆</span>
                <div>
                  <div className="sidebar-stat-value">{unlockedAchievements.length}</div>
                  <div className="sidebar-stat-label">Badges</div>
                </div>
              </div>
            </div>

            <nav>
              <button className={activePage === "dashboard" ? "active" : ""}
                onClick={() => { setActivePage("dashboard"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>Dashboard
              </button>
              <button className={activePage === "tasks" ? "active" : ""}
                onClick={() => { setActivePage("tasks"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>Task Manager
              </button>
              <button className={activePage === "schedule" ? "active" : ""}
                onClick={() => { setActivePage("schedule"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>Schedule
              </button>
              <button className={activePage === "deadlines" ? "active" : ""}
                onClick={() => { setActivePage("deadlines"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Deadlines
                {upcomingDeadlines.filter(d => getDueInfo(d.dueDate).color === "#ef4444").length > 0 && (
                  <span className="nav-badge">
                    {upcomingDeadlines.filter(d => getDueInfo(d.dueDate).color === "#ef4444").length}
                  </span>
                )}
              </button>
              <button className={activePage === "focus" ? "active" : ""}
                onClick={() => { setActivePage("focus"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>Focus Mode
              </button>
              <button className={activePage === "notes" ? "active" : ""}
                onClick={() => { setActivePage("notes"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>Notes
              </button>
              <button className={activePage === "achievements" ? "active" : ""}
                onClick={() => { setActivePage("achievements"); setMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>Badges
              </button>

              <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>Light Mode</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>Dark Mode</>
                )}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>Log Out
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

        <main className="main-content">
          <div className="top-card">
            <div className="top-card-left">
              <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <h1>{greeting}, {firstName}! 👋</h1>
              <p>You have {weeklySchedule[today]?.length || 0} classes today, {tasks.filter((t) => !t.done).length} pending tasks and {upcomingDeadlines.length} upcoming deadlines.</p>
            </div>
            <div className="top-card-right">
              <span className="focus-label">FOCUS TIMER</span>
              <h2 className="top-timer">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </h2>
              <button className="start-focus-btn" onClick={startFocusSession}>
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