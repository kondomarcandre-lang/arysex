// ========================================
// 🔥 MAIN.JS - VERSION CORRIGÉE (duel v2)
// ========================================

(function () {
    'use strict';

    console.log('📄 MAIN.JS - Initialisation...');

    // ========================================
    // 🔊 SONS
    // ========================================
    const SoundManager = (function () {
        let ctx = null;
        function getContext() {
            if (!ctx) {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
            }
            return ctx;
        }
        function playTone(freq, duration, type = 'sine', volume = 0.3) {
            try {
                const context = getContext();
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.type = type;
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(volume, context.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
                osc.connect(gain);
                gain.connect(context.destination);
                osc.start();
                osc.stop(context.currentTime + duration);
            } catch (e) { }
        }
        return {
            click() { playTone(800, 0.08, 'sine', 0.15); },
            correct() { playTone(523, 0.15); setTimeout(() => playTone(659, 0.15), 150); setTimeout(() => playTone(784, 0.25), 300); },
            incorrect() { playTone(300, 0.4, 'sawtooth', 0.2); },
            levelUp() { playTone(400, 0.2); setTimeout(() => playTone(500, 0.2), 200); setTimeout(() => playTone(600, 0.4), 400); },
            timerWarning() { playTone(1000, 0.05, 'square', 0.1); },
            duelStart() { playTone(200, 0.5, 'square', 0.3); setTimeout(() => playTone(300, 0.5, 'square', 0.3), 300); },
            victory() { for (let i = 0; i < 8; i++) setTimeout(() => playTone(400 + i * 100, 0.15, 'sine', 0.2), i * 100); }
        };
    })();

    // ========================================
    // 📳 HAPTIC
    // ========================================
    const Haptic = {
        light() { if (navigator.vibrate) navigator.vibrate(10); },
        medium() { if (navigator.vibrate) navigator.vibrate(30); },
        heavy() { if (navigator.vibrate) navigator.vibrate(60); },
        pattern() { if (navigator.vibrate) navigator.vibrate([30, 50, 30]); }
    };

    // ========================================
    // 🎊 CONFETTIS
    // ========================================
    function lancerConfettis(couleurs = ['#4a6cf7', '#fdcb6e', '#ff6b6b', '#00b894', '#6c5ce7']) {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = couleurs[Math.floor(Math.random() * couleurs.length)];
            piece.style.width = (Math.random() * 8 + 4) + 'px';
            piece.style.height = (Math.random() * 8 + 4) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            piece.style.animationDelay = (Math.random() * 0.8) + 's';
            container.appendChild(piece);
        }
        setTimeout(() => container.remove(), 4000);
    }

    // ========================================
    // RANGS
    // ========================================
    function getRang(points) {
        const rangs = [
            { nom: 'Bronze', min: 0, max: 100, badge: '🥉' },
            { nom: 'Argent', min: 101, max: 300, badge: '🥈' },
            { nom: 'Or', min: 301, max: 600, badge: '🥇' },
            { nom: 'Platine', min: 601, max: 1000, badge: '💎' },
            { nom: 'Diamant', min: 1001, max: 1500, badge: '🔥' },
            { nom: 'Légende', min: 1501, max: 2500, badge: '👑' },
            { nom: 'Génie', min: 2501, max: Infinity, badge: '🧠' }
        ];
        for (const rang of rangs) {
            if (points >= rang.min && points <= rang.max) return rang;
        }
        return rangs[rangs.length - 1];
    }

    function getRangProgress(points) {
        const rangs = [
            { nom: 'Bronze', min: 0, max: 100 },
            { nom: 'Argent', min: 101, max: 300 },
            { nom: 'Or', min: 301, max: 600 },
            { nom: 'Platine', min: 601, max: 1000 },
            { nom: 'Diamant', min: 1001, max: 1500 },
            { nom: 'Légende', min: 1501, max: 2500 },
            { nom: 'Génie', min: 2501, max: Infinity }
        ];
        for (const rang of rangs) {
            if (points >= rang.min && points <= rang.max) {
                if (rang.max === Infinity) return 100;
                return Math.min(100, Math.max(0, ((points - rang.min) / (rang.max - rang.min)) * 100));
            }
        }
        return 0;
    }

    // ========================================
    // DÉFI
    // ========================================
    let serieActuelle = 0;
    let meilleureSerie = 0;
    let palierActuel = 10;
    let paliersAtteints = [];
    const BONUS_DEFI = 50;
    const PALIER_SUIVANT = 5;

    function getDateActuelle() { return new Date().toDateString(); }

    function sauvegarderDefi() {
        try {
            localStorage.setItem('quiz_defi', JSON.stringify({
                serieActuelle, meilleureSerie, palierActuel, paliersAtteints, date: getDateActuelle()
            }));
        } catch (e) { }
    }

    function chargerDefi() {
        try {
            const data = localStorage.getItem('quiz_defi');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.date === getDateActuelle()) {
                    serieActuelle = parsed.serieActuelle || 0;
                    meilleureSerie = parsed.meilleureSerie || 0;
                    palierActuel = parsed.palierActuel || 10;
                    paliersAtteints = parsed.paliersAtteints || [];
                    return true;
                }
            }
        } catch (e) { }
        serieActuelle = 0;
        meilleureSerie = 0;
        palierActuel = 10;
        paliersAtteints = [];
        sauvegarderDefi();
        return false;
    }

    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    let questionsActuelles = [];
    let indexQuestion = 0;
    let scoreNiveau = 0;
    let estEnJeu = false;
    let reponseDonnee = false;
    let indiceUtilise = false;
    let estEnChargement = false;
    let modeActuel = 'monde';
    let scoreTotal = 0;
    let niveauActuel = 1;
    let questionsDejaPosees = new Set();
    let reponsesParNiveau = {};
    let timerInterval = null;
    let tempsRestant = 15;
    let timerActif = false;

    // Duel
    let socket = null;
    let estEnDuel = false;
    let salleId = null;
    let duelEnCours = false;
    let duelTimerInterval = null;
    let duelTempsRestant = 10;
    let adversaireId = null;
    let tabClassementActif = 'duel';
    let invitationEnCours = null;

    // Duel state client
    let duelQuestions = [];
    let duelIndex = 0;
    let duelScoreLocal = 0;
    let duelBonnesLocal = 0;

    // ========================================
    // SAUVEGARDE MODE
    // ========================================
    function sauvegarderDonneesMode(mode) {
        try {
            localStorage.setItem(`quiz_${mode}_data`, JSON.stringify({
                niveau: niveauActuel,
                score: scoreTotal,
                questions: Array.from(questionsDejaPosees)
            }));
        } catch (e) { }
    }

    function chargerDonneesMode(mode) {
        try {
            const data = localStorage.getItem(`quiz_${mode}_data`);
            if (data) {
                const parsed = JSON.parse(data);
                niveauActuel = parsed.niveau || 1;
                scoreTotal = parsed.score || 0;
                questionsDejaPosees = new Set(parsed.questions || []);
            }
            console.log(`📊 Données chargées pour ${mode}: niveau=${niveauActuel}, score=${scoreTotal}`);
        } catch (e) { }
    }

    function sauvegarderPartie() {
        try {
            localStorage.setItem('quiz_niveau', niveauActuel);
            localStorage.setItem('quiz_score', scoreTotal);
            localStorage.setItem('quiz_mode', modeActuel);
            sauvegarderDonneesMode(modeActuel);
        } catch (e) { }
    }

    function chargerPartie() {
        try {
            const savedNiveau = localStorage.getItem('quiz_niveau');
            const savedScore = localStorage.getItem('quiz_score');
            const savedMode = localStorage.getItem('quiz_mode');
            if (savedNiveau) niveauActuel = parseInt(savedNiveau, 10);
            if (savedScore) scoreTotal = parseInt(savedScore, 10);
            if (savedMode && (savedMode === 'monde' || savedMode === 'afrique')) modeActuel = savedMode;
            chargerDonneesMode(modeActuel);
            mettreAJourInterface();
        } catch (e) { }
    }

    function sauvegarderHistorique() {
        try {
            localStorage.setItem('quiz_questions_jouees', JSON.stringify(Array.from(questionsDejaPosees)));
        } catch (e) { }
    }

    // ========================================
    // VÉRIFICATION DÉFI
    // ========================================
    function verifierDeblocageDefi() {
        if (serieActuelle >= palierActuel && !paliersAtteints.includes(palierActuel)) {
            paliersAtteints.push(palierActuel);
            scoreTotal += BONUS_DEFI;
            sauvegarderPartie();
            sauvegarderDefi();
            mettreAJourStats();
            afficherNotification(`🎉 Défi réussi ! +${BONUS_DEFI} pts bonus !`, 'success');
            palierActuel += PALIER_SUIVANT;
            sauvegarderDefi();
            mettreAJourStats();
            return true;
        }
        return false;
    }

    // ========================================
    // GÉNÉRER NIVEAU
    // ========================================
    function genererNiveau(niveau) {
        const locales = modeActuel === 'afrique' ? window.QUESTIONS_AFRIQUE : window.QUESTIONS_MONDE;
        if (!locales || locales.length === 0) return [];

        let disponibles = locales.filter(q => !questionsDejaPosees.has(q.question));
        if (disponibles.length < 10) {
            questionsDejaPosees.clear();
            sauvegarderHistorique();
            disponibles = [...locales];
        }

        const melangees = [...disponibles].sort(() => Math.random() - 0.5);
        const selection = melangees.slice(0, 10);

        const selectionMelangee = selection.map(q => {
            const bonneReponse = q.options[q.correct];
            const optionsMelangees = [...q.options].sort(() => Math.random() - 0.5);
            const nouvelIndexCorrect = optionsMelangees.indexOf(bonneReponse);
            return {
                question: q.question,
                options: optionsMelangees,
                correct: nouvelIndexCorrect,
                categorie: q.categorie,
                difficulte: q.difficulte
            };
        });

        selectionMelangee.forEach(q => questionsDejaPosees.add(q.question));
        sauvegarderHistorique();
        return selectionMelangee;
    }

    // ========================================
    // INTERFACE
    // ========================================
    let profilScore, scoreTotalSpan, statsCorrect, statsIncorrect, progressFill, dailyPlayers, btnDaily, rangBadge, rangNom, rangBar, rangPoints;
    let profilNiveau, niveauActuelSpan, profilNom;
    let questionText, questionProgress, zoneReponses, btnAction, btnIndice, zoneTimer, timerValue;
    let categorieSpan, difficulteSpan;

    function mettreAJourStats() {
        if (profilScore) profilScore.textContent = scoreTotal;
        if (scoreTotalSpan) scoreTotalSpan.textContent = scoreTotal;

        const stats = reponsesParNiveau[niveauActuel] || { correct: 0, incorrect: 0 };
        if (statsCorrect) statsCorrect.textContent = `✅ ${stats.correct}`;
        if (statsIncorrect) statsIncorrect.textContent = `❌ ${stats.incorrect}`;

        if (progressFill) {
            const total = stats.correct + stats.incorrect + (indexQuestion || 0);
            const progress = Math.min(100, (total / 10) * 100);
            progressFill.style.width = `${progress}%`;
        }

        if (dailyPlayers) dailyPlayers.textContent = `🎯 ${serieActuelle}/${palierActuel}`;
        if (btnDaily) btnDaily.textContent = `🎯 ${serieActuelle}/${palierActuel}`;

        if (socket && socket.connected) {
            socket.emit('mettre_a_jour_score', { score: scoreTotal });
        }

        mettreAJourRang();
    }

    function mettreAJourRang() {
        if (rangBadge && rangNom && rangBar && rangPoints) {
            const rang = getRang(scoreTotal);
            const progress = getRangProgress(scoreTotal);
            rangBadge.textContent = rang.badge;
            rangNom.textContent = rang.nom;
            rangBar.style.setProperty('--progress', progress + '%');
            rangPoints.textContent = `${scoreTotal} / ${rang.max === Infinity ? '∞' : rang.max}`;
        }
    }

    function mettreAJourInterface() {
        if (niveauActuelSpan) niveauActuelSpan.textContent = niveauActuel;
        if (profilNiveau) profilNiveau.textContent = niveauActuel;
        if (scoreTotalSpan) scoreTotalSpan.textContent = scoreTotal;
        if (profilScore) profilScore.textContent = scoreTotal;
        mettreAJourRang();
    }

    // ========================================
    // TIMER SOLO
    // ========================================
    function demarrerTimer() {
        arreterTimer();
        tempsRestant = 15;
        timerActif = true;
        if (timerValue) {
            timerValue.textContent = '15';
            timerValue.classList.remove('warning');
        }
        if (zoneTimer) zoneTimer.style.display = 'flex';

        timerInterval = setInterval(() => {
            tempsRestant--;
            if (timerValue) {
                timerValue.textContent = tempsRestant;
                if (tempsRestant <= 5) {
                    timerValue.classList.add('warning');
                    SoundManager.timerWarning();
                    Haptic.light();
                }
            }
            if (tempsRestant <= 0) {
                arreterTimer();
                verifierReponse(-1);
            }
        }, 1000);
    }

    function arreterTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerActif = false;
    }

    // ========================================
    // AFFICHER QUESTION
    // ========================================
    function afficherQuestion() {
        if (indexQuestion >= questionsActuelles.length) {
            terminerNiveau();
            return;
        }

        const question = questionsActuelles[indexQuestion];
        reponseDonnee = false;

        if (zoneTimer) zoneTimer.style.display = 'flex';
        if (timerValue) {
            timerValue.textContent = '15';
            timerValue.classList.remove('warning');
        }

        if (btnIndice) {
            btnIndice.style.display = indiceUtilise ? 'none' : 'inline-block';
            btnIndice.disabled = false;
        }

        if (questionText) questionText.textContent = question.question;
        if (questionProgress) questionProgress.textContent = `${indexQuestion + 1} / ${questionsActuelles.length}`;

        if (zoneReponses) {
            zoneReponses.innerHTML = '';
            const lettres = ['A', 'B', 'C', 'D'];
            question.options.forEach((opt, idx) => {
                const button = document.createElement('button');
                button.className = 'btn-reponse';
                button.textContent = `${lettres[idx]}. ${opt}`;
                button.dataset.index = idx;
                button.onclick = () => verifierReponse(idx);
                zoneReponses.appendChild(button);
            });
        }

        demarrerTimer();
    }

    // ========================================
    // VÉRIFIER RÉPONSE
    // ========================================
    function verifierReponse(indexChoisi) {
        if (reponseDonnee) return;
        reponseDonnee = true;
        arreterTimer();
        SoundManager.click();

        if (zoneTimer) zoneTimer.style.display = 'none';

        const question = questionsActuelles[indexQuestion];
        const boutons = zoneReponses.querySelectorAll('.btn-reponse');

        boutons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === question.correct) btn.classList.add('correct');
            else if (idx === indexChoisi && idx !== question.correct) btn.classList.add('incorrect');
        });

        if (indexChoisi === question.correct) {
            SoundManager.correct();
            Haptic.medium();
            lancerConfettis();
            scoreNiveau += 10;
            scoreTotal += 10;
            if (reponsesParNiveau[niveauActuel]) reponsesParNiveau[niveauActuel].correct++;
            serieActuelle++;
            verifierDeblocageDefi();

            const scoreSpan = document.getElementById('scoreTotal');
            if (scoreSpan) {
                scoreSpan.classList.remove('pop-score');
                void scoreSpan.offsetWidth;
                scoreSpan.classList.add('pop-score');
            }
        } else if (indexChoisi >= 0) {
            SoundManager.incorrect();
            Haptic.heavy();
            const questionZone = document.getElementById('questionText');
            if (questionZone) {
                questionZone.classList.remove('shake');
                void questionZone.offsetWidth;
                questionZone.classList.add('shake');
                setTimeout(() => questionZone.classList.remove('shake'), 500);
            }
            if (reponsesParNiveau[niveauActuel]) reponsesParNiveau[niveauActuel].incorrect++;
            serieActuelle = 0;
        }

        mettreAJourStats();
        sauvegarderPartie();
        sauvegarderDefi();

        setTimeout(() => {
            indexQuestion++;
            afficherQuestion();
        }, 1500);
    }

    // ========================================
    // TERMINER NIVEAU
    // ========================================
    function terminerNiveau() {
        arreterTimer();
        estEnJeu = false;
        if (zoneTimer) zoneTimer.style.display = 'none';

        const stats = reponsesParNiveau[niveauActuel] || { correct: 0, incorrect: 0 };

        if (stats.correct < 10) {
            SoundManager.incorrect();
            Haptic.pattern();
            if (questionText) questionText.textContent = `❌ Niveau ${niveauActuel} non validé ! (${stats.correct}/10) - Vous devez avoir 10/10 pour passer.`;
            if (zoneReponses) zoneReponses.innerHTML = '';
            if (btnAction) {
                btnAction.textContent = "🔄 Refaire le niveau";
                btnAction.style.display = "block";
                btnAction.className = "btn-action danger";
                btnAction.onclick = function () {
                    questionsDejaPosees.clear();
                    sauvegarderHistorique();
                    demarrerNiveau();
                };
            }
            afficherNotification(`❌ Niveau ${niveauActuel} non validé ! (${stats.correct}/10)`, 'error');
            sauvegarderPartie();
            sauvegarderDefi();
            mettreAJourStats();
            return;
        }

        if (stats.correct === 10) {
            SoundManager.levelUp();
            Haptic.pattern();
            lancerConfettis(['#fdcb6e', '#ff6b6b', '#4a6cf7', '#00b894', '#6c5ce7']);
            if (questionText) questionText.textContent = `🏆 PARFAIT ! 10/10 ! Score : ${scoreNiveau} pts - Passage au niveau ${niveauActuel + 1}`;
            scoreTotal += 20;
            afficherNotification('🏆 Niveau parfait ! +20 pts bonus !', 'success');
            niveauActuel++;
            mettreAJourInterface();
        }

        if (zoneReponses) zoneReponses.innerHTML = '';
        if (btnAction) {
            btnAction.textContent = "🚀 Niveau Suivant";
            btnAction.style.display = "block";
            btnAction.className = "btn-action success";
            btnAction.onclick = function () {
                demarrerNiveau();
            };
        }
        sauvegarderPartie();
        sauvegarderDefi();
        mettreAJourStats();
    }

    // ========================================
    // DÉMARRER NIVEAU
    // ========================================
    async function demarrerNiveau() {
        if (estEnChargement) return;
        estEnChargement = true;

        if (btnIndice) btnIndice.style.display = 'none';
        indiceUtilise = false;
        if (btnAction) {
            btnAction.disabled = true;
            btnAction.textContent = "⏳ Chargement...";
            btnAction.style.display = "block";
        }
        if (questionText) questionText.textContent = "🔄 Chargement des questions...";
        if (questionProgress) questionProgress.textContent = "⏳";
        if (zoneReponses) zoneReponses.innerHTML = "";
        if (zoneTimer) zoneTimer.style.display = 'none';

        arreterTimer();
        reponsesParNiveau[niveauActuel] = { correct: 0, incorrect: 0 };

        try {
            questionsActuelles = genererNiveau(niveauActuel);

            if (!questionsActuelles || questionsActuelles.length === 0) {
                if (questionText) questionText.textContent = "❌ Erreur : Aucune question disponible";
                if (btnAction) {
                    btnAction.textContent = "🔄 Réessayer";
                    btnAction.disabled = false;
                }
                estEnChargement = false;
                return;
            }

            indexQuestion = 0;
            scoreNiveau = 0;
            reponseDonnee = false;
            estEnJeu = true;
            if (niveauActuelSpan) niveauActuelSpan.textContent = niveauActuel;
            if (profilNiveau) profilNiveau.textContent = niveauActuel;
            if (btnAction) {
                btnAction.style.display = "none";
                btnAction.disabled = false;
            }

            if (questionsActuelles[0]?.categorie && categorieSpan) {
                categorieSpan.textContent = questionsActuelles[0].categorie;
            }
            if (questionsActuelles[0]?.difficulte && difficulteSpan) {
                const emojis = { 'facile': '🟢', 'moyen': '🟡', 'difficile': '🔴' };
                difficulteSpan.textContent = emojis[questionsActuelles[0].difficulte] || '❓';
            }

            mettreAJourStats();
            afficherQuestion();
            sauvegarderPartie();

        } catch (error) {
            console.error('❌ Erreur:', error);
            if (questionText) questionText.textContent = "❌ Erreur de chargement";
            if (btnAction) {
                btnAction.textContent = "🔄 Réessayer";
                btnAction.disabled = false;
                btnAction.style.display = "block";
            }
        }
        estEnChargement = false;
    }

    // ========================================
    // NOTIFICATION
    // ========================================
    function afficherNotification(message, type = 'success') {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#00b894' : '#ff6b6b'};
            color: white;
            padding: 20px 40px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 20px;
            z-index: 99999;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            text-align: center;
        `;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.5s ease';
            setTimeout(() => div.remove(), 500);
        }, 3000);
    }

    // ========================================
    // INIT
    // ========================================
    function init() {
        console.log('📄 DOM chargé, initialisation...');

        const welcomeOverlay = document.getElementById('welcomeOverlay');
        const welcomeBtn = document.getElementById('welcomeBtn');
        const welcomePseudo = document.getElementById('welcomePseudo');
        const mainGame = document.getElementById('mainGame');
        const mainFooter = document.getElementById('mainFooter');

        profilNom = document.getElementById('profilNom');
        profilNiveau = document.getElementById('profilNiveau');
        profilScore = document.getElementById('profilScore');
        questionText = document.getElementById('questionText');
        questionProgress = document.getElementById('questionProgress');
        zoneReponses = document.getElementById('zoneReponses');
        btnAction = document.getElementById('btnAction');
        btnIndice = document.getElementById('btnIndice');
        progressFill = document.getElementById('progressFill');
        niveauActuelSpan = document.getElementById('niveauActuel');
        scoreTotalSpan = document.getElementById('scoreTotal');
        statsCorrect = document.getElementById('statsCorrect');
        statsIncorrect = document.getElementById('statsIncorrect');
        categorieSpan = document.getElementById('categorieActuelle');
        difficulteSpan = document.getElementById('difficulteActuelle');
        const dailyDate = document.getElementById('dailyDate');
        dailyPlayers = document.getElementById('dailyPlayers');
        btnDaily = document.getElementById('btnDaily');
        rangBadge = document.getElementById('rangBadge');
        rangNom = document.getElementById('rangNom');
        rangBar = document.getElementById('rangBar');
        rangPoints = document.getElementById('rangPoints');
        const btnModeMonde = document.getElementById('btnModeMonde');
        const btnModeAfrique = document.getElementById('btnModeAfrique');
        zoneTimer = document.getElementById('zoneTimer');
        timerValue = document.getElementById('timerValue');

        const duelListe = document.getElementById('duelListe');
        const btnDuel = document.getElementById('btnDuel');
        const duelInvitation = document.getElementById('duelInvitation');
        const invitationNom = document.getElementById('invitationNom');
        const btnAnnulerDuel = document.getElementById('btnAnnulerDuel');
        const duelStatut = document.getElementById('duelStatut');
        const duelStatutTexte = document.getElementById('duelStatutTexte');
        const duelOverlay = document.getElementById('duelOverlay');
        const btnFermerDuel = document.getElementById('btnFermerDuel');
        const btnQuitterDuel = document.getElementById('btnQuitterDuel');
        const duelNom1 = document.getElementById('duelNom1');
        const duelNom2 = document.getElementById('duelNom2');
        const duelScore1 = document.getElementById('duelScore1');
        const duelScore2 = document.getElementById('duelScore2');
        const duelReponses1 = document.getElementById('duelReponses1');
        const duelReponses2 = document.getElementById('duelReponses2');
        const duelTimer = document.getElementById('duelTimer');
        const duelQuestionNumero = document.getElementById('duelQuestionNumero');
        const duelQuestionText = document.getElementById('duelQuestionText');
        const duelReponsesContainer = document.getElementById('duelReponses');
        const duelResultat = document.getElementById('duelResultat');
        const duelGagnant = document.getElementById('duelGagnant');
        const duelStats1 = document.getElementById('duelStats1');
        const duelStats2 = document.getElementById('duelStats2');
        const inviteModal = document.getElementById('inviteModal');
        const btnAccepterDuel = document.getElementById('btnAccepterDuel');
        const btnRefuserDuel = document.getElementById('btnRefuserDuel');
        const inviteNom = document.getElementById('inviteNom');

        const classementListe = document.getElementById('classementListe');
        const classementTabs = document.querySelectorAll('.classement-tab');

        // ========================================
        // CHANGER MODE
        // ========================================
        function changerMode(mode) {
            if (estEnChargement) return;
            if (mode === modeActuel) return;

            sauvegarderDonneesMode(modeActuel);
            modeActuel = mode;

            if (btnModeMonde && btnModeAfrique) {
                btnModeMonde.classList.toggle('active', mode === 'monde');
                btnModeAfrique.classList.toggle('active', mode === 'afrique');
            }

            chargerDonneesMode(mode);
            serieActuelle = 0;
            palierActuel = 10;
            paliersAtteints = [];

            mettreAJourInterface();
            sauvegarderPartie();
            sauvegarderDefi();
            arreterTimer();
            demarrerNiveau();
        }

        if (btnModeMonde) btnModeMonde.addEventListener('click', (e) => { e.preventDefault(); changerMode('monde'); });
        if (btnModeAfrique) btnModeAfrique.addEventListener('click', (e) => { e.preventDefault(); changerMode('afrique'); });

        // ========================================
        // LANCER JEU
        // ========================================
        function lancerLeJeu() {
            let pseudo = welcomePseudo.value.trim();
            if (!pseudo || pseudo.length < 2) {
                pseudo = 'Joueur';
                welcomePseudo.value = pseudo;
            }
            try { localStorage.setItem('quiz_pseudo', pseudo); } catch (e) { }

            welcomeOverlay.style.display = 'none';
            welcomeOverlay.style.visibility = 'hidden';
            mainGame.style.display = 'block';
            mainGame.style.visibility = 'visible';
            mainFooter.style.display = 'flex';
            mainFooter.style.visibility = 'visible';

            profilNom.textContent = pseudo;
            chargerPartie();
            chargerDefi();

            if (dailyDate) {
                const date = new Date();
                dailyDate.textContent = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            }

            if (btnModeMonde) btnModeMonde.classList.add('active');
            if (btnModeAfrique) btnModeAfrique.classList.remove('active');

            connecterServeur();
        }

        if (welcomeBtn) {
            welcomeBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                lancerLeJeu();
                document.getElementById('transitionOverlay').style.display = 'flex';
                return false;
            };
        }

        // ========================================
        // TRANSITION
        // ========================================
        const transitionOverlay = document.getElementById('transitionOverlay');
        const transitionBtn = document.getElementById('transitionBtn');

        if (transitionBtn) {
            transitionBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                transitionOverlay.style.display = 'none';
                demarrerNiveau();
            };
        }

        // ========================================
        // INDICE
        // ========================================
        if (btnIndice) {
            btnIndice.addEventListener('click', function () {
                if (indiceUtilise || reponseDonnee || !estEnJeu) return;
                indiceUtilise = true;
                btnIndice.style.display = 'none';

                const question = questionsActuelles[indexQuestion];
                const boutons = zoneReponses.querySelectorAll('.btn-reponse');

                let mauvaisesReponses = [];
                boutons.forEach((btn, idx) => {
                    if (idx !== question.correct && !btn.disabled) mauvaisesReponses.push(idx);
                });

                if (mauvaisesReponses.length > 0) {
                    const aSupprimer = mauvaisesReponses.slice(0, 2);
                    aSupprimer.forEach(idx => {
                        boutons[idx].classList.add('elimine');
                        boutons[idx].disabled = true;
                    });
                    afficherNotification('💡 2 réponses éliminées !', 'success');
                }
            });
        }

        // ========================================
        // DAILY
        // ========================================
        if (btnDaily) {
            btnDaily.addEventListener('click', function () {
                serieActuelle = 0;
                palierActuel = 10;
                paliersAtteints = [];
                sauvegarderPartie();
                sauvegarderDefi();
                mettreAJourStats();
                afficherNotification('🔄 Défi réinitialisé !', 'success');
            });
        }

        // ========================================
        // PROFIL
        // ========================================
        const btnProfil = document.getElementById('btnProfil');
        const modalPseudo = document.getElementById('modalPseudo');
        const inputPseudo = document.getElementById('inputPseudo');
        const btnPseudoOk = document.getElementById('btnPseudoOk');
        const btnPseudoCancel = document.getElementById('btnPseudoCancel');

        if (btnProfil) {
            btnProfil.addEventListener('click', function () {
                if (modalPseudo) {
                    modalPseudo.style.display = 'flex';
                    if (inputPseudo) {
                        inputPseudo.value = profilNom.textContent;
                        inputPseudo.focus();
                    }
                }
            });
        }

        if (btnPseudoOk) {
            btnPseudoOk.addEventListener('click', function () {
                const nouveauPseudo = inputPseudo.value.trim();
                if (nouveauPseudo && nouveauPseudo.length >= 2) {
                    profilNom.textContent = nouveauPseudo;
                    try { localStorage.setItem('quiz_pseudo', nouveauPseudo); } catch (e) { }
                    if (modalPseudo) modalPseudo.style.display = 'none';
                    afficherNotification(`👤 Pseudo changé en "${nouveauPseudo}"`, 'success');
                    if (socket) socket.emit('reconnecter', { pseudo: nouveauPseudo });
                } else {
                    afficherNotification('❌ Pseudo trop court (minimum 2 caractères)', 'error');
                }
            });
        }

        if (btnPseudoCancel) {
            btnPseudoCancel.addEventListener('click', function () {
                if (modalPseudo) modalPseudo.style.display = 'none';
            });
        }

        if (modalPseudo) {
            modalPseudo.addEventListener('click', function (e) {
                if (e.target === modalPseudo) modalPseudo.style.display = 'none';
            });
        }

        if (inputPseudo) {
            inputPseudo.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') btnPseudoOk.click();
            });
        }

        // ========================================
        // CONNEXION SOCKET
        // ========================================
        function connecterServeur() {
            const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000'
                : 'https://arysex-quiz-duel.onrender.com';

            socket = io(serverUrl);

            socket.on('connect', () => {
                console.log('🔗 Connecté au serveur de duel');
                socket.emit('enregistrer', {
                    pseudo: profilNom.textContent,
                    niveau: niveauActuel,
                    score: scoreTotal
                });
            });

            socket.on('joueurs_en_ligne', (joueurs) => afficherJoueursEnLigne(joueurs));
            socket.on('classements', (classements) => afficherClassements(classements));

            socket.on('invitation_refusee', (data) => {
                afficherNotification(`❌ ${data.joueur} a refusé votre invitation`, 'error');
                duelInvitation.style.display = 'none';
            });

            socket.on('erreur', (data) => {
                afficherNotification(`❌ ${data.message}`, 'error');
            });

            // ===== INVITATION REÇUE =====
            socket.on('invitation_duel', (data) => {
                inviteNom.textContent = data.inviteurPseudo;
                inviteModal.classList.add('active');
                invitationEnCours = data.invitationId;
                SoundManager.click();
                Haptic.medium();
            });

            // ===== DÉBUT DU DUEL =====
            socket.on('demarrer_duel', (data) => {
                SoundManager.duelStart();
                estEnDuel = true;
                salleId = data.salleId;

                duelQuestions = data.questions || [];
                duelIndex = 0;
                duelScoreLocal = 0;
                duelBonnesLocal = 0;

                duelOverlay.style.display = 'flex';
                duelNom1.textContent = profilNom.textContent;
                duelNom2.textContent = data.adversaire;
                duelScore1.textContent = '0';
                duelScore2.textContent = '0';
                duelReponses1.textContent = '✅ 0';
                duelReponses2.textContent = '✅ 0';
                duelResultat.style.display = 'none';
                duelStatut.style.display = 'none';
                duelInvitation.style.display = 'none';
                duelTimer.style.display = 'block';
                duelQuestionNumero.textContent = `Question 1/${duelQuestions.length}`;
                duelQuestionText.textContent = 'Prêt ? C\'est parti !';
                duelReponsesContainer.innerHTML = '';

                setTimeout(() => afficherQuestionDuel(0), 1200);
            });

            // ===== SCORE ADVERSE =====
            socket.on('adversaire_repondu', (data) => {
                duelScore2.textContent = data.adversaireScore || 0;
                duelReponses2.textContent = `✅ ${data.adversaireBonnes || 0}`;
            });

            socket.on('adversaire_termine', () => {
                duelQuestionNumero.textContent = '🎯 L\'adversaire a terminé. En attente...';
            });

            // ===== FIN DU DUEL =====
            socket.on('fin_duel', (data) => {
                terminerDuelAffichage(data);
            });
        }

        // ========================================
        // JOUEURS EN LIGNE
        // ========================================
        function afficherJoueursEnLigne(joueurs) {
            if (!duelListe) return;

            if (!joueurs || joueurs.length === 0) {
                duelListe.innerHTML = '<div class="duel-vide">👤 Aucun joueur en ligne</div>';
                return;
            }

            duelListe.innerHTML = joueurs.map(j => `
                <div class="duel-item">
                    <div>
                        <div class="duel-pseudo">${j.pseudo}</div>
                        <div class="duel-infos">Niv. ${j.niveau} · ⭐ ${j.score} pts</div>
                    </div>
                    ${estEnDuel ? '<span class="duel-statut">⚔️ En duel</span>' : `
                        <button class="btn-defier" onclick="window.inviterDuel('${j.id}')">
                            ⚔️ Défier
                        </button>
                    `}
                </div>
            `).join('');
        }

        // ========================================
        // INVITER DUEL
        // ========================================
        function inviterDuel(idAdversaire) {
            if (estEnDuel) {
                afficherNotification('❌ Vous êtes déjà en duel !', 'error');
                return;
            }

            adversaireId = idAdversaire;
            const questions = genererQuestionsDuel();

            let nomAdversaire = 'Adversaire';
            document.querySelectorAll('.duel-item').forEach(item => {
                const btn = item.querySelector('.btn-defier');
                if (btn && btn.getAttribute('onclick')?.includes(idAdversaire)) {
                    nomAdversaire = item.querySelector('.duel-pseudo')?.textContent || 'Adversaire';
                }
            });

            socket.emit('inviter_duel', {
                adversaireId: idAdversaire,
                questions: questions
            });

            invitationNom.textContent = nomAdversaire;
            duelInvitation.style.display = 'block';
        }

        window.inviterDuel = inviterDuel;

        // ========================================
        // GÉNÉRER QUESTIONS DUEL (5 Afrique + 3 Monde)
        // ========================================
        function genererQuestionsDuel() {
            const afrique = window.QUESTIONS_AFRIQUE || [];
            const monde = window.QUESTIONS_MONDE || [];

            const melangeAfrique = [...afrique].sort(() => Math.random() - 0.5);
            const melangeMonde = [...monde].sort(() => Math.random() - 0.5);

            let selection = [
                ...melangeAfrique.slice(0, 5),
                ...melangeMonde.slice(0, 3)
            ];

            selection = selection.sort(() => Math.random() - 0.5);

            return selection.map(q => {
                const bonneReponse = q.options[q.correct];
                const optionsMelangees = [...q.options].sort(() => Math.random() - 0.5);
                const nouvelIndexCorrect = optionsMelangees.indexOf(bonneReponse);
                return {
                    question: q.question,
                    options: optionsMelangees,
                    correct: nouvelIndexCorrect,
                    categorie: q.categorie,
                    difficulte: q.difficulte
                };
            });
        }

        // ========================================
        // MODAL INVITATION - BOUTONS
        // ========================================
        if (btnAccepterDuel) {
            btnAccepterDuel.onclick = function () {
                if (!invitationEnCours) return;
                socket.emit('repondre_invitation', {
                    invitationId: invitationEnCours,
                    accepte: true
                });
                inviteModal.classList.remove('active');
                invitationEnCours = null;
                SoundManager.click();
            };
        }

        if (btnRefuserDuel) {
            btnRefuserDuel.onclick = function () {
                if (!invitationEnCours) return;
                socket.emit('repondre_invitation', {
                    invitationId: invitationEnCours,
                    accepte: false
                });
                inviteModal.classList.remove('active');
                invitationEnCours = null;
                afficherNotification('❌ Vous avez refusé le duel', 'error');
            };
        }

        // ========================================
        // AFFICHER QUESTION DUEL
        // ========================================
        function afficherQuestionDuel(index) {
            if (index >= duelQuestions.length) {
                clearInterval(duelTimerInterval);
                duelQuestionText.textContent = '🏁 Vous avez terminé !';
                duelReponsesContainer.innerHTML = '';
                duelTimer.style.display = 'none';
                duelQuestionNumero.textContent = '🎯 En attente de l\'adversaire...';
                socket.emit('duel_termine', { salleId });
                return;
            }

            duelIndex = index;
            const question = duelQuestions[index];

            duelQuestionNumero.textContent = `Question ${index + 1}/${duelQuestions.length}`;
            duelQuestionText.textContent = question.question;
            duelReponsesContainer.innerHTML = '';
            duelTimer.style.display = 'block';

            duelTempsRestant = 10;
            duelTimer.textContent = duelTempsRestant;
            duelTimer.classList.remove('warning');

            if (duelTimerInterval) clearInterval(duelTimerInterval);
            duelTimerInterval = setInterval(() => {
                duelTempsRestant--;
                duelTimer.textContent = duelTempsRestant;
                if (duelTempsRestant <= 5) {
                    duelTimer.classList.add('warning');
                    SoundManager.timerWarning();
                    Haptic.light();
                }
                if (duelTempsRestant <= 0) {
                    clearInterval(duelTimerInterval);
                    validerReponseDuel(-1);
                }
            }, 1000);

            const lettres = ['A', 'B', 'C', 'D'];
            question.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.textContent = `${lettres[idx]}. ${opt}`;
                btn.onclick = () => {
                    if (btn.disabled) return;
                    document.querySelectorAll('.duel-reponses-container button').forEach(b => b.disabled = true);
                    clearInterval(duelTimerInterval);

                    const allBtns = duelReponsesContainer.querySelectorAll('button');
                    allBtns[question.correct].classList.add('correct');
                    if (idx !== question.correct) btn.classList.add('incorrect');

                    validerReponseDuel(idx);
                };
                duelReponsesContainer.appendChild(btn);
            });
        }

        // ========================================
        // VALIDER RÉPONSE DUEL
        // ========================================
        function validerReponseDuel(idxChoisi) {
            const question = duelQuestions[duelIndex];
            const tempsRestant = duelTempsRestant;

            if (idxChoisi === question.correct) {
                const bonus = Math.max(0, Math.floor(tempsRestant / 3) * 5);
                duelScoreLocal += 10 + bonus;
                duelBonnesLocal++;
                SoundManager.correct();
                Haptic.medium();
            } else {
                SoundManager.incorrect();
                Haptic.heavy();
            }

            duelScore1.textContent = duelScoreLocal;
            duelReponses1.textContent = `✅ ${duelBonnesLocal}`;

            socket.emit('reponse_duel', {
                salleId: salleId,
                indexQuestion: duelIndex,
                reponse: idxChoisi,
                tempsRestant: tempsRestant,
                score: duelScoreLocal,
                bonnes: duelBonnesLocal
            });

            setTimeout(() => afficherQuestionDuel(duelIndex + 1), 1500);
        }

        // ========================================
        // FIN DUEL - AFFICHAGE
        // ========================================
        function terminerDuelAffichage(data) {
            if (duelTimerInterval) clearInterval(duelTimerInterval);
            duelEnCours = false;
            estEnDuel = false;
            duelTimer.style.display = 'none';

            duelResultat.style.display = 'block';
            duelReponsesContainer.innerHTML = '';
            duelQuestionText.textContent = '🏁 Duel terminé !';
            duelQuestionNumero.textContent = '🎯 Résultats';
            duelStatut.style.display = 'none';

            if (data.gagnant === 'Égalité') {
                duelGagnant.textContent = '🤝 Égalité !';
            } else if (data.gagnant === profilNom.textContent) {
                duelGagnant.textContent = '🏆 Vous avez gagné ! 🎉';
                SoundManager.victory();
                lancerConfettis(['#fdcb6e', '#ffd93d', '#ff6b6b', '#4a6cf7']);
                scoreTotal += 30;
                sauvegarderPartie();
                mettreAJourStats();
                setTimeout(() => afficherNotification('🎉 Vous avez gagné le duel ! +30 pts', 'success'), 500);
            } else {
                duelGagnant.textContent = `👏 ${data.gagnant} a gagné !`;
            }

            duelStats1.textContent = `${data.joueur1.pseudo}: ${data.joueur1.score} pts (${data.joueur1.reponses} bonnes réponses)`;
            duelStats2.textContent = `${data.joueur2.pseudo}: ${data.joueur2.score} pts (${data.joueur2.reponses} bonnes réponses)`;
        }

        // ========================================
        // QUITTER DUEL
        // ========================================
        function quitterDuel() {
            if (duelTimerInterval) clearInterval(duelTimerInterval);
            estEnDuel = false;
            duelEnCours = false;
            duelOverlay.style.display = 'none';
            duelStatut.style.display = 'none';
            duelResultat.style.display = 'none';
            duelReponsesContainer.innerHTML = '';
            duelTimer.style.display = 'none';

            if (socket) socket.emit('demander_joueurs');
        }

        // ========================================
        // CLASSEMENTS
        // ========================================
        function afficherClassements(classements) {
            if (!classementListe) return;

            if (!classements || classements.length === 0) {
                classementListe.innerHTML = '<div class="classement-vide">📊 Aucun classement disponible</div>';
                return;
            }

            let affichage = classements;
            if (tabClassementActif === 'personnel') {
                affichage = [...classements].sort((a, b) => (b.soloScore || 0) - (a.soloScore || 0));
            }

            const top3 = affichage.slice(0, 3);
            const reste = affichage.slice(3);

            let html = '';

            top3.forEach((j, index) => {
                const rankClass = ['gold', 'silver', 'bronze'][index];
                const medal = ['🥇', '🥈', '🥉'][index];
                html += `
                    <div class="classement-item">
                        <span class="rank ${rankClass}">${medal}</span>
                        <span class="nom">${j.pseudo} ${j.enLigne ? '<span class="online">●</span>' : ''}</span>
                        <div class="stats">
                            ${tabClassementActif === 'duel' ? `
                                <span class="victoires">🏆 ${j.victoires || 0}</span>
                                <span class="defaites">💔 ${j.defaites || 0}</span>
                                <span class="winrate">📊 ${j.winRate || 0}%</span>
                            ` : `
                                <span>⭐ ${j.soloScore || 0}</span>
                            `}
                        </div>
                    </div>
                `;
            });

            reste.forEach((j, index) => {
                html += `
                    <div class="classement-item">
                        <span class="rank">${index + 4}</span>
                        <span class="nom">${j.pseudo} ${j.enLigne ? '<span class="online">●</span>' : ''}</span>
                        <div class="stats">
                            ${tabClassementActif === 'duel' ? `
                                <span class="victoires">🏆 ${j.victoires || 0}</span>
                                <span class="defaites">💔 ${j.defaites || 0}</span>
                                <span class="winrate">📊 ${j.winRate || 0}%</span>
                            ` : `
                                <span>⭐ ${j.soloScore || 0}</span>
                            `}
                        </div>
                    </div>
                `;
            });

            classementListe.innerHTML = html;
        }

        // ========================================
        // BOUTONS DUEL
        // ========================================
        if (btnDuel) {
            btnDuel.addEventListener('click', function () {
                if (socket) {
                    socket.emit('demander_joueurs');
                    socket.emit('demander_classements');
                }
            });
        }

        if (btnAnnulerDuel) {
            btnAnnulerDuel.addEventListener('click', function () {
                duelInvitation.style.display = 'none';
            });
        }

        if (btnFermerDuel) btnFermerDuel.addEventListener('click', quitterDuel);
        if (btnQuitterDuel) btnQuitterDuel.addEventListener('click', quitterDuel);

        classementTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                classementTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                tabClassementActif = this.dataset.tab;
                if (socket) socket.emit('demander_classements');
            });
        });

        // ========================================
        // SONS BOUTONS
        // ========================================
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => SoundManager.click());
        });

        // ========================================
        // INIT FINALE
        // ========================================
        const savedPseudo = localStorage.getItem('quiz_pseudo');
        if (savedPseudo && savedPseudo.trim().length > 0 && welcomePseudo) {
            welcomePseudo.value = savedPseudo;
        }

        if (welcomeOverlay) {
            welcomeOverlay.style.display = 'flex';
            mainGame.style.display = 'none';
            mainFooter.style.display = 'none';
            if (welcomePseudo) welcomePseudo.focus();
        }

        window.addEventListener('beforeunload', function () {
            sauvegarderPartie();
            sauvegarderDonneesMode(modeActuel);
            sauvegarderDefi();
        });

        const stylePopIn = document.createElement('style');
        stylePopIn.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(stylePopIn);

        console.log('✅ MAIN.JS chargé avec succès !');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();