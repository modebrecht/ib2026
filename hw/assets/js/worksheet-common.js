/*
 * Shared boilerplate for the standalone hw/*.html worksheets:
 * dark mode + font size, global Vorname sync (with first-visit prompt),
 * default Klasse/Datum, and a generic per-page form autosave.
 *
 * Include this script BEFORE a page's own inline <script> so its
 * functions (applyDefaultClassAndDate, setupUniversalAutoSave, initTheme, ...)
 * are already defined when that page's init code runs.
 */

/* ---------- Print safety net ---------- */
/* @media print never neutralizes the .dark class itself, so pages using
   dark:-prefixed Tailwind classes (dark cards, light text) would otherwise
   print with those dark colors still active. Inject a print-only override
   and expose a helper that strips .dark before window.print() and restores
   it afterwards. */
(function injectPrintSafetyCSS() {
    var style = document.createElement('style');
    style.textContent = '@media print { .dark, .dark * { background-color: #fff !important; color: #000 !important; border-color: #cbd5e1 !important; } }';
    document.head.appendChild(style);
})();

function safePrint() {
    var wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) document.documentElement.classList.remove('dark');
    window.print();
    if (wasDark) document.documentElement.classList.add('dark');
}

/* ---------- Theme (dark mode) ---------- */
var THEME_KEY = 'ib-theme';

function applyTheme(theme) {
    var isDark = (theme === 'dark');
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.setAttribute('data-theme', 'light');
    }
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.checked = isDark;
    var themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.className = isDark ? 'fa-solid fa-sun text-amber-400 text-sm' : 'fa-solid fa-moon text-sm';
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem('onedrive_theme', theme);
    applyTheme(theme);
}

