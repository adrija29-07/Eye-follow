const IMGS = {
    blink: '../assest/blink-assets.png',
    cry: '../assest/cry-assets-follow.png',
    shock: '../assest/shock-assests.png',
    sleepy: '../assest/sleepy-assets.png',
    wink: '../assest/wink-assests.png',
    smile: '../assest/smile.png'
};

const imgEyes = document.getElementById('img-eyes');
const imgExpr = document.getElementById('img-expr');
const charWrap = document.getElementById('charWrap');

const wishInput = document.getElementById('wishInput');
const luckBtn = document.getElementById('luckBtn');
const clover = document.getElementById('clover');
const wishesCountDisplay = document.getElementById('wishesCount');
const themeToggle = document.getElementById('themeToggle');
const audioToggle = document.getElementById('audioToggle');
const pianoAudio = document.getElementById('pianoAudio');
const html = document.documentElement;

let state = 'default';
let blinkTimer = null;
let idleTimer = null;
let resetTimer = null;
let isNight = false;
let isPlayingAudio = false;
let wishesSent = 0;
let isBlinkClosed = false;

// Pixel Clock Logic
function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    document.getElementById('pixelClock').innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

function setState(s) {
    if (resetTimer && s !== 'blink') {
        clearTimeout(resetTimer);
        resetTimer = null;
    }

    state = s;

    const imgBase = document.getElementById('img-base');
    const eyesContainer = document.getElementById('eyesContainer');

    if (s === 'default') {
        imgBase.style.opacity = '1';
        eyesContainer.style.opacity = '1';
        imgExpr.classList.remove('visible');
        isBlinkClosed = false;
        scheduleNextBlink();
        startIdleTimer();
    } else {
        if (s !== 'blink') {
            imgBase.style.opacity = '0';
            eyesContainer.style.opacity = '0';
        }
        if (IMGS[s]) {
            imgExpr.src = IMGS[s];
            imgExpr.classList.add('visible');
        }
    }
}

function scheduleNextBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(doBlink, 1000); // 1 sec interval
}

function doBlink() {
    if (state !== 'default') {
        scheduleNextBlink();
        return;
    }
    
    isBlinkClosed = !isBlinkClosed;
    const imgBase = document.getElementById('img-base');
    const eyesContainer = document.getElementById('eyesContainer');
    
    if (isBlinkClosed) {
        imgBase.style.opacity = '0';
        eyesContainer.style.opacity = '0';
        imgExpr.src = IMGS.blink;
        imgExpr.classList.add('visible');
    } else {
        imgExpr.classList.remove('visible');
        imgBase.style.opacity = '1';
        eyesContainer.style.opacity = '1';
    }
    
    scheduleNextBlink();
}

function startIdleTimer() {
    clearTimeout(idleTimer);
    // 45 seconds idle = 45000ms
    idleTimer = setTimeout(() => {
        if (state === 'default') {
            setState('sleepy');
        }
    }, 45000);
}

function resetIdle() {
    if (state === 'sleepy') {
        setState('default');
    }
    startIdleTimer();
}

document.addEventListener('mousemove', resetIdle);
document.addEventListener('keydown', resetIdle);

// Eyes Follow Cursor
document.addEventListener('mousemove', (e) => {
    if (state !== 'default') return;
    const rect = charWrap.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.42;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 220);
    const f = dist / 220;
    const rawX = Math.cos(angle) * f * 14;
    const clampedX = rawX < 0 ? Math.max(rawX, -5) : rawX;
    
    imgEyes.style.transform = `translate(${clampedX.toFixed(1)}px,${(Math.sin(angle) * f * 10).toFixed(1)}px)`;
});

// Typing / Clover Grow / Shock Logic
wishInput.addEventListener('input', () => {
    const text = wishInput.value;
    const cloverScale = Math.min(2.5, 1 + text.length * 0.03);
    clover.style.transform = `scale(${cloverScale})`;

    if (text.length > 50 && state !== 'shock') {
        setState('shock');
    } else if (text.length <= 50 && state === 'shock') {
        setState('default');
    }
    resetIdle();
});

// Backspace -> Cry
wishInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
        setState('cry');
        resetTimer = setTimeout(() => {
            setState('default');
        }, 5000);
    }
});

// Submit Wish -> Wink -> Fly into sky
luckBtn.addEventListener('click', () => {
    if (!wishInput.value.trim()) return;

    // Character winks
    setState('wink');
    resetTimer = setTimeout(() => {
        setState('default');
    }, 3000);

    // Flying wish animation
    const flyingStar = document.createElement('div');
    flyingStar.className = 'flying-wish';
    flyingStar.innerHTML = '⭐';
    const rect = luckBtn.getBoundingClientRect();
    flyingStar.style.left = (rect.left + rect.width / 2) + 'px';
    flyingStar.style.top = rect.top + 'px';
    document.body.appendChild(flyingStar);

    setTimeout(() => flyingStar.remove(), 2500);

    // Update Constellation/Sent counter
    wishesSent++;
    wishesCountDisplay.innerText = `Wishes Sent: ${wishesSent}`;

    // Reset form
    wishInput.value = '';
    clover.style.transform = `scale(1)`;
});

// Audio Toggle
audioToggle.addEventListener('click', () => {
    if (isPlayingAudio) {
        pianoAudio.pause();
        audioToggle.innerText = '🎵 Play Piano';
    } else {
        pianoAudio.play().catch(e => console.log('Audio play failed', e));
        audioToggle.innerText = '🔇 Pause Piano';
    }
    isPlayingAudio = !isPlayingAudio;
});

// Theme Toggle (Night/Day) Capsule Pill
themeToggle.addEventListener('click', () => {
    isNight = !isNight;
    html.setAttribute('data-theme', isNight ? 'dark' : 'light');
    
    document.getElementById('sunIcon').classList.toggle('active', !isNight);
    document.getElementById('moonIcon').classList.toggle('active', isNight);

    if (isNight) {
        setState('sleepy');
        // Do not reset timer, let it stay sleepy until interaction
    } else {
        setState('default');
    }
});

// Sparkles Follow Cursor
document.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.15) { 
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
});

// Rain turning into stars
function createRain() {
    const rain = document.createElement('div');
    rain.className = 'raindrop';
    rain.style.left = Math.random() * window.innerWidth + 'px';
    document.body.appendChild(rain);
    setTimeout(() => rain.remove(), 2500);
}
setInterval(createRain, 1500);

setState('default');
