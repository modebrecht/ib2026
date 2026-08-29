/* Shared hardware PDF entry point. Keep the legacy helpers, then apply the common TK layout. */
document.write('<script src="assets/js/pdf-engine-base.js"><\/script><script src="assets/js/pdf-engine-tk-core.js"><\/script><script src="assets/js/pdf-engine-tk.js"><\/script>');

/* A11: first-attempt assessment layer.
   The page keeps realistic shop specs. After one choice, the correct card is revealed,
   its decisive specs are highlighted by worksheet-common.css, and the learner advances manually.
   Three of five correct first attempts pass the quest and unlock the PDF. */
if (location.pathname.split('/').pop().toLowerCase() === 'a11.html') {
    setTimeout(function setupA11FirstAttemptScoring() {
        if (typeof CASES === 'undefined' || typeof choose !== 'function') return;

        var PASS = 3;
        var score = 0;
        var bestScore = 0;
        var attempts = {};
        var stored = {};
        var migrated = false;

        try { stored = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { stored = {}; }

        if (Number(stored.version) >= 3) {
            score = Math.max(0, Math.min(CASES.length, Number(stored.score) || 0));
            bestScore = Math.max(0, Math.min(CASES.length, Number(stored.bestScore) || 0));
            attempts = stored.attempts && typeof stored.attempts === 'object' ? stored.attempts : {};
        } else if (Number(stored.index) >= CASES.length && Array.isArray(stored.done) && stored.done.length >= CASES.length) {
            /* Preserve an already completed legacy 5/5 run as passed. */
            score = CASES.length;
            bestScore = CASES.length;
            attempts = Object.fromEntries(CASES.map(function(c) { return [c.id, true]; }));
            done = CASES.map(function(c) { return c.id; });
            index = CASES.length;
            migrated = true;
        } else if (Array.isArray(stored.done) && stored.done.length) {
            /* Old partial progress cannot tell us first attempts, so restart the assessment fairly. */
            index = 0;
            done = [];
            score = 0;
            attempts = {};
            migrated = true;
        }

        function persist() {
            localStorage.setItem(K, JSON.stringify({
                version: 3,
                index: index,
                done: done,
                score: score,
                bestScore: bestScore,
                attempts: attempts
            }));
        }

        save = persist;

        choose = function(id, button) {
            if (answered || !dialogueOpen) return;

            var c = CASES[index];
            var ok = id === c.correct;
            answered = true;

            if (!done.includes(c.id)) done.push(c.id);
            if (!(c.id in attempts)) {
                attempts[c.id] = ok;
                if (ok) score++;
            }

            document.querySelectorAll('.device-card').forEach(function(card) {
                card.disabled = true;
                if (card.dataset.id === c.correct) {
                    card.classList.add('correct');
                } else if (card === button && !ok) {
                    card.classList.add('wrong');
                } else {
                    card.classList.add('dim');
                }
            });

            if (ok) {
                $('feedback').innerHTML = '<div class="feedback-box good"><i class="fa-solid fa-circle-check text-lg"></i><span><strong>Richtig im ersten Versuch.</strong> ' + c.why + '</span></div>';
            } else {
                $('feedback').innerHTML = '<div class="feedback-box bad"><i class="fa-solid fa-lightbulb text-lg"></i><span><strong>Dieser Fall zählt als falsch.</strong> Die grün markierte Lösung passt besser: ' + c.why + '</span></div>';
            }

            $('nextBtn').innerHTML = index === CASES.length - 1
                ? 'Schicht abschliessen <i class="fa-solid fa-check"></i>'
                : 'Nächste Kundschaft <i class="fa-solid fa-arrow-right"></i>';
            $('nextBtn').classList.add('show');
            persist();
            updateProgress();
        };

        updateProgress = function() {
            var p = Math.round(done.length / CASES.length * 100);
            var b = $('pdf');
            var unlocked = bestScore >= PASS;

            $('pct').textContent = p + '% bearbeitet';
            $('bar').style.width = p + '%';
            b.className = unlocked
                ? 'w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'w-10 h-10 rounded-xl bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600';
            b.innerHTML = unlocked ? '<i class="fa-solid fa-file-pdf"></i>' : '<i class="fa-solid fa-lock"></i>';
            b.title = unlocked ? 'PDF frei · Best ' + bestScore + '/5' : 'PDF ab 3/5 richtigen Erstversuchen';

            var s = $('pdfStatus');
            if (s) {
                s.className = unlocked
                    ? 'mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    : 'mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900';
                s.innerHTML = unlocked
                    ? '<i class="fa-solid fa-file-pdf"></i> PDF freigeschaltet · Best ' + bestScore + '/5'
                    : '<i class="fa-solid fa-lock"></i> PDF ab 3/5 richtigen Erstversuchen';
            }
        };

        finish = function() {
            index = CASES.length;
            bestScore = Math.max(bestScore, score);
            $('playArea').classList.add('hidden');
            $('result').classList.remove('hidden');
            $('customer').classList.add('leave');
            $('speech').classList.remove('open');

            var passed = score >= PASS;
            var result = $('result');
            var icon = result.querySelector('.result-icon');
            var title = result.querySelector('h2');
            var text = result.querySelector('p');
            var scoreEl = result.querySelector('.text-5xl');
            var scoreLabel = scoreEl ? scoreEl.nextElementSibling : null;
            var replay = result.querySelector('button');

            if (icon) {
                icon.innerHTML = passed ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-rotate-right"></i>';
                icon.className = passed
                    ? 'result-icon'
                    : 'result-icon !bg-gradient-to-br !from-amber-500 !to-rose-500';
            }
            if (title) title.textContent = passed ? 'Quest bestanden.' : 'Noch nicht bestanden.';
            if (text) text.textContent = passed
                ? 'Du hast ' + score + '/5 Fälle im ersten Versuch richtig beraten. Ab 3/5 ist die Quest bestanden.'
                : 'Du hast ' + score + '/5 Fälle im ersten Versuch richtig beraten. Für die Quest brauchst du mindestens 3/5.';
            if (scoreEl) scoreEl.textContent = score + ' / ' + CASES.length;
            if (scoreLabel) scoreLabel.textContent = 'richtige Erstversuche';
            if (replay) replay.innerHTML = passed
                ? '<i class="fa-solid fa-rotate-right mr-1"></i> Noch einmal beraten'
                : '<i class="fa-solid fa-rotate-right mr-1"></i> Neue Runde starten';

            persist();
            updateProgress();
        };

        startOver = function() {
            index = 0;
            done = [];
            score = 0;
            attempts = {};
            answered = false;
            dialogueOpen = false;
            render();
            persist();
        };

        resetA11 = function() {
            if (!confirm('A11 vollständig zurücksetzen?')) return;
            localStorage.removeItem(K);
            index = 0;
            done = [];
            score = 0;
            bestScore = 0;
            attempts = {};
            answered = false;
            dialogueOpen = false;
            render();
        };

        makePdf = function() {
            if (bestScore < PASS) return alert('PDF erst ab 3/5 richtigen Erstversuchen.');
            downloadTextWorksheetPDF({
                title: 'A11 · Kaufberatung im Tech Shop',
                filenamePrefix: 'A11_Kaufberatung',
                sections: [
                    {heading: 'Ergebnis', fields: [
                        {label: 'Bestes Ergebnis', value: bestScore + '/5'},
                        {label: 'Bestanden ab', value: '3/5 richtigen Erstversuchen'}
                    ]}
                ].concat(CASES.map(function(c) {
                    return {
                        heading: ({school:'Schule & Mobilität',gaming:'Gaming & Aufrüstbarkeit',creator:'Videoschnitt & Kreativarbeit',pen:'2-in-1 & Stift',schoolfinal:'Finale · Schulnotebooks'})[c.id] || c.id,
                        fields: [
                            {label:'Empfehlung', value:c.options.find(function(o) { return o.id === c.correct; }).name},
                            {label:'Warum?', value:c.why}
                        ]
                    };
                }))
            });
        };

        /* If the page was reloaded after answering a case but before pressing Weiter,
           continue with the next unanswered case instead of allowing a second first attempt. */
        var before = index;
        while (index < CASES.length && done.includes(CASES[index].id)) index++;

        if (migrated) persist();
        if (index >= CASES.length) finish();
        else if (index !== before) render();
        else updateProgress();
    }, 0);
}
