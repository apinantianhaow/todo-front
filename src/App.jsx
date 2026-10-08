import React, { useState, useEffect, useMemo } from 'react';

import {
  RefreshCw, Settings, LogOut, Pencil, Trash2, Check, X, Search, Plus, ArrowUpDown,
} from 'lucide-react';

/* ============================================================
   แก้ข้อมูลของตัวเองตรงนี้ก่อน deploy (2 บรรทัดแรกสำคัญที่สุด)
   ============================================================ */
const STUDENT_NAME = 'Aphinan Thianhao';  // ← ชื่อ-นามสกุล
const STUDENT_ID = '6630301021';          // ← รหัสนิสิต
const APP_NAME = 'จดก่อนลืม';
const COURSE_LABEL = 'Week 12 Full Stack Integration';

const getInitialApiUrl = () => {
  // Check for Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for Create React App or Node environments
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Default fallback for local development
  return 'http://localhost:5000';
};

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'active', label: 'ยังไม่เสร็จ' },
  { key: 'completed', label: 'เสร็จแล้ว' },
];

// แปลข้อความ error จาก backend / network ให้เป็นภาษาไทยที่บอกวิธีแก้
const AUTH_ERRORS_TH = {
  'Invalid email or password.': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง ตรวจแล้วลองอีกครั้ง',
  'User already registered.': 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน',
  'Email and password required': 'กรอกอีเมลและรหัสผ่านให้ครบ',
  'Server error during registration': 'backend บันทึกบัญชีไม่สำเร็จ ตรวจว่า backend เชื่อมต่อ MongoDB ได้',
  'Server error during login': 'backend ตรวจบัญชีไม่สำเร็จ ตรวจว่า backend เชื่อมต่อ MongoDB ได้',
  'Authentication failed': 'เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง',
};

const toThaiError = (err) => {
  if (err instanceof TypeError) return 'ติดต่อ backend ไม่ได้ ตรวจ Backend URL ที่ปุ่มตั้งค่ามุมขวาบน';
  if (err instanceof SyntaxError) return 'backend ตอบกลับมาไม่ใช่ JSON ตรวจว่า Backend URL ขึ้นต้นด้วย https:// และไม่มี path ต่อท้าย';
  return AUTH_ERRORS_TH[err.message] || err.message;
};

