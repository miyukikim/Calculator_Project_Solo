// DOM references
const display = document.getElementById('display');
const overlaySlider = document.getElementById('overlay-slider');
const overlayValue = document.getElementById('overlay-value');
const overlayElement = document.getElementById('video-overlay');

let expression = '';

// Web Audio API context (lazy-initialized on first user interaction)
let audioCtx = null;

// Initialize AudioContext on first user click/touch (required by browsers)
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Play a short festive "beep" sound (different pitch based on button type)
function playSound(type = 'number') {
  initAudio();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Different frequencies for different button types
  if (type === 'operator') oscillator.frequency.value = 600;   // Higher pitch
  else if (type === 'clear' || type === 'delete') oscillator.frequency.value = 400; // Lower
  else if (type === 'equals') oscillator.frequency.value = 800; // Triumphant high pitch
  else oscillator.frequency.value = 523.25; // C note - pleasant for numbers

  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// Attach sound to all calculator functions
function appendNumber(num) {
  playSound('number');
  if (num === '.') {
    const last = getLastNumber();
    if (last.includes('.')) return;
    if (last === '') expression += '0';
  }
  expression += num;
  updateDisplay();
}

function appendOperator(operator) {
  playSound('operator');
  if (expression === '' && operator === '-') {
    expression = '-';
    updateDisplay();
    return;
  }
  if (expression === '') return;
  if (/[+\-×÷]$/.test(expression)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }
  updateDisplay();
}

function clearDisplay() {
  playSound('clear');
  expression = '';
  updateDisplay();
}

function deleteLastChar() {
  playSound('delete');
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  playSound('equals');
  try {
    if (expression === '') return;
    if (/[+\-×÷]$/.test(expression)) expression = expression.slice(0, -1);
    
    let evalExpr = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    let result = eval(evalExpr);
    result = Math.round(result * 100000000) / 100000000;
    expression = String(result);
    updateDisplay();
  } catch (err) {
    display.textContent = 'Error';
    expression = '';
    setTimeout(() => updateDisplay(), 1500);
  }
}

// Rest of the calculator logic (unchanged)
function formatForDisplay(expr) {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
}
function updateDisplay() {
  display.textContent = expression ? formatForDisplay(expression) : '0';
}
function getLastNumber() {
  const m = expression.match(/([0-9.]+)$/);
  return m ? m[0] : '';
}
updateDisplay();

// Keyboard support (also triggers sounds)
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { appendNumber(e.key); }
  if (e.key === '.') { appendNumber('.'); }
  if ('+-*/'.includes(e.key)) {
    e.preventDefault();
    appendOperator(e.key === '*' ? '*' : e.key === '/' ? '/' : e.key);
  }
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
  if (e.key === 'Backspace') { e.preventDefault(); deleteLastChar(); }
  if (e.key === 'Escape') { clearDisplay(); }
});

// Enable sound on first user interaction (required by browsers)
document.body.addEventListener('click', initAudio, { once: true });
document.body.addEventListener('touchstart', initAudio, { once: true });

// Overlay control
function updateOverlay() {
  const opacity = overlaySlider.value / 100;
  overlayElement.style.background = `rgba(0, 0, 0, ${opacity})`;
  overlayValue.textContent = overlaySlider.value + '%';
}
updateOverlay();
overlaySlider.addEventListener('input', updateOverlay);

// Snowflakes
(function createSnow() {
  const SNOW_COUNT = 48;
  const container = document.querySelector('.snow');
  if (!container) return;

  for (let i = 0; i < SNOW_COUNT; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    flake.textContent = '❅';

    const left = Math.random() * 100;
    const size = 8 + Math.random() * 20;
    const duration = 6 + Math.random() * 14;
    const delay = Math.random() * -duration;
    const opacity = 0.6 + Math.random() * 0.4;

    flake.style.left = left + 'vw';
    flake.style.fontSize = size + 'px';
    flake.style.opacity = opacity;
    flake.style.animationDuration = duration + 's';
    flake.style.animationDelay = delay + 's';

    container.appendChild(flake);
  }
})();