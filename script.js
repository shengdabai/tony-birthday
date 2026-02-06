document.addEventListener('DOMContentLoaded', () => {
    initContent();
    initParticles();
    initFireworks();
    initScrollObserver();
    initVideoHandler();
    initAudio();
});

// --- 1. 数据渲染 ---
function initContent() {
    if (typeof birthdayData === 'undefined') {
        console.error('birthdayData not found!');
        return;
    }

    // 渲染标题
    document.getElementById('hero-title').textContent = birthdayData.title + ' ' + birthdayData.name + ' 🎂🎉';
    document.getElementById('hero-subtitle').textContent = birthdayData.subtitle;

    // 渲染回忆 (Memories)
    const memoriesContainer = document.getElementById('memories-grid');
    birthdayData.memories.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon">${item.icon || '✨'}</div>
            <h3>${item.title}</h3>
            <p>${item.content}</p>
        `;
        memoriesContainer.appendChild(card);
    });

    // 渲染期望 (Expectations)
    const expContainer = document.getElementById('expectations-list');
    birthdayData.expectations.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = item.content;
        expContainer.appendChild(div);
    });

    // 渲染祝愿 (Wishes)
    const wishesContainer = document.getElementById('wishes-grid');
    birthdayData.wishes.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon">🎁</div>
            <p>${item.content}</p>
        `;
        wishesContainer.appendChild(card);
    });

    // 渲染视频 URL (如果有)
    if (birthdayData.videoUrl) {
        const video = document.getElementById('birthday-video');
        video.src = birthdayData.videoUrl;
        document.querySelector('.video-wrapper').classList.add('has-video');
    }
}

// --- 2. 粒子背景 ---
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height, particles;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < 100; i++) { // 控制粒子数量，避免卡顿
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    resize();
    init();
    animate();
}

// --- 3. 交互式烟花 ---
function initFireworks() {
    const canvas = document.getElementById('firework-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const fireworks = [];

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Firework {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.particles = [];
            const colors = ['#FF004D', '#00FF00', '#00D2FF', '#FFD700', '#FF00FF'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 / 30) * i;
                const speed = Math.random() * 3 + 2;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: color
                });
            }
        }

        update() {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // 重力
                p.alpha -= 0.02;
            });
            this.particles = this.particles.filter(p => p.alpha > 0);
        }

        draw() {
            this.particles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }

    document.addEventListener('click', (e) => {
        // 只有点击非交互元素时才触发烟花
        if (!e.target.closest('.card, button, label, input')) {
            fireworks.push(new Firework(e.clientX, e.clientY));
            
            // 简单的爆炸音效 (Web Audio API)
            playPopSound();
        }
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        fireworks.forEach((fw, index) => {
            fw.update();
            fw.draw();
            if (fw.particles.length === 0) {
                fireworks.splice(index, 1);
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 4. 滚动动画 ---
function initScrollObserver() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(s => observer.observe(s));
}

// --- 5. 视频文件处理 ---
function initVideoHandler() {
    const input = document.getElementById('video-upload');
    if (!input) return;
    
    const video = document.getElementById('birthday-video');
    const wrapper = document.querySelector('.video-wrapper');

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            video.src = url;
            wrapper.classList.add('has-video');
            video.play();
        }
    });
}

// --- 6. 音频管理 (Web Audio API) ---
const BIRTHDAY_SONG = [
    { freq: 392, dur: 300 }, { freq: 392, dur: 300 }, { freq: 440, dur: 600 }, { freq: 392, dur: 600 }, { freq: 523, dur: 600 }, { freq: 494, dur: 1200 },
    { freq: 392, dur: 300 }, { freq: 392, dur: 300 }, { freq: 440, dur: 600 }, { freq: 392, dur: 600 }, { freq: 587, dur: 600 }, { freq: 523, dur: 1200 },
    { freq: 392, dur: 300 }, { freq: 392, dur: 300 }, { freq: 784, dur: 600 }, { freq: 659, dur: 600 }, { freq: 523, dur: 600 }, { freq: 494, dur: 600 }, { freq: 440, dur: 1200 },
    { freq: 698, dur: 300 }, { freq: 698, dur: 300 }, { freq: 659, dur: 600 }, { freq: 523, dur: 600 }, { freq: 587, dur: 600 }, { freq: 523, dur: 1200 }
];

let audioCtx = null;
let isPlaying = false;
let musicTimeoutId = null;

function initAudio() {
    const btn = document.getElementById('music-control');
    
    function ensureAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }
    
    function playBirthdaySong() {
        const ctx = ensureAudioContext();
        let time = ctx.currentTime;
        
        BIRTHDAY_SONG.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            const noteDur = note.dur / 1000;
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + noteDur - 0.02);
            
            osc.start(time);
            osc.stop(time + noteDur);
            
            time += noteDur;
        });
        
        const totalDuration = BIRTHDAY_SONG.reduce((sum, n) => sum + n.dur, 0);
        musicTimeoutId = setTimeout(() => {
            if (isPlaying) {
                playBirthdaySong();
            }
        }, totalDuration);
    }
    
    function startMusic() {
        if (!isPlaying) {
            isPlaying = true;
            btn.classList.add('playing');
            btn.textContent = '⏸';
            playBirthdaySong();
        }
    }
    
    function stopMusicPlayback() {
        isPlaying = false;
        if (musicTimeoutId) {
            clearTimeout(musicTimeoutId);
            musicTimeoutId = null;
        }
        btn.classList.remove('playing');
        btn.textContent = '🎵';
    }
    
    let hasAutoStarted = false;
    document.addEventListener('click', () => {
        if (!hasAutoStarted) {
            hasAutoStarted = true;
            startMusic();
        }
    }, { once: true });
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        hasAutoStarted = true;
        if (isPlaying) {
            stopMusicPlayback();
        } else {
            startMusic();
        }
    });
}

function playPopSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}
