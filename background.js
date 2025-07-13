const canvas = document.getElementById('network');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const MAX_INITIAL    = 30;
const CONNECT_DIST   = 150;
const SPEED          = 5.3;   
const WAVE_SPEED     = 0.5;   
const WAVE_THICKNESS = 5;     
const PULSE_DURATION = 300;   

let nextWaveId = 1;
const nodes = [];
const waves = [];

function makeNode(x, y) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    pulseTime: -Infinity,
    seenWaves: new Set()
  };
}

for (let i = 0; i < MAX_INITIAL; i++) {
  nodes.push(makeNode(
    Math.random() * canvas.width,
    Math.random() * canvas.height
  ));
}

function loop() {
  const now = performance.now();

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  }

  for (let w of waves) {
    const age = now - w.t0;
    const radius = age * WAVE_SPEED;

    for (let n of nodes) {
      if (n.seenWaves.has(w.id)) continue;
      const dx = n.x - w.x, dy = n.y - w.y;
      const d = Math.hypot(dx, dy);
      if (Math.abs(d - radius) < WAVE_THICKNESS) {
        n.pulseTime = now;
        n.seenWaves.add(w.id);
      }
    }
  }

  const maxDim = Math.hypot(canvas.width, canvas.height);
  for (let i = waves.length - 1; i >= 0; i--) {
    if ((now - waves[i].t0) * WAVE_SPEED > maxDim) {
      waves.splice(i, 1);
    }
  }

  ctx.strokeStyle = 'rgba(100,200,255,0.2)';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < CONNECT_DIST * CONNECT_DIST) {
        const alpha = 1 - Math.sqrt(d2) / CONNECT_DIST;
        ctx.lineWidth = alpha * 1.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (let n of nodes) {
    const since = now - n.pulseTime;
    if (since < PULSE_DURATION) {
      const f = 1 - since / PULSE_DURATION;
      ctx.fillStyle = `rgba(255,255,200,${0.8 * f + 0.2})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4 + 3 * f, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#68c3ff';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(loop);
}

loop();

window.addEventListener('click', e => {
  const x = e.clientX;
  const y = e.clientY;

  nodes.push(makeNode(x, y));

  waves.push({
    id: nextWaveId++,
    x, y,
    t0: performance.now()
  });
});

// Clock functionality
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  // Update digital time
  const digitalTime = document.getElementById('digital-time');
  if (digitalTime) {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    digitalTime.textContent = timeString;
  }
}

// Initialize clock and update every second
document.addEventListener('DOMContentLoaded', function() {
  updateClock(); // Initial update
  setInterval(updateClock, 1000); // Update every second
});