function initTheme() {
    var saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('onedrive_theme');
    if (saved) {
        applyTheme(saved);
    } else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

function toggleDarkMode() {
    var isCurrentlyDark = document.documentElement.classList.contains('dark') || document.body.getAttribute('data-theme') === 'dark';
    saveTheme(isCurrentlyDark ? 'light' : 'dark');
}

window.setTheme = function(theme) { saveTheme(theme); };

/* ---------- Font size ---------- */
var FONT_KEY = 'ib-font-size';

function applyFontSize(sizeVal) {
    var val = Number(sizeVal) || 100;
    var scale = val / 100;
    document.documentElement.style.setProperty('--font-scale', scale);
    document.documentElement.style.fontSize = val + '%';
    var slider = document.getElementById('fontSizeRange');
    if (slider) slider.value = val;
}

function saveFontSize(sizeVal) {
    var val = Number(sizeVal) || 100;
    localStorage.setItem(FONT_KEY, val);
    localStorage.setItem('onedrive_font_size', val);
    applyFontSize(val);
}

function initFontSize() {
    var saved = localStorage.getItem(FONT_KEY) || localStorage.getItem('onedrive_font_size') || 100;
    applyFontSize(saved);
}

window.setFontSize = function(val) { saveFontSize(val); };

/* ---------- Global Vorname sync + first-visit prompt ---------- */
function getSavedVorname() {
    return localStorage.getItem('studentVorname') || localStorage.getItem('student_vorname') || '';
}

function setSavedVorname(name) {
    if (name && name.trim()) {
        var clean = name.trim();
        localStorage.setItem('studentVorname', clean);
        localStorage.setItem('student_vorname', clean);
        syncVornameInputs(clean);
    }
}

function syncVornameInputs(name) {
    var el = document.getElementById('studentName');
    if (el && name) {
        el.value = name;
        if (typeof updateProgress === 'function') updateProgress();
    }
}

function checkAndPromptVorname() {
    var name = getSavedVorname();
    var el = document.getElementById('studentName');
    if (el && el.value && el.value.trim()) {
        name = el.value.trim();
        setSavedVorname(name);
    }
    if (!name) {
        setTimeout(function() {
            var entered = prompt("Willkommen! Wie lautet dein Vorname?");
            if (entered && entered.trim()) {
                setSavedVorname(entered);
            }
        }, 300);
    } else {
        syncVornameInputs(name);
    }
}

/* ---------- Default Klasse/Datum + readonly student-metadata fields ---------- */
function applyDefaultClassAndDate() {
    var classInput = document.getElementById('studentClass');
    if (classInput && !classInput.value.trim()) {
        classInput.value = 'B24';
    }

    var dateInput = document.getElementById('studentDate');
    if (!dateInput) return;

    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    var todayStr = dd + '.' + mm + '.' + yyyy;

    dateInput.value = todayStr;
    dateInput.readOnly = true;
    dateInput.setAttribute('tabindex', '-1');
    dateInput.style.pointerEvents = 'none';

    var mobDate = document.getElementById('mobDate');
    if (mobDate) mobDate.textContent = todayStr;
}

/* ---------- Generic per-page form autosave (hw_autosave_<file>.html) ---------- */
function setupUniversalAutoSave() {
    var pageKey = 'hw_autosave_' + location.pathname.split('/').pop();

    function saveAll() {
        var data = {};
        document.querySelectorAll('input, textarea, select').forEach(function(el) {
            if (el.id) {
                if (el.type === 'checkbox') {
                    data[el.id] = el.checked;
                } else if (el.type === 'radio') {
                    if (el.checked) data[el.name] = el.value;
                } else {
                    data[el.id] = el.value;
                }
            } else if (el.name && el.type === 'radio') {
                if (el.checked) data[el.name] = el.value;
            }
        });
        localStorage.setItem(pageKey, JSON.stringify(data));
    }

    try {
        var saved = localStorage.getItem(pageKey);
        if (saved) {
            var data = JSON.parse(saved);
            Object.keys(data).forEach(function(key) {
                var el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = !!data[key];
                    } else if (el.type === 'radio') {
                        if (el.value === data[key]) el.checked = true;
                    } else {
                        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                            el.value = data[key];
                        }
                    }
                } else {
                    var radio = document.querySelector('input[name="' + key + '"][value="' + data[key] + '"]');
                    if (radio) radio.checked = true;
                }
            });
        }
    } catch (e) {}

    applyDefaultClassAndDate();

    saveAll();

    document.querySelectorAll('input, textarea, select').forEach(function(el) {
        el.addEventListener('input', saveAll);
        el.addEventListener('change', saveAll);
    });
}

/* ---------- Bootstrap ---------- */
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initFontSize();

    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            saveTheme(themeToggle.checked ? 'dark' : 'light');
        });
    }

    var fontSlider = document.getElementById('fontSizeRange');
    if (fontSlider) {
        fontSlider.addEventListener('input', function() {
            saveFontSize(fontSlider.value);
        });
    }

    var nameEl = document.getElementById('studentName');
    if (nameEl) {
        var existing = getSavedVorname();
        if (existing) nameEl.value = existing;
        nameEl.addEventListener('input', function() { setSavedVorname(nameEl.value); });
        nameEl.addEventListener('change', function() { setSavedVorname(nameEl.value); });
    }
    checkAndPromptVorname();
});

window.addEventListener('storage', function(e) {
    if (e.key === THEME_KEY || e.key === 'onedrive_theme') {
        if (e.newValue) applyTheme(e.newValue);
    }
    if (e.key === FONT_KEY || e.key === 'onedrive_font_size') {
        if (e.newValue) applyFontSize(e.newValue);
    }
    if (e.key === 'studentVorname' || e.key === 'student_vorname') {
        if (e.newValue) syncVornameInputs(e.newValue);
    }
});