const NOTEBOOK_CSS = `
:root{
  --desk:#DFE4EA; --paper:#FFFFFF; --ink:#22409A; --ink-dark:#1A3383; --ink-soft:#8E9CC6;
  --rule:#A9C7EC; --red:#D93A48; --graphite:#323946; --meta:#5F6A7D; --marker:#FFE36E;
  --line:48px; --margin-w:56px; --rule-shift:12px;
  --font-hand:'Mali','Anuphan',system-ui,sans-serif;
  --font-ui:'Anuphan',system-ui,-apple-system,'Segoe UI',sans-serif;
}
html,body{background:var(--desk);}
:where(.nb-app) *,:where(.nb-app) *::before,:where(.nb-app) *::after{box-sizing:border-box;}
:where(.nb-app) :where(h1,h2,p,ul){margin:0;padding:0;}
:where(.nb-app) :where(ul){list-style:none;}
:where(.nb-app) :where(button,input,select){font:inherit;color:inherit;}
:where(.nb-app) :where(button){background:none;border:0;padding:0;cursor:pointer;}
:where(.nb-app) :where(input){border:0;}
.nb-app{min-height:100vh;background:var(--desk);color:var(--graphite);font-family:var(--font-ui);font-size:16px;line-height:1.6;}
.nb-app ::selection{background:var(--marker);color:inherit;}
.nb-app :focus-visible{outline:2px solid var(--ink);outline-offset:2px;border-radius:6px;}
.nb-wrap{max-width:760px;margin:0 auto;padding:44px 20px 36px;}

.nb-header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px 24px;margin-bottom:30px;}
.nb-title{font-family:var(--font-hand);font-weight:700;font-size:46px;line-height:1.1;color:var(--ink);}
.nb-owner{margin-top:10px;font-size:16px;}
.nb-owner b{font-weight:600;}
.nb-account{font-size:14px;color:var(--meta);}
.nb-tools{display:flex;align-items:center;gap:4px;}
.nb-iconbtn{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;color:var(--graphite);transition:background-color .15s,color .15s,opacity .15s;}
.nb-iconbtn:hover{background:rgba(34,64,154,.08);color:var(--ink);}
.nb-textbtn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px;border-radius:8px;font-size:14px;font-weight:500;color:var(--graphite);transition:background-color .15s,color .15s;}
.nb-textbtn:hover{background:rgba(217,58,72,.08);color:var(--red);}

.nb-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 20px;margin-bottom:14px;}
.nb-tabs{display:flex;flex-wrap:wrap;gap:4px 8px;}
.nb-tab{font-size:15px;font-weight:500;color:var(--meta);padding:2px 6px;border-radius:2px;transition:color .15s;}
.nb-tab:hover{color:var(--graphite);}
.nb-tab[aria-pressed="true"]{color:var(--graphite);background:linear-gradient(transparent 50%,var(--marker) 50%,var(--marker) 90%,transparent 90%);}
.nb-count{font-size:13px;color:var(--meta);margin-left:5px;}
.nb-finders{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;}
.nb-sort,.nb-search{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--meta);}
.nb-sort select{background:transparent;color:var(--graphite);font-size:14px;font-weight:500;padding:4px 2px;cursor:pointer;}
.nb-search input{width:170px;background:transparent;border-bottom:1.5px solid #AEB7C6;padding:4px 2px;font-size:14px;color:var(--graphite);}
.nb-search input::placeholder{color:#8F99AB;}
.nb-search input:focus{border-bottom-color:var(--ink);}

.nb-paper{position:relative;background:var(--paper);border-radius:4px;box-shadow:0 1px 2px rgba(35,45,70,.08),0 18px 40px -24px rgba(35,45,70,.45);overflow:hidden;}
.nb-paper::before{content:"";position:absolute;top:0;bottom:0;left:var(--margin-w);width:1.5px;background:var(--red);opacity:.7;pointer-events:none;}
.nb-pagehead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px;padding:22px 20px 10px calc(var(--margin-w) + 16px);font-size:14px;color:var(--meta);border-bottom:1px solid var(--rule);}
.nb-date span{font-family:var(--font-hand);font-size:17px;font-weight:500;color:var(--ink);margin-left:6px;}
.nb-lines{background-image:linear-gradient(to bottom,transparent calc(var(--line) - 1px),var(--rule) calc(var(--line) - 1px));background-size:100% var(--line);background-position:0 calc(-1 * var(--rule-shift));min-height:calc(var(--line) * 9);}

.nb-add{display:flex;align-items:center;height:var(--line);}
.nb-add:focus-within{background:rgba(34,64,154,.05);}
.nb-margin{flex:none;width:var(--margin-w);height:var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink-soft);}
.nb-add:focus-within .nb-margin{color:var(--ink);}
.nb-add input{flex:1;min-width:0;height:var(--line);padding:0 12px 0 16px;background:transparent;font-family:var(--font-hand);font-size:19px;font-weight:500;color:var(--ink);}
.nb-add input::placeholder{color:#A3AEC6;font-weight:400;}
.nb-add input:focus{outline:none;}
.nb-addbtn{flex:none;margin-right:10px;height:32px;padding:0 14px;border-radius:999px;background:var(--ink);color:#fff;font-size:14px;font-weight:600;transition:background-color .15s,opacity .15s;}
.nb-addbtn:hover{background:var(--ink-dark);}
.nb-addbtn:disabled{opacity:.35;cursor:not-allowed;}

.nb-row{display:flex;align-items:flex-start;min-height:var(--line);}
.nb-body{flex:1;min-width:0;display:flex;align-items:flex-start;gap:10px;padding-left:16px;}
.nb-text{flex:1;min-width:0;font-family:var(--font-hand);font-weight:500;font-size:19px;line-height:var(--line);color:var(--ink);overflow-wrap:anywhere;}
.nb-text.is-done{color:var(--ink-soft);text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:2px;}
.nb-time{flex:none;font-size:13px;line-height:var(--line);color:var(--meta);white-space:nowrap;}
.nb-actions{flex:none;display:flex;align-items:center;gap:2px;height:var(--line);padding-right:10px;}
.nb-actions .nb-iconbtn{width:32px;height:32px;color:var(--meta);}
.nb-actions .nb-del:hover{color:var(--red);background:rgba(217,58,72,.08);}
@media (hover:hover){
  .nb-row .nb-reveal{opacity:0;}
  .nb-row:hover .nb-reveal,.nb-row:focus-within .nb-reveal{opacity:1;}
}
.nb-edit{flex:1;min-width:0;height:var(--line);margin-left:-6px;padding:0 6px;background:rgba(255,227,110,.32);font-family:var(--font-hand);font-weight:500;font-size:19px;color:var(--ink);}
.nb-edit:focus{outline:none;}

.nb-check{position:relative;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;}
.nb-check .nb-box{width:18px;height:18px;border:1.75px solid #97A2B6;border-radius:3px;transition:border-color .15s;}
.nb-check:hover .nb-box{border-color:var(--ink);}
.nb-check svg{position:absolute;left:-1px;top:-9px;width:36px;height:36px;overflow:visible;pointer-events:none;}
.nb-check path{fill:none;stroke:var(--red);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 2;stroke-dashoffset:1.05;opacity:0;transition:stroke-dashoffset .34s cubic-bezier(.3,.7,.4,1);}
.nb-check[aria-checked="true"] path{stroke-dashoffset:0;opacity:1;}
.nb-check[aria-checked="true"] .nb-box{border-color:#CBD2DE;}

.nb-empty{font-family:var(--font-hand);font-size:17px;line-height:var(--line);color:#7E89A0;padding:0 16px 0 calc(var(--margin-w) + 16px);}

.nb-footer{margin-top:22px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;font-size:13px;color:var(--meta);}
.nb-status{display:inline-flex;align-items:center;gap:8px;}
.nb-status b{font-weight:600;color:var(--graphite);overflow-wrap:anywhere;}
.nb-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#9AA4B8;}
.nb-dot.is-ok{background:#2F8F5B;}
.nb-dot.is-bad{background:var(--red);}

.nb-login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:64px 16px;position:relative;}
.nb-corner{position:absolute;top:16px;right:16px;}
.nb-cover{width:100%;max-width:440px;background:var(--ink);border-radius:8px 14px 14px 8px;padding:30px 26px 26px 34px;box-shadow:inset 10px 0 0 var(--ink-dark),0 22px 48px -28px rgba(20,30,70,.7);}
.nb-label{background:var(--paper);border-radius:12px;padding:24px 22px 22px;}
.nb-label h1{font-family:var(--font-hand);font-weight:700;font-size:40px;line-height:1.1;color:var(--ink);margin-bottom:14px;}
.nb-field{display:flex;align-items:baseline;gap:10px;min-height:42px;}
.nb-field > span:first-child{flex:none;width:72px;font-size:14px;color:var(--meta);}
.nb-field .nb-val,.nb-field input{flex:1;min-width:0;font-family:var(--font-hand);font-size:18px;font-weight:500;color:var(--ink);border-bottom:2px dotted #9EAAC0;padding:2px 2px 4px;}
.nb-field .nb-val{overflow-wrap:anywhere;}
.nb-field input{background:transparent;}
.nb-field input:focus{outline:none;border-bottom-style:solid;border-bottom-color:var(--ink);}
.nb-field input[type=password]{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.14em;}
.nb-sep{height:1px;background:var(--rule);margin:16px 0 12px;}
.nb-lead{font-size:15px;color:var(--graphite);margin-bottom:4px;}
.nb-hint{font-size:13px;color:var(--meta);margin-top:8px;}
.nb-error{margin-top:12px;font-size:14px;color:#A3202E;background:rgba(217,58,72,.07);border-left:3px solid var(--red);padding:8px 10px;border-radius:2px 6px 6px 2px;}
.nb-primary{margin-top:18px;width:100%;height:46px;border-radius:999px;background:var(--ink);color:#fff;font-size:16px;font-weight:600;transition:background-color .15s,opacity .15s;}
.nb-primary:hover{background:var(--ink-dark);}
.nb-primary:disabled{opacity:.55;cursor:progress;}
.nb-switch{margin-top:14px;text-align:center;font-size:14px;color:var(--meta);}
.nb-switch button{color:var(--ink);font-weight:600;margin-left:6px;text-decoration:underline;text-underline-offset:3px;}

.nb-overlay{position:fixed;inset:0;z-index:50;background:rgba(28,36,58,.45);display:flex;align-items:center;justify-content:center;padding:16px;}
.nb-dialog{position:relative;width:100%;max-width:440px;background:var(--paper);border-radius:10px;padding:24px 22px 20px;box-shadow:0 24px 60px -24px rgba(20,30,70,.55);}
.nb-dialog h2{font-size:19px;font-weight:600;color:var(--graphite);margin-bottom:6px;padding-right:32px;}
.nb-dialog p{font-size:14px;color:var(--meta);}
.nb-dialog .nb-quote{font-family:var(--font-hand);font-size:18px;font-weight:500;color:var(--ink);margin:10px 0 4px;overflow-wrap:anywhere;}
.nb-dialog input{width:100%;margin-top:14px;font-size:14px;padding:10px 12px;border:1.5px solid #C2CAD6;border-radius:8px;color:var(--graphite);background:#fff;}
.nb-dialog input:focus{outline:none;border-color:var(--ink);}
.nb-close{position:absolute;top:12px;right:12px;}
.nb-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}
.nb-ghost{height:38px;padding:0 14px;border-radius:999px;font-size:14px;font-weight:500;color:var(--graphite);transition:background-color .15s;}
.nb-ghost:hover{background:rgba(50,57,70,.07);}
.nb-solid{height:38px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:var(--ink);transition:background-color .15s;}
.nb-solid:hover{background:var(--ink-dark);}
.nb-solid.is-danger{background:var(--red);}
.nb-solid.is-danger:hover{background:#B92E3B;}

@media (max-width:560px){
  :root{--margin-w:46px;}
  .nb-wrap{padding:28px 14px 24px;}
  .nb-title{font-size:38px;}
  .nb-time{display:none;}
  .nb-finders{width:100%;}
  .nb-search{flex:1;}
  .nb-search input{width:100%;}
  .nb-text,.nb-add input,.nb-edit{font-size:18px;}
  .nb-cover{padding:22px 16px 18px 24px;}
}
@media (prefers-reduced-motion:reduce){
  .nb-check path{transition:none;}
}
`;

