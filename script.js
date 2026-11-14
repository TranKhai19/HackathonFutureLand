/**
 * ==========================================================================
 * GOOGLE DEVELOPER GROUPS (GDG) ON CAMPUS HACKATHON 2026
 * CLIENT-SIDE LOGIC: AUDIO ENGINE, COUNTDOWN, VALIDATION, CONFETTI
 * ==========================================================================
 */

/**
 * 1. WEB AUDIO API RETRO CHIPTUNE SYNTHESIZER
 * Tổng hợp âm thanh 8-bit hoàn toàn bằng mã lệnh Web Audio API (không dùng file ngoài).
 */
class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Tiếng bíp cơ học retro khi click nút bấm
  playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio not initialized yet:', e);
    }
  }

  // Tiếng còi âm trầm cảnh báo khi form lỗi
  playError() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [180, 140].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.08);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Hợp âm Chiptune Fanfare chiến thắng khi nộp bài thành công
  playVictory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Arpeggio nốt nhạc 8-bit: C5, E5, G5, B5, C6
      const notes = [
        { f: 523.25, d: 0.10, t: 0.0 },
        { f: 659.25, d: 0.10, t: 0.10 },
        { f: 783.99, d: 0.10, t: 0.20 },
        { f: 987.77, d: 0.12, t: 0.30 },
        { f: 1046.50, d: 0.45, t: 0.42 }
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.18, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.005, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

const audioManager = new RetroAudioEngine();

// Gắn sự kiện nút bật/tắt âm thanh
const soundToggleBtn = document.getElementById('soundToggleBtn');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    audioManager.initCtx();
    const isMuted = audioManager.toggleMute();
    if (isMuted) {
      soundToggleBtn.textContent = '🔇';
      soundToggleBtn.classList.add('sound-off');
      soundToggleBtn.title = 'Bật âm thanh 8-bit';
    } else {
      soundToggleBtn.textContent = '🔊';
      soundToggleBtn.classList.remove('sound-off');
      soundToggleBtn.title = 'Tắt âm thanh 8-bit';
      audioManager.playClick();
    }
  });
}