/* ---------- Page-specific didactic alignment ---------- */
(function setupDidacticAlignment() {
    function currentPage() {
        return location.pathname.split('/').pop().toLowerCase();
    }

    function applyA5Fixes() {
        var hints = {
            'USB-A': 'Breiter, flacher, rechteckiger Stecker; nur in einer Richtung einsteckbar.',
            'USB-C': 'Kleiner ovaler, symmetrischer Stecker; beidseitig einsteckbar.',
            'HDMI': 'Flacher, trapezähnlicher Stecker mit abgeschrägten unteren Ecken.',
            'DisplayPort': 'Fast rechteckig; meist ist eine Ecke abgeschrägt, teilweise mit Rastmechanismus.',
            'LAN (RJ45)': 'Breiter Kunststoffstecker mit acht Kontakten und einem gut sichtbaren Rastclip.',
            'Audio (3,5 mm)': 'Schmaler runder Metallstecker mit mehreren dunklen Isolierringen.',
            'VGA': 'Breiter D-förmiger Stecker mit 15 Pins in drei Reihen und zwei Schrauben.',
            'DVI': 'Breiter rechteckiger Stecker mit dichtem Pin-Raster und zwei seitlichen Schrauben.',
            'Bluetooth-Dongle': 'Sehr kleiner USB-Stecker mit kurzem, kompaktem Gehäuse.',
            'Stromkabel (C13)': 'Kräftiger Stecker mit dreipoliger, annähernd rechteckiger Buchsenform.',
            'USB-B (Drucker)': 'Nahezu quadratischer Stecker mit zwei abgeschrägten oberen Ecken.',
            'Micro-USB': 'Sehr kleiner, flacher und asymmetrischer Stecker.',
            'Apple Lightning': 'Sehr schmaler, flacher, symmetrischer Metallstecker mit sichtbaren Kontakten.',
            'SD-Karte': 'Flache rechteckige Karte mit einer abgeschrägten Ecke und Kontaktflächen auf der Rückseite.',
            'WLAN-Antenne': 'Schmale stabförmige Antenne mit Schraubanschluss am Fuß.',
            'USB-Hub': 'Kleines Gehäuse mit mehreren gleichartigen USB-Buchsen an einer Seite.'
        };

        document.querySelectorAll('#connectorGrid article').forEach(function(card) {
            var title = card.querySelector('h2');
            if (!title || !hints[title.textContent.trim()]) return;
            var desc = title.nextElementSibling;
            if (desc && desc.tagName === 'P') desc.textContent = hints[title.textContent.trim()];
        });
    }

    function applyA8Fixes() {
        var pct = document.getElementById('pct');
        if (pct) {
            var relabel = function() {
                if (pct.textContent.indexOf('erledigt') !== -1) {
                    pct.textContent = pct.textContent.replace('erledigt', 'bearbeitet');
                }
            };
            relabel();
            new MutationObserver(relabel).observe(pct, { childList: true, characterData: true, subtree: true });

            var headerLabel = pct.previousElementSibling;
            if (headerLabel) headerLabel.textContent = 'A8 Bearbeitungsfortschritt';
        }

        var intro = document.querySelector('main > section.card p.text-sm.text-slate-500');
        if (intro && !document.getElementById('a8-progress-note')) {
            var note = document.createElement('p');
            note.id = 'a8-progress-note';
            note.className = 'text-xs text-slate-500 dark:text-slate-400 mt-2';
            note.innerHTML = '<strong>Hinweis:</strong> Der Prozentwert zeigt den Bearbeitungsstand. Offene Antworten werden nicht automatisch inhaltlich bewertet.';
            intro.insertAdjacentElement('afterend', note);
        }

        var section = document.getElementById('s4');
        if (section) {
            var description = section.querySelector('p');
            if (description) {
                description.innerHTML = 'Ordne jeden Anschluss einer <strong>Hauptkategorie in dieser Aufgabe</strong> zu. Mehrfachfunktionen sind möglich: USB-C kann z. B. Daten, Bild und Strom übertragen; hier zählt es wegen seiner Allrounder-Rolle zu „Daten &amp; Allrounder“.';
            }
            section.querySelectorAll('#conn select').forEach(function(select) {
                if (select.options.length) select.options[0].textContent = 'Hauptkategorie wählen …';
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            var page = currentPage();
            if (page === 'a5.html') applyA5Fixes();
            if (page === 'a8.html') applyA8Fixes();
        }, 0);
    });
})();
