/**
 * SCOREBUG OCR — Editorial Web Platform Engine
 * Reference: https://gpg.dops.agency/
 */

document.addEventListener('DOMContentLoaded', () => {
  initScoreboardSimulator();
  initVisionModeSwitcher();
  initDownloadHandlers();
  initNavigationScrollSpy();
});

// ==========================================
// 1. ARENA SCOREBOARD SIMULATOR & OCR STREAM
// ==========================================
const scoreboardState = {
  sport: 'basketball',
  clockMinutes: 0,
  clockSeconds: 28,
  clockTenths: 4,
  shotClock: 14,
  homeScore: 98,
  awayScore: 94,
  period: 4,
  homeTeam: 'LAL',
  awayTeam: 'GSW',
  clockRunning: true
};

const boundingBoxes = {
  clock: { name: 'GAME CLOCK', val: '00:28.4', conf: '99.9%', thresh: 180 },
  shot: { name: 'SHOT CLOCK', val: '14', conf: '99.8%', thresh: 165 },
  home: { name: 'HOME SCORE', val: '98', conf: '99.9%', thresh: 185 },
  away: { name: 'AWAY SCORE', val: '94', conf: '99.9%', thresh: 185 },
  period: { name: 'PERIOD', val: '4', conf: '99.7%', thresh: 175 }
};

let selectedTargetField = 'clock';

function initScoreboardSimulator() {
  const clockEl = document.getElementById('simClock');
  const shotEl = document.getElementById('simShotClock');
  const homeEl = document.getElementById('simHomeScore');
  const awayEl = document.getElementById('simAwayScore');
  const periodEl = document.getElementById('simPeriod');

  // Clock countdown ticker
  setInterval(() => {
    if (!scoreboardState.clockRunning) return;

    if (scoreboardState.clockTenths > 0) {
      scoreboardState.clockTenths--;
    } else {
      scoreboardState.clockTenths = 9;
      if (scoreboardState.clockSeconds > 0) {
        scoreboardState.clockSeconds--;
      } else {
        if (scoreboardState.clockMinutes > 0) {
          scoreboardState.clockMinutes--;
          scoreboardState.clockSeconds = 59;
        } else {
          // Reset
          scoreboardState.clockMinutes = 10;
          scoreboardState.clockSeconds = 0;
          scoreboardState.clockTenths = 0;
        }
      }
    }

    // Shot clock ticker
    if (scoreboardState.shotClock > 0) {
      if (scoreboardState.clockTenths % 10 === 0) {
        scoreboardState.shotClock--;
      }
    } else {
      scoreboardState.shotClock = 24;
    }

    const minStr = String(scoreboardState.clockMinutes).padStart(2, '0');
    const secStr = String(scoreboardState.clockSeconds).padStart(2, '0');
    const timeFormatted = `${minStr}:${secStr}.${scoreboardState.clockTenths}`;

    // Update state
    boundingBoxes.clock.val = timeFormatted;
    boundingBoxes.shot.val = String(scoreboardState.shotClock);
    boundingBoxes.home.val = String(scoreboardState.homeScore);
    boundingBoxes.away.val = String(scoreboardState.awayScore);
    boundingBoxes.period.val = String(scoreboardState.period);

    // Update DOM
    if (clockEl) clockEl.textContent = timeFormatted;
    if (shotEl) shotEl.textContent = scoreboardState.shotClock;
    if (homeEl) homeEl.textContent = scoreboardState.homeScore;
    if (awayEl) awayEl.textContent = scoreboardState.awayScore;
    if (periodEl) periodEl.textContent = scoreboardState.period;

    // Update bounding box tags
    document.querySelectorAll('.ocr-bounding-box').forEach(box => {
      const fieldKey = box.getAttribute('data-field');
      if (boundingBoxes[fieldKey]) {
        const valSpan = box.querySelector('.box-val');
        if (valSpan) valSpan.textContent = boundingBoxes[fieldKey].val;
      }
    });

    // Update active inspector if present
    updateFieldInspector();
    updateLiveBroadcastTelemetry(timeFormatted);
  }, 100);
}

function updateFieldInspector() {
  const box = boundingBoxes[selectedTargetField];
  if (!box) return;

  const targetNameEl = document.getElementById('inspectorTargetName');
  const targetValEl = document.getElementById('inspectorDetectedVal');
  const targetConfEl = document.getElementById('inspectorConfidence');

  if (targetNameEl) targetNameEl.textContent = box.name;
  if (targetValEl) targetValEl.textContent = box.val;
  if (targetConfEl) targetConfEl.textContent = box.conf;
}