// Menu điều hướng trên điện thoại (Mobile Menu)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    audioManager.playClick();
    navLinks.classList.toggle('mobile-open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

/**
 * 2. PIXEL COUNTDOWN TIMER (ĐẾM NGƯỢC THỜI GIAN THỰC ĐẾN 23:59:59 NGÀY 20/12)
 */
function initCountdown() {
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  function getTargetDeadline() {
    const now = new Date();
    let targetYear = now.getFullYear();
    // 20/12 lúc 23:59:59
    let target = new Date(targetYear, 11, 20, 23, 59, 59);
    if (now > target) {
      target = new Date(targetYear + 1, 11, 20, 23, 59, 59);
    }
    return target;
  }

  const deadline = getTargetDeadline();

  function update() {
    const now = new Date().getTime();
    const difference = deadline.getTime() - now;

    if (difference <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    elDays.textContent = String(days).padStart(2, '0');
    elHours.textContent = String(hours).padStart(2, '0');
    elMinutes.textContent = String(minutes).padStart(2, '0');
    elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}
initCountdown();

/**
 * 3. XUẤT FILE MẪU WORD .DOC THEO KHUNG CHUẨN CỦA BAN TỔ CHỨC
 */
const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
if (downloadTemplateBtn) {
  downloadTemplateBtn.addEventListener('click', () => {
    audioManager.playClick();
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Mau Mo Ta Du An GDG Hackathon 2026</title>
      <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 36px; }
        h1 { color: #1A73E8; text-align: center; font-size: 20pt; margin-bottom: 6px; }
        h2 { color: #202124; border-bottom: 2px solid #1A73E8; padding-bottom: 4px; font-size: 14pt; margin-top: 24px; }
        p, li { font-size: 12pt; text-align: justify; }
        .badge { background-color: #FBBC04; padding: 4px 8px; font-weight: bold; }
      </style>
      </head>
      <body>
        <h1>GOOGLE DEVELOPER GROUPS ON CAMPUS</h1>
        <p style='text-align: center; font-weight: bold; font-size: 14pt; color: #EA4335;'>HACKATHON 2026: CODE QUEST FOR IMPACT</p>
        <hr/>
        <h2>1. THÔNG TIN CHUNG VỀ ĐỘI THI &amp; DỰ ÁN</h2>
        <p><strong>Tên nhóm:</strong> [Điền tên nhóm của bạn]</p>
        <p><strong>Tên dự án:</strong> [Điền tên dự án]</p>
        <p><strong>Lĩnh vực dự thi:</strong> [AI for Good / FinTech / HealthTech / EdTech / Smart City]</p>
        <p><strong>Danh sách thành viên:</strong></p>
        <ul>
          <li>Trưởng nhóm: Họ tên - MSSV - Email - Vai trò</li>
          <li>Thành viên 2: Họ tên - MSSV - Email - Vai trò</li>
          <li>Thành viên 3: Họ tên - MSSV - Email - Vai trò</li>
        </ul>

        <h2>2. TỔNG QUAN BỐI CẢNH &amp; VẤN ĐỀ (PROBLEM STATEMENT)</h2>
        <p>Mô tả chi tiết bài toán xã hội hoặc vấn đề công nghệ mà dự án hướng tới giải quyết.</p>

        <h2>3. GIẢI PHÁP ĐỀ XUẤT &amp; TÍNH ĐỔI MỚI (SOLUTION &amp; INNOVATION)</h2>
        <p>Trình bày giải pháp kỹ thuật, tính năng cốt lõi và điểm sáng tạo vượt trội so với thị trường.</p>

        <h2>4. KIẾN TRÚC KỸ THUẬT &amp; CÔNG NGHỆ SỬ DỤNG (TECH STACK)</h2>
        <p>Công nghệ Google áp dụng: Gemini AI, Google Cloud Platform, Firebase, Flutter, Android, Web Vitals, v.v.</p>

        <h2>5. BÁO CÁO HIỆN TRẠNG TIẾN ĐỘ (&le; 30%)</h2>
        <p>Cam kết hiện trạng dự án không vượt quá 30% và lộ trình hoàn thiện 70% còn lại trong khuôn khổ Hackathon.</p>
      </body>
      </html>
    `;

    const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MAU_MO_TA_DU_AN_HACKATHON_GDG_2026.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * 4. LIGHTBOX IMAGE PREVIEW MODAL
 */
function openImageModal(imgSrc, title) {
  audioManager.playClick();
  const modal = document.getElementById('imgModalOverlay');
  const imgEl = document.getElementById('imgModalSrc');
  const titleEl = document.getElementById('imgModalTitle');
  if (modal && imgEl && titleEl) {
    imgEl.src = imgSrc;
    titleEl.textContent = title || 'IMAGE_PREVIEW.RAW';
    modal.classList.add('active');
  }
}

function closeImageModal() {
  audioManager.playClick();
  const modal = document.getElementById('imgModalOverlay');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Cho phép gọi từ HTML inline
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

/**
 * 5. PIXEL CONFETTI GENERATOR (CANVAS)
 * Hiệu ứng hạt vuông pixel đa màu rơi tự do khi nộp bài thành công
 */
class PixelConfetti {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#1A1A1A', '#FFFFFF'];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 140) {
    if (!this.canvas) return;
    this.resize();
    this.particles = [];
    const centerX = this.canvas.width / 2;
    const startY = this.canvas.height * 0.38;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.particles.push({
        x: centerX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.floor(Math.random() * 8) + 8, // Kích thước hạt pixel
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        life: 1,
        decay: Math.random() * 0.008 + 0.004,
        gravity: 0.25
      });
    }

    if (!this.animationId) {
      this.render();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(p.life, 0);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeStyle = '#1A1A1A';
      this.ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.render());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }

  clear() {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

const confettiEngine = new PixelConfetti('confetti-canvas');

/**
 * 6. FORM VALIDATION & POP-UP THÔNG BÁO THÀNH CÔNG
 */
const form = document.getElementById('submissionForm');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmModalBtn = document.getElementById('confirmModalBtn');

// Supabase REST configuration
const SUPABASE_CONFIG = {
  url: 'https://wcuaxiidfnickgpvatvs.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdWF4aWlkZm5pY2tncHZhdHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNzk5OTAsImV4cCI6MjEwOTk1NTk5MH0.AUSfM42HHXeYH_QkePwaOQS4xzmDMTGwWlkZJG8g6l4'
};

function validateField(input, errorEl, condition) {
  if (!input || !errorEl) return true;
  if (!condition) {
    input.classList.add('input-error');
    errorEl.classList.add('visible');
    return false;
  } else {
    input.classList.remove('input-error');
    errorEl.classList.remove('visible');
    return true;
  }
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isValidPhone(phone) {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone.trim().replace(/\s+/g, ''));
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Xóa báo lỗi khi người dùng gõ phím
document.querySelectorAll('.pixel-input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('input-error');
    const err = input.parentElement ? input.parentElement.querySelector('.field-error-msg') : null;
    if (err) err.classList.remove('visible');
  });
});

const commitmentCheck = document.getElementById('commitmentCheck');
if (commitmentCheck) {
  commitmentCheck.addEventListener('change', (e) => {
    const err = document.getElementById('commitmentCheckError');
    if (err && e.target.checked) {
      err.classList.remove('visible');
    }
  });
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamName = document.getElementById('teamName');
    const leaderName = document.getElementById('leaderName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const facebookUrl = document.getElementById('facebookUrl');
    const docUrl = document.getElementById('docUrl');
    const progressReportUrl = document.getElementById('progressReportUrl');
    const githubUrl = document.getElementById('githubUrl');
    const projectBrief = document.getElementById('projectBrief');

    let valid = true;

    if (!validateField(teamName, document.getElementById('teamNameError'), teamName.value.trim().length >= 3)) {
      valid = false;
    }
    if (!validateField(leaderName, document.getElementById('leaderNameError'), leaderName.value.trim().length >= 3)) {
      valid = false;
    }
    if (!validateField(phone, document.getElementById('phoneError'), isValidPhone(phone.value))) {
      valid = false;
    }
    if (!validateField(email, document.getElementById('emailError'), isValidEmail(email.value))) {
      valid = false;
    }
    if (!validateField(facebookUrl, document.getElementById('facebookUrlError'), isValidUrl(facebookUrl.value))) {
      valid = false;
    }
    if (!validateField(docUrl, document.getElementById('docUrlError'), isValidUrl(docUrl.value))) {
      valid = false;
    }
    if (!validateField(progressReportUrl, document.getElementById('progressReportUrlError'), isValidUrl(progressReportUrl.value))) {
      valid = false;
    }

    if (!commitmentCheck || !commitmentCheck.checked) {
      const err = document.getElementById('commitmentCheckError');
      if (err) err.classList.add('visible');
      valid = false;
    } else {
      const err = document.getElementById('commitmentCheckError');
      if (err) err.classList.remove('visible');
    }

    if (githubUrl && githubUrl.value.trim().length > 0 && !isValidUrl(githubUrl.value)) {
      validateField(githubUrl, document.getElementById('githubUrlError'), false);
      valid = false;
    } else if (githubUrl) {
      const err = document.getElementById('githubUrlError');
      if (err) err.classList.remove('visible');
      githubUrl.classList.remove('input-error');
    }

    if (!valid) {
      audioManager.playError();
      const firstError = document.querySelector('.input-error, .field-error-msg.visible');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const randomId = '#GDG-HK-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const timestampStr = now.toLocaleTimeString('vi-VN') + ' ' + now.toLocaleDateString('vi-VN');

    // Chuẩn bị payload gửi lên Supabase
    const payload = {
      submission_id: randomId,
      team_name: teamName.value.trim(),
      leader_name: leaderName.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      facebook_url: facebookUrl.value.trim(),
      doc_url: docUrl.value.trim(),
      progress_report_url: progressReportUrl.value.trim(),
      commitment_confirmed: !!(commitmentCheck && commitmentCheck.checked),
      github_url: githubUrl && githubUrl.value.trim() ? githubUrl.value.trim() : null,
      project_brief: projectBrief && projectBrief.value.trim() ? projectBrief.value.trim() : null
    };

    // Trạng thái loading cho nút bấm
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ ĐANG LƯU HỒ SƠ...';
    }

    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/teams`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi server (${response.status}): ${errorText}`);
      }

      // NỘP HỢP LỆ & LƯU DB THÀNH CÔNG: Phát nhạc chiến thắng 8-bit & hiển thị pop-up
      audioManager.playVictory();

      document.getElementById('modalSubmissionId').textContent = randomId;
      document.getElementById('modalTeamName').textContent = payload.team_name;
      document.getElementById('modalLeaderName').textContent = payload.leader_name;
      document.getElementById('modalTimestamp').textContent = timestampStr;

      if (successModal) {
        successModal.classList.add('active');
      }
      confettiEngine.burst(160);
    } catch (err) {
      console.error('Lỗi lưu đăng ký vào Supabase:', err);
      audioManager.playError();
      alert('Không thể lưu hồ sơ vào hệ thống: ' + (err.message || 'Vui lòng kiểm tra lại kết nối mạng.'));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

function closeModal() {
  audioManager.playClick();
  if (successModal) {
    successModal.classList.remove('active');
  }
  confettiEngine.clear();
  if (form) {
    form.reset();
  }
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (confirmModalBtn) confirmModalBtn.addEventListener('click', closeModal);
if (successModal) {
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });
}
