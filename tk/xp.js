// XP Engine & Gamification System for Tastenkombinationen (Class B25)

const XP_STORAGE_KEY = 'tk_global_xp_v1';
const QUEST_SCORES_KEY = 'tk_quest_scores_v1';

// INITIALIZE LOCALSTORAGE
function getGlobalXP() {
    return parseInt(localStorage.getItem(XP_STORAGE_KEY) || '0', 10);
}

function setGlobalXP(val) {
    localStorage.setItem(XP_STORAGE_KEY, Math.max(0, val).toString());
    updateXPDisplays();
}

function addGlobalXP(amount) {
    let current = getGlobalXP();
    setGlobalXP(current + amount);
}

function getQuestScores() {
    try {
        return JSON.parse(localStorage.getItem(QUEST_SCORES_KEY) || '{}');
    } catch(e) {
        return {};
    }
}

function saveQuestScore(questId, percentage) {
    let scores = getQuestScores();
    scores[questId] = Math.max(scores[questId] || 0, percentage);
    localStorage.setItem(QUEST_SCORES_KEY, JSON.stringify(scores));
}

function isQuestUnlocked(questId) {
    let scores = getQuestScores();
    if (questId === 'q1') return true; // Quest 1 always unlocked
    if (questId === 'q2') return (scores.q1 || 0) >= 80;
    if (questId === 'q3') return (scores.q2 || 0) >= 70;
    if (questId === 'q4') return (scores.q3 || 0) >= 70;
    if (questId === 'q5') return (scores.q4 || 0) >= 80;
    if (questId === 'q6') return (scores.q5 || 0) >= 70;
    if (questId === 'q7') return (scores.q6 || 0) >= 70; // A3 Boss Challenge
    return true;
}

// TEACHER CHEAT CODE: Shift + Alt + L
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.altKey && (e.key === 'L' || e.key === 'l')) {
        unlockAllQuests();
    }
});

function unlockAllQuests() {
    let scores = { q1: 100, q2: 100, q3: 100, q4: 100, q5: 100, q6: 100, q7: 100 };
    localStorage.setItem(QUEST_SCORES_KEY, JSON.stringify(scores));
    addGlobalXP(500);
    alert("🔑 CHEAT CODE: Alle Quests freigeschaltet (Q1 - Q7) und auf 100% gesetzt.");
    location.reload();
}

function updateXPDisplays() {
    const xpVal = getGlobalXP();
    document.querySelectorAll('.global-xp-val').forEach(el => {
        el.innerText = xpVal;
    });
}

// SOUND EFFECTS
function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
            osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2); // D3
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    updateXPDisplays();
});

// PDF CERTIFICATE GENERATOR FOR TEACHER (1 PAGE SUMMARY)
function downloadCertificatePDF(studentName) {
    if (!studentName) {
        studentName = prompt("Bitte gib deinen Vornamen ein:", "Vorname");
    }
    if (!studentName) return;

    // Create high-res offscreen canvas (1200 x 850)
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 1116, 766);

    // Header Badge
    ctx.fillStyle = '#60a5fa';
    ctx.font = '800 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INFORMATIK B25', 600, 95);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Space Grotesk", sans-serif';
    ctx.fillText('LEISTUNGSNACHWEIS TASTENKOMBINATIONEN (A1 - A3)', 600, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 19px sans-serif';
    ctx.fillText('Zusammenfassung der Leistungswerte in den Praxiskursen:', 600, 205);

    // Student Name Box
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(250, 230, 700, 70, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.fillText(studentName, 600, 275);

    // Global XP & Date
    const currentXP = getGlobalXP();
    const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 19px sans-serif';
    ctx.fillText(`⚡ Erreichte XP: ${currentXP} XP   •   Datum: ${today}`, 600, 340);

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

    // A3 Boss Challenge Status
    const a3Unlocked = (scores.q6 || 0) >= 70 || scores.q7 === 100;
    ctx.fillStyle = '#ef4444';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText('Arbeitsblatt A3 (Mission: Maus weglegen)', 130, 625);

    ctx.fillStyle = a3Unlocked ? '#10b981' : '#f43f5e';
    ctx.font = '700 18px sans-serif';
    ctx.fillText(a3Unlocked ? 'Status: 🟢 Absolviert (Praktische Übung in MS Word)' : 'Status: 🔴 Gesperrt (Voraussetzung: Q6 >= 70%)', 150, 665);

    // Stamp Text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Leistungsnachweis Informatik B25', 600, 715);

    // Dynamic jsPDF loader & direct download
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [297, 210] // A4 Landscape
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        
        const sanitizedFileName = `Leistungsnachweis_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        pdf.save(sanitizedFileName);
    }

    if (window.jspdf) {
        generatePDF();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            generatePDF();
        };
        document.head.appendChild(script);
    }
}
