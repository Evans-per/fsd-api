/**
 * Quiz Master — Shared Application Module
 * Handles: Dark Mode, Sound Effects, Toasts, Confetti, Leaderboard
 */

// ─── Dark Mode ────────────────────────────────────────────
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('quizTheme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.updateIcon();
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('quizTheme', next);
    this.updateIcon();
    SoundManager.play('click');
  },

  updateIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
};

// ─── Sound Effects (Web Audio API) ────────────────────────
const SoundManager = {
  ctx: null,
  enabled: true,

  init() {
    this.enabled = localStorage.getItem('quizSound') !== 'false';
    this.updateIcon();
  },

  getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('quizSound', this.enabled);
    this.updateIcon();
    if (this.enabled) this.play('click');
  },

  updateIcon() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.innerHTML = this.enabled
      ? '<i class="fas fa-volume-high"></i>'
      : '<i class="fas fa-volume-xmark"></i>';
  },

  play(type) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'correct':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.1);
          osc.frequency.setValueAtTime(784, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'wrong':
          osc.type = 'square';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'complete':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.12);
          osc.frequency.setValueAtTime(784, now + 0.24);
          osc.frequency.setValueAtTime(1047, now + 0.36);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;

        case 'tick':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'timeout':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
      }
    } catch (e) {
      // Audio not supported
    }
  }
};

// ─── Toast Notifications ──────────────────────────────────
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ─── Confetti ─────────────────────────────────────────────
const Confetti = {
  launch() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 180;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.05;
        if (frame > maxFrames - 40) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    draw();
  }
};

// ─── Leaderboard ──────────────────────────────────────────
const Leaderboard = {
  get() {
    return JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
  },

  add(name, score, total, percentage) {
    const entries = this.get();
    entries.push({
      name,
      score,
      total,
      percentage,
      date: new Date().toISOString()
    });
    // Keep top 10 sorted by percentage desc
    entries.sort((a, b) => b.percentage - a.percentage);
    localStorage.setItem('quizLeaderboard', JSON.stringify(entries.slice(0, 10)));
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entries = this.get();
    if (entries.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.9rem;padding:16px;">No entries yet. Complete a quiz to get on the board!</p>';
      return;
    }

    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'leaderboard-list';

    entries.slice(0, 8).forEach((entry, idx) => {
      const el = document.createElement('div');
      el.className = 'leaderboard-entry';
      if (idx === 0) el.classList.add('highlight');

      const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal';

      el.innerHTML = `
        <div class="leaderboard-rank ${rankClass}">${idx + 1}</div>
        <div class="leaderboard-name">${entry.name}</div>
        <div class="leaderboard-score">${entry.percentage}%</div>
      `;
      list.appendChild(el);
    });

    container.appendChild(list);
  }
};

// ─── High Score ───────────────────────────────────────────
const HighScore = {
  get() {
    return parseInt(localStorage.getItem('quizHighScore') || '0');
  },

  update(percentage) {
    const current = this.get();
    if (percentage > current) {
      localStorage.setItem('quizHighScore', percentage);
      return true; // new high score
    }
    return false;
  }
};

// ─── Initialize on Load ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  SoundManager.init();
});