const NotebookStyles = () => <style>{NOTEBOOK_CSS}</style>;

function SettingsModal({ value, onChange, onCancel, onSave }) {
  return (
    <div className="nb-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="nb-dialog" role="dialog" aria-modal="true" aria-labelledby="nb-settings-title">
        <button type="button" onClick={onCancel} className="nb-iconbtn nb-close" aria-label="ปิด">
          <X size={18} />
        </button>
        <h2 id="nb-settings-title">Backend URL</h2>
        <p>
          ที่อยู่ของ backend ที่หน้านี้เรียกใช้ ค่าเริ่มต้นมาจาก VITE_API_URL ตอน build
          ค่าที่แก้ตรงนี้ใช้ชั่วคราวจนกว่าจะรีเฟรชหน้า
        </p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Backend URL"
          spellCheck={false}
          autoFocus
        />
        <div className="nb-dialog-actions">
          <button type="button" onClick={onCancel} className="nb-ghost">ยกเลิก</button>
          <button type="button" onClick={onSave} className="nb-solid">ใช้ URL นี้</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ todo, onCancel, onConfirm }) {
  return (
    <div className="nb-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="nb-dialog" role="alertdialog" aria-modal="true" aria-labelledby="nb-delete-title">
        <h2 id="nb-delete-title">ลบงานนี้?</h2>
        <p className="nb-quote">{todo.text}</p>
        <p>ลบแล้วกู้คืนไม่ได้</p>
        <div className="nb-dialog-actions">
          <button type="button" onClick={onCancel} className="nb-ghost" autoFocus>เก็บไว้</button>
          <button type="button" onClick={onConfirm} className="nb-solid is-danger">ลบงาน</button>
        </div>
      </div>
    </div>
  );
}

