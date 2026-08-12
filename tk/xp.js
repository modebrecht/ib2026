// Global XP & Quest Manager for Informatik 8
const XP_KEY = 'ib8_global_xp';
const QUEST_SCORES_KEY = 'ib8_quest_scores';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

// Dynamically load jsPDF library for direct PDF downloads without print popups
if (!window.jspdf) {
    const jsPdfScript = document.createElement('script');
    jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(jsPdfScript);
}

function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
            osc.frequency.linearRampToValueAtTime(140, audioCtx.currentTime + 0.2); // C#3
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } else if (type === 'hint') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }
    } catch(e) {
        console.log('Audio not supported');
    }
}

function getGlobalXP() {
    return parseInt(localStorage.getItem(XP_KEY) || '0', 10);
}

function addGlobalXP(amount) {
    let current = getGlobalXP();
    let updated = Math.max(0, current + amount);
    localStorage.setItem(XP_KEY, updated.toString());
    updateXPDisplays();
    return updated;
}

function resetGlobalXP() {
    localStorage.setItem(XP_KEY, '0');
    localStorage.setItem(QUEST_SCORES_KEY, JSON.stringify({}));
    updateXPDisplays();
}

function getQuestScores() {
    try {
        return JSON.parse(localStorage.getItem(QUEST_SCORES_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function saveQuestScore(questId, scorePct) {
    let scores = getQuestScores();
    scores[questId] = Math.max(scores[questId] || 0, scorePct);
    localStorage.setItem(QUEST_SCORES_KEY, JSON.stringify(scores));
}

function isQuestUnlocked(questId) {
    let scores = getQuestScores();
    if (questId === 'q1') return true;
    if (questId === 'q2') return (scores['q1'] || 0) >= 80;
    if (questId === 'q3') return (scores['q2'] || 0) >= 70;
    if (questId === 'q4') return (scores['q3'] || 0) >= 70; // Unlocks A2.html
    if (questId === 'q5') return (scores['q4'] || 0) >= 80; // A2 50/50
    if (questId === 'q6') return (scores['q5'] || 0) >= 70; // A2 Blind
    if (questId === 'q7') return (scores['q6'] || 0) >= 70; // Unlocks A3.html (Boss Challenge)
    return false;
}

/* --- LEHRER CHEAT-CODE ZUM FREISCHALTEN ALLER QUESTS --- */
function unlockAllQuests() {
    let scores = {
        q1: 100,
        q2: 100,
        q3: 100,
        q4: 100,
        q5: 100,
        q6: 100,
        q7: 100
    };
    localStorage.setItem(QUEST_SCORES_KEY, JSON.stringify(scores));
    addGlobalXP(500);
    playSound('correct');
    alert('🔓 LEHRER-CHEAT AKTIVIERT!\n\nAlle Quests & Arbeitsblätter (A1, A2, A3) sind jetzt vollständig freigeschaltet. (+500 XP)');
    location.reload();
}

/* --- CERTIFICATE PDF GENERATOR (DIRECT PDF DOWNLOAD WITHOUT PRINT DIALOG) --- */
function downloadCertificatePDF(studentName = '') {
    if (!studentName) {
        studentName = prompt("Bitte gib deinen Vor- und Nachnamen (und deine Klasse) für das Zertifikat ein:", "Max Mustermann, Klasse 8");
        if (!studentName) return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Background Gradient (Dark Tech Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Gold Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 1116, 766);

    // Header Badge
    ctx.fillStyle = '#fde047';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 INFORMATIK KLASSE 8 • SCHWEIZER TASTATUR-PROFI 🇨🇭', 600, 95);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Space Grotesk", sans-serif';
    ctx.fillText('ZERTIFIKAT DER MEISTERSCHAFT', 600, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('Dieses Zertifikat bestätigt die Erfolge & Prozentwerte in den Praxiskursen:', 600, 205);

    // Student Name Box
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(250, 230, 700, 70, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 32px "Space Grotesk", sans-serif';
    ctx.fillText(studentName, 600, 276);

    // Global XP & Date
    const currentXP = getGlobalXP();
    const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(`⚡ Gesamte Erfahrungspunkte: ${currentXP} XP   •   Erstellt am: ${today}`, 600, 340);

    // Scores Table Box
    const scores = getQuestScores();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(90, 370, 1020, 370, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';

    // A1 Column
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText('Arbeitsblatt A1 (Allgemeine Kürzel)', 130, 420);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`• Quest 1 (Geführt): ${scores.q1 || 0}%`, 150, 465);
    ctx.fillText(`• Quest 2 (50/50 Rätsel): ${scores.q2 || 0}%`, 150, 505);
    ctx.fillText(`• Quest 3 (Blind-Profi): ${scores.q3 || 0}%`, 150, 545);

    // A2 Column
    ctx.fillStyle = '#fde047';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText('Arbeitsblatt A2 (Sonderzeichen AltGr)', 630, 420);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`• Quest 4 (AltGr Geführt): ${scores.q4 || 0}%`, 650, 465);
    ctx.fillText(`• Quest 5 (50/50 Rätsel): ${scores.q5 || 0}%`, 650, 505);
    ctx.fillText(`• Quest 6 (Blind-Profi): ${scores.q6 || 0}%`, 650, 545);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(130, 580);
    ctx.lineTo(1070, 580);
    ctx.stroke();

    // A3 Row
    ctx.fillStyle = '#fca5a5';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText('Arbeitsblatt A3 (Boss Challenge "Mission Maus weglegen")', 130, 625);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 18px sans-serif';
    const q7Done = (scores.q6 || 0) >= 70;
    ctx.fillText(`• Status: ${q7Done ? '🏆 GEMEISTERT (Mausfrei absolviert)' : '🔒 Ausstehend (Benötigt Q6 >= 70%)'}`, 150, 665);

    // Stamp
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('Geprüft & Digital Signiert • Informatik Sek I', 1070, 715);

    const imgData = canvas.toDataURL('image/png', 1.0);
    const sanitizedFileName = `Zertifikat_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}`;

    if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1200, 850]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1200, 850);
        pdf.save(`${sanitizedFileName}.pdf`);
    } else {
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${sanitizedFileName}.png`;
        a.click();
    }
}

function updateXPDisplays() {
    const xpElements = document.querySelectorAll('.global-xp-val');
    const current = getGlobalXP();
    xpElements.forEach(el => {
        el.innerText = current;
    });
}

// Global window access
window.unlockAllQuests = unlockAllQuests;
window.resetGlobalXP = resetGlobalXP;
window.downloadCertificatePDF = downloadCertificatePDF;

// Secret Teacher Shortcut: Press Shift + Alt + L anywhere on the page
window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.altKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        unlockAllQuests();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateXPDisplays();
});
