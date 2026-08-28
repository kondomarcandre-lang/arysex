// ========================================
// 🔥 MAIN.JS - VERSION COMPLÈTE AVEC DUEL, CLASSEMENTS ET JUICE (sons, vibreur, confettis)
// ========================================

(function () {
    'use strict';

    console.log('📄 MAIN.JS - Initialisation Juice...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // 🔊 GESTIONNAIRE DE SONS (Web Audio)
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
            } catch (e) { /* silence */ }
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
    // 📳 HAPTIC FEEDBACK (Vibration)
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
    // FONCTIONS DE RANG (inchangées)
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
    // GESTION DU DÉFI
    // ========================================
    function getDateActuelle() {
        return new Date().toDateString();
    }

    function sauvegarderDefi() {
        try {
            const data = JSON.stringify({
                serieActuelle: serieActuelle,
                meilleureSerie: meilleureSerie,
                palierActuel: palierActuel,
                paliersAtteints: paliersAtteints,
                date: getDateActuelle()
            });
            localStorage.setItem('quiz_defi', data);
        } catch (e) {
            console.warn('⚠️ Erreur sauvegarde défi:', e);
        }
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
        } catch (e) {
            console.warn('⚠️ Erreur chargement défi:', e);
        }
        serieActuelle = 0;
        meilleureSerie = 0;
        palierActuel = 10;
        paliersAtteints = [];
        sauvegarderDefi();
        return false;
    }

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
            console.log(`🎯 Défi atteint ! +${BONUS_DEFI} points, prochain palier: ${palierActuel}`);
            return true;
        }
        return false;
    }

    // ========================================
    // SAUVEGARDE HISTORIQUE
    // ========================================
    function sauvegarderHistorique() {
        try {
            localStorage.setItem('quiz_questions_jouees', JSON.stringify(Array.from(questionsDejaPosees)));
        } catch (e) {
            console.error('Erreur sauvegarde historique', e);
        }
    }

    // ========================================
    // GÉNÉRER NIVEAU
    // ========================================
    function genererNiveau(niveau) {
        console.log(`🚀 Génération Niveau ${niveau} - Mode ${modeActuel}`);

        const locales = modeActuel === 'afrique' ? window.QUESTIONS_AFRIQUE : window.QUESTIONS_MONDE;

        if (!locales || locales.length === 0) {
            console.error('❌ Aucune question disponible');
            return [];
        }

        let disponibles = locales.filter(q => !questionsDejaPosees.has(q.question));

        if (disponibles.length < 10) {
            console.warn(`⚠️ Réserve épuisée (${disponibles.length} disponibles), réinitialisation`);
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

        console.log(`✅ ${selectionMelangee.length} questions sélectionnées pour ${modeActuel}`);
        return selectionMelangee;
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
    let duelTempsRestant = 15;
    let adversaireId = null;
    let tabClassementActif = 'duel';

    // Défi
    let serieActuelle = 0;
    let meilleureSerie = 0;
    let palierActuel = 10;
    let paliersAtteints = [];
    const BONUS_DEFI = 50;
    const PALIER_SUIVANT = 5;

    // ========================================
    // INITIALISATION
    // ========================================
    function init() {
        console.log('📄 DOM chargé, initialisation...');

        // Récupération des éléments DOM
        const welcomeOverlay = document.getElementById('welcomeOverlay');
        const welcomeBtn = document.getElementById('welcomeBtn');
        const welcomePseudo = document.getElementById('welcomePseudo');
        const mainGame = document.getElementById('mainGame');
        const mainFooter = document.getElementById('mainFooter');
        const profilNom = document.getElementById('profilNom');
        const profilNiveau = document.getElementById('profilNiveau');
        const profilScore = document.getElementById('profilScore');
        const questionText = document.getElementById('questionText');
        const questionProgress = document.getElementById('questionProgress');
        const zoneReponses = document.getElementById('zoneReponses');
        const btnAction = document.getElementById('btnAction');
        const btnIndice = document.getElementById('btnIndice');
        const progressFill = document.getElementById('progressFill');
        const niveauActuelSpan = document.getElementById('niveauActuel');
        const scoreTotalSpan = document.getElementById('scoreTotal');
        const statsCorrect = document.getElementById('statsCorrect');
        const statsIncorrect = document.getElementById('statsIncorrect');
        const categorieSpan = document.getElementById('categorieActuelle');
        const difficulteSpan = document.getElementById('difficulteActuelle');
        const dailyDate = document.getElementById('dailyDate');
        const dailyPlayers = document.getElementById('dailyPlayers');
        const btnDaily = document.getElementById('btnDaily');
        const rangBadge = document.getElementById('rangBadge');
        const rangNom = document.getElementById('rangNom');
        const rangBar = document.getElementById('rangBar');
        const rangPoints = document.getElementById('rangPoints');
        const btnModeMonde = document.getElementById('btnModeMonde');
        const btnModeAfrique = document.getElementById('btnModeAfrique');
        const zoneTimer = document.getElementById('zoneTimer');
        const timerValue = document.getElementById('timerValue');

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

        const classementListe = document.getElementById('classementListe');
        const classementTabs = document.querySelectorAll('.classement-tab');

        // ========================================
        // CHANGER DE MODE
        // ========================================
        function changerMode(mode) {
            if (estEnChargement) return;
            if (mode === modeActuel) {
                console.log(`ℹ️ Déjà en mode ${mode}`);
                return;
            }

            console.log(`🔄 Changement de mode: ${modeActuel} → ${mode}`);

            // Sauvegarde du mode actuel
            sauvegarderDonneesMode(modeActuel);
            modeActuel = mode;

            // Mise à jour visuelle des boutons
            if (btnModeMonde && btnModeAfrique) {
                btnModeMonde.classList.toggle('active', mode === 'monde');
                btnModeAfrique.classList.toggle('active', mode === 'afrique');
            }

            // Charge les données du nouveau mode (sans les écraser)
            chargerDonneesMode(mode);

            // 🔥 SUPPRIME CES 3 LIGNES (ne réinitialise plus le niveau/score)
            // niveauActuel = 1;
            // scoreTotal = 0;
            // questionsDejaPosees.clear();

            // Réinitialise seulement le défi (pour éviter de tricher)
            serieActuelle = 0;
            palierActuel = 10;
            paliersAtteints = [];

            // Met à jour l'interface
            mettreAJourInterface();
            sauvegarderPartie();
            sauvegarderDefi();
            arreterTimer();

            // Relance le niveau actuel (avec les questions du nouveau mode)
            demarrerNiveau();

            console.log(`✅ Mode ${mode} activé avec niveau ${niveauActuel} et score ${scoreTotal}`);
        }

        // ========================================
        // SAUVEGARDE PAR MODE
        // ========================================
        function sauvegarderDonneesMode(mode) {
            try {
                const data = {
                    niveau: niveauActuel,
                    score: scoreTotal,
                    questions: Array.from(questionsDejaPosees)
                };
                localStorage.setItem(`quiz_${mode}_data`, JSON.stringify(data));
            } catch (e) {
                console.warn('Erreur sauvegarde mode:', e);
            }
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
            } catch (e) {
                console.warn('Erreur chargement mode:', e);
            }
        }

        // ========================================
        // BOUTONS MODE
        // ========================================
        if (btnModeMonde) {
            btnModeMonde.addEventListener('click', function (e) {
                e.preventDefault();
                changerMode('monde');
            });
        }

        if (btnModeAfrique) {
            btnModeAfrique.addEventListener('click', function (e) {
                e.preventDefault();
                changerMode('afrique');
            });
        }

        // ========================================
        // LANCER LE JEU
        // ========================================
        function lancerLeJeu() {
            console.log('🚀 LANCEMENT DU JEU !');

            let pseudo = welcomePseudo.value.trim();
            if (!pseudo || pseudo.length < 2) {
                pseudo = 'Joueur';
                welcomePseudo.value = pseudo;
            }

            try {
                localStorage.setItem('quiz_pseudo', pseudo);
            } catch (e) { }

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

            console.log('✅ Jeu démarré avec:', pseudo);
        }

        // ========================================
        // BOUTON COMMENCER (accueil)
        // ========================================
        if (welcomeBtn) {
            welcomeBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ CLIC SUR LE BOUTON !');
                lancerLeJeu();
                document.getElementById('transitionOverlay').style.display = 'flex';
                return false;
            };
        }

        // ========================================
        // ÉCRAN DE TRANSITION
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
        // DÉMARRER NIVEAU
        // ========================================
        async function demarrerNiveau() {
            if (estEnChargement) return;
            estEnChargement = true;

            console.log(`🚀 Démarrage du niveau ${niveauActuel} (mode ${modeActuel})`);

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

                console.log(`📚 ${questionsActuelles.length} questions prêtes`);

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
        // AFFICHER QUESTION
        // ========================================
        function afficherQuestion() {
            if (indexQuestion >= questionsActuelles.length) {
                terminerNiveau();
                return;
            }

            const question = questionsActuelles[indexQuestion];
            reponseDonnee = false;

            if (zoneTimer) {
                zoneTimer.style.display = 'flex';
            }
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
        // VÉRIFIER RÉPONSE (avec juice)
        // ========================================
        function verifierReponse(indexChoisi) {
            if (reponseDonnee) return;
            reponseDonnee = true;
            arreterTimer();

            SoundManager.click();

            if (zoneTimer) {
                zoneTimer.style.display = 'none';
            }

            const question = questionsActuelles[indexQuestion];
            const boutons = zoneReponses.querySelectorAll('.btn-reponse');

            boutons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === question.correct) {
                    btn.classList.add('correct');
                } else if (idx === indexChoisi && idx !== question.correct) {
                    btn.classList.add('incorrect');
                }
            });

            if (indexChoisi === question.correct) {
                // ✅ Bonne réponse
                SoundManager.correct();
                Haptic.medium();
                lancerConfettis();

                scoreNiveau += 10;
                scoreTotal += 10;
                if (reponsesParNiveau[niveauActuel]) reponsesParNiveau[niveauActuel].correct++;
                serieActuelle++;
                verifierDeblocageDefi();

                // Animation pop sur le score total
                const scoreSpan = document.getElementById('scoreTotal');
                if (scoreSpan) {
                    scoreSpan.classList.remove('pop-score');
                    void scoreSpan.offsetWidth;
                    scoreSpan.classList.add('pop-score');
                }

            } else if (indexChoisi >= 0) {
                // ❌ Mauvaise réponse
                SoundManager.incorrect();
                Haptic.heavy();

                // Shake sur la question
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
        // TIMER (avec warning sonore)
        // ========================================
        function demarrerTimer() {
            arreterTimer();
            tempsRestant = 15;
            timerActif = true;

            if (timerValue) {
                timerValue.textContent = '15';
                timerValue.classList.remove('warning');
            }
            if (zoneTimer) {
                zoneTimer.style.display = 'flex';
            }

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
        // STATS & INTERFACE
        // ========================================
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

            if (dailyPlayers) {
                dailyPlayers.textContent = `🎯 ${serieActuelle}/${palierActuel}`;
            }
            if (btnDaily) {
                btnDaily.textContent = `🎯 ${serieActuelle}/${palierActuel}`;
            }

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
        // TERMINER NIVEAU (avec juice)
        // ========================================
        function terminerNiveau() {
            arreterTimer();
            estEnJeu = false;

            if (zoneTimer) {
                zoneTimer.style.display = 'none';
            }

            const stats = reponsesParNiveau[niveauActuel] || { correct: 0, incorrect: 0 };
            const total = stats.correct + stats.incorrect;

            if (stats.correct < 10) {
                // Échec
                SoundManager.incorrect();
                Haptic.pattern();
                if (questionText) {
                    questionText.textContent = `❌ Niveau ${niveauActuel} non validé ! (${stats.correct}/10) - Vous devez avoir 10/10 pour passer.`;
                }
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

            // ✅ Réussite
            if (stats.correct === 10) {
                SoundManager.levelUp();
                Haptic.pattern();
                lancerConfettis(['#fdcb6e', '#ff6b6b', '#4a6cf7', '#00b894', '#6c5ce7']);
                if (questionText) {
                    questionText.textContent = `🏆 PARFAIT ! 10/10 ! Score : ${scoreNiveau} pts - Passage au niveau ${niveauActuel + 1}`;
                }
                scoreTotal += 20;
                afficherNotification('🏆 Niveau parfait ! +20 pts bonus !', 'success');
                niveauActuel++;
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
        // SAUVEGARDE
        // ========================================
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
                if (savedMode && (savedMode === 'monde' || savedMode === 'afrique')) {
                    modeActuel = savedMode;
                    if (btnModeMonde && btnModeAfrique) {
                        btnModeMonde.classList.toggle('active', modeActuel === 'monde');
                        btnModeAfrique.classList.toggle('active', modeActuel === 'afrique');
                    }
                }
                chargerDonneesMode(modeActuel);
                mettreAJourInterface();
            } catch (e) { }
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
        // BOUTON INDICE
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
                    if (idx !== question.correct && !btn.disabled) {
                        mauvaisesReponses.push(idx);
                    }
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
        // BOUTON DAILY
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
        // BOUTON PROFIL
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
                    try {
                        localStorage.setItem('quiz_pseudo', nouveauPseudo);
                    } catch (e) { }
                    if (modalPseudo) modalPseudo.style.display = 'none';
                    afficherNotification(`👤 Pseudo changé en "${nouveauPseudo}"`, 'success');
                    if (socket) {
                        socket.emit('reconnecter', { pseudo: nouveauPseudo });
                    }
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
                if (e.target === modalPseudo) {
                    modalPseudo.style.display = 'none';
                }
            });
        }

        if (inputPseudo) {
            inputPseudo.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    btnPseudoOk.click();
                }
            });
        }

        // ========================================
        // SYSTÈME DE DUEL
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

            socket.on('joueurs_en_ligne', (joueurs) => {
                afficherJoueursEnLigne(joueurs);
            });

            socket.on('classements', (classements) => {
                afficherClassements(classements);
            });

            socket.on('duel_debute', (data) => {
                ouvrirFenetreDuel(data);
            });

            socket.on('demarrer_duel', (data) => {
                demarrerDuel(data);
            });

            socket.on('resultat_duel', (data) => {
                afficherResultatDuel(data);
            });

            socket.on('question_suivante', (data) => {
                afficherQuestionDuel(data);
            });

            socket.on('fin_duel', (data) => {
                terminerDuel(data);
            });

            socket.on('invitation_refusee', (data) => {
                afficherNotification(`❌ ${data.joueur} a refusé votre invitation`, 'error');
                duelInvitation.style.display = 'none';
            });

            socket.on('erreur', (data) => {
                afficherNotification(`❌ ${data.message}`, 'error');
            });
        }

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

        function inviterDuel(adversaireId) {
            if (estEnDuel) {
                afficherNotification('❌ Vous êtes déjà en duel !', 'error');
                return;
            }

            adversaireId = adversaireId;
            const questions = genererQuestionsDuel(5);

            socket.emit('inviter_duel', {
                adversaireId: adversaireId,
                questions: questions
            });

            duelInvitation.style.display = 'block';

            const items = document.querySelectorAll('.duel-item');
            items.forEach(item => {
                const btn = item.querySelector('.btn-defier');
                if (btn && btn.getAttribute('onclick')?.includes(adversaireId)) {
                    const nom = item.querySelector('.duel-pseudo')?.textContent || 'Adversaire';
                    invitationNom.textContent = nom;
                }
            });
        }

        window.inviterDuel = inviterDuel;

        function genererQuestionsDuel(nombre) {
            const locales = modeActuel === 'afrique' ? window.QUESTIONS_AFRIQUE : window.QUESTIONS_MONDE;
            const melangees = [...locales].sort(() => Math.random() - 0.5);
            const selection = melangees.slice(0, nombre);

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

        function ouvrirFenetreDuel(data) {
            SoundManager.duelStart();
            estEnDuel = true;
            salleId = data.salleId;

            duelOverlay.style.display = 'flex';
            duelNom1.textContent = profilNom.textContent;
            duelNom2.textContent = data.adversaire;
            duelScore1.textContent = '0';
            duelScore2.textContent = '0';
            duelReponses1.textContent = '✅ 0';
            duelReponses2.textContent = '✅ 0';
            duelQuestionText.textContent = '⏳ En attente du duel...';
            duelReponsesContainer.innerHTML = '';
            duelResultat.style.display = 'none';

            duelInvitation.style.display = 'none';
            duelStatut.style.display = 'block';
            duelStatutTexte.innerHTML = `En duel avec <strong>${data.adversaire}</strong>`;
        }

        function demarrerDuel(data) {
            SoundManager.duelStart();
            duelEnCours = true;
            duelQuestionText.textContent = 'Prêt ? C\'est parti !';
            duelNom1.textContent = profilNom.textContent;
            duelNom2.textContent = data.adversaire;

            setTimeout(() => {
                afficherQuestionDuel({ index: 0, question: data.questions[0] });
            }, 1000);
        }

        function afficherQuestionDuel(data) {
            const question = data.question;
            const totalQuestions = 5;

            duelQuestionNumero.textContent = `Question ${data.index + 1}/${totalQuestions}`;
            duelQuestionText.textContent = question.question;
            duelReponsesContainer.innerHTML = '';

            duelTempsRestant = 15;
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
                    socket.emit('reponse_duel', {
                        salleId: salleId,
                        indexQuestion: data.index,
                        reponse: -1,
                        tempsRestant: 0
                    });
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
                    socket.emit('reponse_duel', {
                        salleId: salleId,
                        indexQuestion: data.index,
                        reponse: idx,
                        tempsRestant: duelTempsRestant
                    });
                };
                duelReponsesContainer.appendChild(btn);
            });
        }

        function afficherResultatDuel(data) {
            if (data.correct !== undefined) {
                if (data.correct) {
                    afficherNotification('✅ Bonne réponse !', 'success');
                } else {
                    afficherNotification('❌ Mauvaise réponse !', 'error');
                }
            }
            duelScore1.textContent = data.score || 0;
            if (data.adversaireScore !== undefined) {
                duelScore2.textContent = data.adversaireScore;
            }
        }

        function terminerDuel(data) {
            clearInterval(duelTimerInterval);
            duelEnCours = false;
            estEnDuel = false;

            duelResultat.style.display = 'block';
            duelReponsesContainer.innerHTML = '';
            duelQuestionText.textContent = '🏁 Duel terminé !';
            duelTimer.style.display = 'none';
            duelQuestionNumero.textContent = '🎯 Résultats';

            const gagnantDiv = duelGagnant;
            if (data.gagnant === 'Égalité') {
                gagnantDiv.textContent = '🤝 Égalité !';
            } else if (data.gagnant === profilNom.textContent) {
                gagnantDiv.textContent = '🏆 Vous avez gagné ! 🎉';
                SoundManager.victory();
                lancerConfettis(['#fdcb6e', '#ffd93d', '#ff6b6b', '#4a6cf7']);
                scoreTotal += 30;
                sauvegarderPartie();
                mettreAJourStats();
                setTimeout(() => {
                    afficherNotification('🎉 Vous avez gagné le duel ! +30 pts', 'success');
                }, 500);
            } else {
                gagnantDiv.textContent = `👏 ${data.gagnant} a gagné !`;
            }

            duelStats1.textContent = `${data.joueur1.pseudo}: ${data.joueur1.score} pts (${data.joueur1.reponses} bonnes réponses)`;
            duelStats2.textContent = `${data.joueur2.pseudo}: ${data.joueur2.score} pts (${data.joueur2.reponses} bonnes réponses)`;

            duelStatut.style.display = 'none';
        }

        function quitterDuel() {
            if (duelTimerInterval) clearInterval(duelTimerInterval);
            estEnDuel = false;
            duelEnCours = false;
            duelOverlay.style.display = 'none';
            duelStatut.style.display = 'none';
            duelResultat.style.display = 'none';

            if (socket) {
                socket.emit('demander_joueurs');
            }
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
                                <span>⭐ ${j.meilleurScore || 0}</span>
                            `}
                        </div>
                    </div>
                `;
            });

            classementListe.innerHTML = html;
        }

        // ========================================
        // ÉVÉNEMENTS DES BOUTONS
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

        if (btnFermerDuel) {
            btnFermerDuel.addEventListener('click', quitterDuel);
        }

        if (btnQuitterDuel) {
            btnQuitterDuel.addEventListener('click', quitterDuel);
        }

        classementTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                classementTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                tabClassementActif = this.dataset.tab;
                if (socket) {
                    socket.emit('demander_classements');
                }
            });
        });

        // ========================================
        // SONS SUR TOUS LES BOUTONS
        // ========================================
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => SoundManager.click());
        });

        // ========================================
        // INITIALISATION FINALE
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

        // Ajout des animations popIn (pour les notifications)
        const stylePopIn = document.createElement('style');
        stylePopIn.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(stylePopIn);

        console.log('✅ MAIN.JS chargé avec succès !');
        console.log(`📚 Questions disponibles : Monde ${window.QUESTIONS_MONDE?.length || 0} + Afrique ${window.QUESTIONS_AFRIQUE?.length || 0} = ${(window.QUESTIONS_MONDE?.length || 0) + (window.QUESTIONS_AFRIQUE?.length || 0)}`);
    }
})();