function TickBox({ checked, disabled, label, onToggle }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className="nb-check"
    >
      <span className="nb-box" />
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path pathLength="1" d="M6.5 19.5c2.7 1.6 5 4.1 6.9 7.3C17.4 17.2 22.9 9.4 31 3.4" />
      </svg>
    </button>
  );
}

export default function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('taskflow_token') || null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('taskflow_user') || null);
  const [isAuthMode, setIsAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Todo State
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Settings & Network State
  const [apiUrl, setApiUrl] = useState(getInitialApiUrl);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingApiUrl, setPendingApiUrl] = useState(getInitialApiUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  // Esc ปิดหน้าต่าง popup
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setDeleteCandidate(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const endpoint = isAuthMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      setCurrentUser(data.email);
      localStorage.setItem('taskflow_token', data.token);
      localStorage.setItem('taskflow_user', data.email);
      setAuthPassword('');
      setAuthEmail('');
      setIsConnected(true);
    } catch (err) {
      setAuthError(toThaiError(err));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setTodos([]);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  const fetchTodos = async (targetUrl = apiUrl) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/todos`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired');
      }

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setTodos(data);
      setIsConnected(true);
      setLoadError(false);
    } catch (err) {
      console.warn('Backend issue:', err.message);
      setIsConnected(false);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTodos(apiUrl);
  }, [apiUrl, token]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const trimmed = newTodoText.trim();
    if (!trimmed) return;

    const tempId = `local-${Date.now()}`;
    const newTodo = { _id: tempId, text: trimmed, completed: false, createdAt: new Date().toISOString() };
    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoText('');

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/todos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: trimmed }),
      });

      if (response.status === 401) return handleLogout();
      if (!response.ok) throw new Error('Failed to create on server');

      const savedTodo = await response.json();
      setTodos((prev) => prev.map((t) => (t._id === tempId ? savedTodo : t)));
    } catch (err) {
      console.error('Error saving todo:', err);
      // Remove temp item on failure
      setTodos((prev) => prev.filter((t) => t._id !== tempId));
    }
  };

  const handleToggleTodo = async (todo) => {
    const updatedStatus = !todo.completed;
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? { ...t, completed: updatedStatus } : t)));

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ completed: updatedStatus }),
      });
      if (response.status === 401) handleLogout();
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t._id === todo._id ? { ...t, completed: todo.completed } : t)));
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = async (id) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const previousTodos = [...todos];
    setTodos((prev) => prev.map((t) => t._id === id ? { ...t, text: trimmed, updatedAt: new Date().toISOString() } : t));
    setEditingId(null);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/todos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ text: trimmed }),
      });
      if (response.status === 401) handleLogout();
      if (!response.ok) throw new Error('Update failed');
    } catch (err) {
      setTodos(previousTodos);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const targetId = deleteCandidate._id;
    setTodos((prev) => prev.filter((t) => t._id !== targetId));
    setDeleteCandidate(null);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/todos/${targetId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.status === 401) handleLogout();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    []
  );

  const apiHost = useMemo(() => {
    try { return new URL(apiUrl).host; } catch { return apiUrl; }
  }, [apiUrl]);

  const doneCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const counts = { all: todos.length, active: todos.length - doneCount, completed: doneCount };

  const filteredTodos = useMemo(() => {
    const result = todos.filter((todo) => {
      const matchesFilter = filter === 'all' ? true : filter === 'active' ? !todo.completed : todo.completed;
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === 'az') return a.text.localeCompare(b.text, 'th', { sensitivity: 'base' });
      if (sortBy === 'za') return b.text.localeCompare(a.text, 'th', { sensitivity: 'base' });
      if (sortBy === 'status') return Number(a.completed) - Number(b.completed);
      return 0;
    });
  }, [todos, filter, searchQuery, sortBy]);

  const settingsModal = isSettingsOpen && (
    <SettingsModal
      value={pendingApiUrl}
      onChange={setPendingApiUrl}
      onCancel={() => setIsSettingsOpen(false)}
      onSave={() => { setApiUrl(pendingApiUrl); setIsSettingsOpen(false); }}
    />
  );

  /* ---------------- หน้าเข้าสู่ระบบ: ปกสมุดพร้อมป้ายชื่อ ---------------- */
  if (!token) {
    const isLogin = isAuthMode === 'login';
    return (
      <div className="nb-app">
        <NotebookStyles />
        <main className="nb-login">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="nb-iconbtn nb-corner"
            aria-label="ตั้งค่า Backend URL"
            title="ตั้งค่า Backend URL"
          >
            <Settings size={20} />
          </button>

          <div className="nb-cover">
            <div className="nb-label">
              <h1>{APP_NAME}</h1>
              <div className="nb-field"><span>ชื่อ</span><span className="nb-val">{STUDENT_NAME}</span></div>
              <div className="nb-field"><span>รหัสนิสิต</span><span className="nb-val">{STUDENT_ID}</span></div>
              <div className="nb-field"><span>วิชา</span><span className="nb-val">{COURSE_LABEL}</span></div>

              <div className="nb-sep" />
              <p className="nb-lead">
                {isLogin ? 'เข้าสู่ระบบเพื่อเปิดสมุดงานของคุณ' : 'สร้างบัญชีใหม่เพื่อเริ่มจดงาน'}
              </p>

              <form onSubmit={handleAuth}>
                <label className="nb-field">
                  <span>อีเมล</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </label>
                <label className="nb-field">
                  <span>รหัสผ่าน</span>
                  <input
                    type="password"
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </label>
                {!isLogin && (
                  <p className="nb-hint">รหัสผ่านจะถูกเก็บเป็น bcrypt hash ไม่ใช่ตัวอักษรจริง</p>
                )}
                {authError && <p className="nb-error" role="alert">{authError}</p>}
                <button type="submit" disabled={isAuthLoading} className="nb-primary">
                  {isAuthLoading
                    ? (isLogin ? 'กำลังเข้าสู่ระบบ…' : 'กำลังสร้างบัญชี…')
                    : (isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชี')}
                </button>
              </form>

              <p className="nb-switch">
                {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}
                <button
                  type="button"
                  onClick={() => { setIsAuthMode(isLogin ? 'register' : 'login'); setAuthError(''); }}
                >
                  {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </button>
              </p>
            </div>
          </div>
        </main>
        {settingsModal}
      </div>
    );
  }

  /* ---------------- หน้าหลัก: หน้าสมุดมีเส้นบรรทัด ---------------- */
  const query = searchQuery.trim();
  let emptyMessage = 'หน้านี้ยังว่าง เขียนงานแรกที่บรรทัดบนสุดได้เลย';
  if (loadError) emptyMessage = 'โหลดรายการไม่ได้ ตรวจ Backend URL ที่ปุ่มตั้งค่า แล้วกดโหลดใหม่';
  else if (isLoading && todos.length === 0) emptyMessage = 'กำลังโหลดรายการ…';
  else if (todos.length > 0 && query) emptyMessage = `ไม่พบงานที่มีคำว่า “${query}”`;
  else if (todos.length > 0 && filter === 'active') emptyMessage = 'ไม่มีงานค้างแล้ว ทำครบทุกงาน';
  else if (todos.length > 0 && filter === 'completed') emptyMessage = 'ยังไม่มีงานที่เสร็จ ติ๊กช่องหน้างานเมื่อทำเสร็จ';

  let statusClass = '';
  let statusText = <>กำลังซิงก์กับ <b>{apiHost}</b></>;
  if (!isLoading && isConnected) { statusClass = 'is-ok'; statusText = <>เชื่อมต่อกับ <b>{apiHost}</b> แล้ว</>; }
  if (!isLoading && !isConnected) { statusClass = 'is-bad'; statusText = <>ติดต่อ <b>{apiHost}</b> ไม่ได้</>; }

  return (
    <div className="nb-app">
      <NotebookStyles />
      <div className="nb-wrap">
        <header className="nb-header">
          <div>
            <h1 className="nb-title">{APP_NAME}</h1>
            <p className="nb-owner">
              สมุดงานของ <b>{STUDENT_NAME}</b> (รหัสนิสิต {STUDENT_ID})
            </p>
            <p className="nb-account">เข้าสู่ระบบด้วย {currentUser}</p>
          </div>
          <div className="nb-tools">
            <button
              type="button"
              onClick={() => fetchTodos(apiUrl)}
              className="nb-iconbtn"
              aria-label="โหลดรายการใหม่"
              title="โหลดรายการใหม่"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin motion-reduce:animate-none' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="nb-iconbtn"
              aria-label="ตั้งค่า Backend URL"
              title="ตั้งค่า Backend URL"
            >
              <Settings size={18} />
            </button>
            <button type="button" onClick={handleLogout} className="nb-textbtn">
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </header>

        <div className="nb-toolbar">
          <div className="nb-tabs" role="group" aria-label="กรองรายการ">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className="nb-tab"
              >
                {f.label}<span className="nb-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>

          <div className="nb-finders">
            <label className="nb-sort">
              <ArrowUpDown size={15} aria-hidden="true" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="เรียงลำดับ">
                <option value="newest">ใหม่สุดก่อน</option>
                <option value="oldest">เก่าสุดก่อน</option>
                <option value="az">ตามตัวอักษร ก–ฮ</option>
                <option value="za">ย้อนตัวอักษร ฮ–ก</option>
                <option value="status">งานค้างขึ้นก่อน</option>
              </select>
            </label>
            <label className="nb-search">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหางาน"
                aria-label="ค้นหางาน"
              />
            </label>
          </div>
        </div>

        <section className="nb-paper" aria-label="รายการงาน">
          <div className="nb-pagehead">
            <span>{todos.length ? `เสร็จแล้ว ${doneCount} จาก ${todos.length} งาน` : ''}</span>
            <span className="nb-date">วันที่<span>{todayLabel}</span></span>
          </div>

          <div className="nb-lines">
            <form onSubmit={handleAddTodo} className="nb-add">
              <span className="nb-margin" aria-hidden="true"><Plus size={18} /></span>
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="เขียนงานใหม่"
                aria-label="งานใหม่"
                maxLength={500}
              />
              <button type="submit" disabled={!newTodoText.trim()} className="nb-addbtn">เพิ่มงาน</button>
            </form>

            {filteredTodos.length === 0 ? (
              <p className="nb-empty">{emptyMessage}</p>
            ) : (
              <ul>
                {filteredTodos.map((todo) => {
                  const formattedDate = formatDateTime(todo.createdAt || todo.timestamp);
                  const isEditing = editingId === todo._id;

                  return (
                    <li key={todo._id} className="nb-row">
                      <span className="nb-margin">
                        <TickBox
                          checked={todo.completed}
                          disabled={isEditing}
                          onToggle={() => handleToggleTodo(todo)}
                          label={todo.completed ? `ยกเลิกเสร็จ: ${todo.text}` : `ทำเสร็จแล้ว: ${todo.text}`}
                        />
                      </span>
                      <div className="nb-body">
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingText}
                            maxLength={500}
                            aria-label="แก้ไขงาน"
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(todo._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="nb-edit"
                          />
                        ) : (
                          <p
                            onDoubleClick={() => !todo.completed && handleStartEdit(todo)}
                            className={`nb-text ${todo.completed ? 'is-done' : ''}`}
                          >
                            {todo.text}
                          </p>
                        )}
                        {formattedDate && !isEditing && (
                          <time className="nb-time" dateTime={todo.createdAt}>{formattedDate}</time>
                        )}
                        <div className="nb-actions">
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => handleSaveEdit(todo._id)} className="nb-iconbtn" aria-label="บันทึก">
                                <Check size={17} />
                              </button>
                              <button type="button" onClick={() => setEditingId(null)} className="nb-iconbtn" aria-label="ยกเลิกการแก้ไข">
                                <X size={17} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => handleStartEdit(todo)} className="nb-iconbtn nb-reveal" aria-label={`แก้ไข: ${todo.text}`}>
                                <Pencil size={15} />
                              </button>
                              <button type="button" onClick={() => setDeleteCandidate(todo)} className="nb-iconbtn nb-reveal nb-del" aria-label={`ลบ: ${todo.text}`}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <footer className="nb-footer">
          <span className="nb-status" aria-live="polite">
            <span className={`nb-dot ${statusClass}`} aria-hidden="true" />
            <span>{statusText}</span>
          </span>
          <span>{COURSE_LABEL} สร้างด้วย React, Express และ MongoDB บน Railway</span>
        </footer>
      </div>

      {settingsModal}

      {deleteCandidate && (
        <DeleteModal
          todo={deleteCandidate}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