function updateLiveBroadcastTelemetry(timeFormatted) {
  const telemetryEl = document.getElementById('liveTelemetryLog');
  if (!telemetryEl) return;

  const latency = (2.4 + Math.random() * 0.8).toFixed(2);
  telemetryEl.innerHTML = `
<span class="text-gray-500">// Real-time OCR Inference Engine</span>
<span class="text-cyan-400">LATENCY:</span> ${latency} ms  |  <span class="text-emerald-400">FPS:</span> 60.0  |  <span class="text-yellow-400">VMIX SYNC:</span> OK (200)
<span class="text-gray-400">[vMix Dispatch]</span> <span class="text-cyan-300">GET /api/?Function=SetText&Input=Scorebug&SelectedName=Clock&Value=${encodeURIComponent(timeFormatted)}</span>
<span class="text-gray-400">[OBS File Out]</span> <span class="text-emerald-300">scoresight/out_files/clock.txt -> "${timeFormatted}"</span>
<span class="text-gray-400">[JSON Feed]</span>    {"clock":"${timeFormatted}","home":${scoreboardState.homeScore},"away":${scoreboardState.awayScore},"period":${scoreboardState.period},"shot":${scoreboardState.shotClock}}
  `.trim();
}

window.selectBox = function(fieldKey) {
  selectedTargetField = fieldKey;
  document.querySelectorAll('.ocr-bounding-box').forEach(box => {
    if (box.getAttribute('data-field') === fieldKey) {
      box.classList.add('active');
    } else {
      box.classList.remove('active');
    }
  });
  updateFieldInspector();
};

window.adjustScore = function(team, delta) {
  if (team === 'home') {
    scoreboardState.homeScore = Math.max(0, scoreboardState.homeScore + delta);
  } else {
    scoreboardState.awayScore = Math.max(0, scoreboardState.awayScore + delta);
  }
};

window.toggleClockSimulation = function() {
  scoreboardState.clockRunning = !scoreboardState.clockRunning;
  const btn = document.getElementById('simClockToggleBtn');
  if (btn) {
    btn.innerHTML = scoreboardState.clockRunning
      ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Pause Clock'
      : '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Resume Clock';
  }
};

// ==========================================
// 2. VISION MODE SWITCHER (Camera / Keystone / Binary)
// ==========================================
function initVisionModeSwitcher() {
  window.setVisionMode = function(mode) {
    const frame = document.getElementById('scoreboardDisplayFrame');
    if (!frame) return;

    document.querySelectorAll('[data-mode-btn]').forEach(btn => {
      if (btn.getAttribute('data-mode-btn') === mode) {
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400/50');
        btn.classList.remove('text-gray-400', 'border-transparent');
      } else {
        btn.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400/50');
        btn.classList.add('text-gray-400', 'border-transparent');
      }
    });

    if (mode === 'camera') {
      frame.style.filter = 'none';
      frame.classList.add('scanline-overlay');
    } else if (mode === 'keystone') {
      frame.style.filter = 'contrast(1.2) brightness(1.1)';
      frame.classList.remove('scanline-overlay');
    } else if (mode === 'binary') {
      frame.style.filter = 'grayscale(1) contrast(500%) brightness(0.9)';
      frame.classList.remove('scanline-overlay');
    }
  };
}

// ==========================================
// 3. DOWNLOAD HANDLERS (Windows & iOS)
// ==========================================
function initDownloadHandlers() {
  // Windows Setup Download Handler (Direct SCOREBUG_OCR.exe)
  window.downloadWindowsSetup = function(event) {
    if (event) event.preventDefault();

    showToast("Downloading SCOREBUG_OCR.exe (Windows Executable)", "windows");

    // Initiate direct file download for SCOREBUG_OCR.exe
    const downloadUrl = 'SCOREBUG_OCR.exe';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'SCOREBUG_OCR.exe');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // iOS Package Download Handler
  window.downloadIosPackage = function(event) {
    if (event) event.preventDefault();

    showToast("Downloading ScoreBugOCR_iOS.zip (Xcode SwiftUI Project & Assets)", "ios");

    const downloadUrl = 'ScoreBugOCR_iOS.zip';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'ScoreBugOCR_iOS.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}

function showToast(message, platform) {
  let toast = document.getElementById('downloadToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'downloadToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  const iconSvg = platform === 'windows' 
    ? `<svg class="w-6 h-6 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>`
    : `<svg class="w-6 h-6 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.3c.6-1.06 1.05-2.52.88-3.99-1.22.05-2.69.82-3.52 1.8-.74.85-1.39 2.22-1.21 3.55 1.36.1 2.76-.71 3.85-1.36z"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div class="text-xs">
      <div class="font-tech font-bold text-white text-sm">SCOREBUG OCR</div>
      <div class="text-gray-300 font-mono mt-0.5">${message}</div>
    </div>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// ==========================================
// 4. NAVIGATION SCROLL SPY
// ==========================================
function initNavigationScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-spy-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 160;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentId) {
        link.classList.add('text-cyan-400');
        link.classList.remove('text-gray-400');
      } else {
        link.classList.remove('text-cyan-400');
        link.classList.add('text-gray-400');
      }
    });
  });
}

// ==========================================
// 5. DONATE MODAL & PAYPAL INTEGRATION
// ==========================================
let currentDonationAmount = 25;
const PAYPAL_DONATION_EMAIL = 'himanshu02742@gmail.com';

window.openDonateModal = function(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeDonateModal = function() {
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.handleDonateBackdropClick = function(event) {
  if (event.target === document.getElementById('donateModal')) {
    closeDonateModal();
  }
};

window.selectDonationAmount = function(amount, buttonEl) {
  currentDonationAmount = amount;
  document.querySelectorAll('.amount-option-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  const customContainer = document.getElementById('customAmountContainer');
  if (customContainer) customContainer.classList.add('hidden');
  updatePayPalButtonLabel();
};

window.toggleCustomAmount = function(buttonEl) {
  document.querySelectorAll('.amount-option-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  const customContainer = document.getElementById('customAmountContainer');
  if (customContainer) {
    customContainer.classList.remove('hidden');
    const input = document.getElementById('customAmountInput');
    if (input) {
      input.focus();
      if (input.value && parseFloat(input.value) > 0) {
        currentDonationAmount = parseFloat(input.value);
      }
    }
  }
  updatePayPalButtonLabel();
};

window.handleCustomAmountInput = function(val) {
  const num = parseFloat(val);
  currentDonationAmount = (!isNaN(num) && num > 0) ? num : 1;
  updatePayPalButtonLabel();
};

function updatePayPalButtonLabel() {
  const btnText = document.getElementById('paypalBtnText');
  if (btnText) {
    btnText.textContent = `Donate $${currentDonationAmount} USD via PayPal`;
  }
}

window.processPayPalDonation = function() {
  const amount = currentDonationAmount > 0 ? currentDonationAmount : 25;
  const txId = 'PP-TX-' + Math.floor(10000000 + Math.random() * 90000000);

  // Store in localStorage for verification on return
  const donationData = {
    amount: amount.toFixed(2),
    currency: 'USD',
    txId: txId,
    verified: true,
    recipient: PAYPAL_DONATION_EMAIL,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('scorebug_recent_donation', JSON.stringify(donationData));

  // Determine return and cancel URLs
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  const returnUrl = encodeURIComponent(`${baseUrl}/thank-you.html?status=success&amt=${amount.toFixed(2)}&tx=${txId}`);
  const cancelUrl = encodeURIComponent(`${baseUrl}/thank-you.html?status=cancel`);

  // Build standard PayPal Donation URL
  const paypalUrl = `https://www.paypal.com/donate?business=${encodeURIComponent(PAYPAL_DONATION_EMAIL)}&item_name=${encodeURIComponent('Support Scorebug OCR Development')}&currency_code=USD&amount=${amount.toFixed(2)}&return=${returnUrl}&cancel_return=${cancelUrl}`;

  // Redirect to PayPal
  window.location.href = paypalUrl;
};

window.simulateSuccessfulDonation = function() {
  const amount = currentDonationAmount > 0 ? currentDonationAmount : 25;
  const txId = 'PP-TEST-' + Math.floor(10000000 + Math.random() * 90000000);

  const donationData = {
    amount: amount.toFixed(2),
    currency: 'USD',
    txId: txId,
    verified: true,
    recipient: PAYPAL_DONATION_EMAIL,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('scorebug_recent_donation', JSON.stringify(donationData));

  window.location.href = `thank-you.html?status=success&amt=${amount.toFixed(2)}&tx=${txId}`;
};

// Listen for Escape key to close donate modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDonateModal();
  }
});
