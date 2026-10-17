// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel (Version finale)
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const { getMessage } = require('./messages'); // Assure-toi que ce fichier existe

const app = express();
const server = http.createServer(app);

// ========================================
// 🌐 CORS
// ========================================
const ORIGINES_AUTORISEES = [
    'https://arysex.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

const io = socketIo(server, {
    cors: {
        origin: ORIGINES_AUTORISEES,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({ origin: ORIGINES_AUTORISEES, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static('.'));

// ========================================
// 🔔 WEB-PUSH
// ========================================
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || 'BCm3hviRAjgIirkr81ce66VYPUzD7L3RBmnHuUFJ2HXEFJL9hCt1Xh-pFq6agQLlGHQdHs7D0vFacEPgg5pC7Xo';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'Rbw9F5qxXgzCVmIuip6aCheTRPRcp2LJ6YFkoJckz9s';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contact@arysex.com';

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

// ========================================
// 🔐 JWT
// ========================================
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-NE-PAS-UTILISER-EN-PROD';
const JWT_TTL = process.env.JWT_TTL || '30d';

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET non défini — utilisation du secret de développement !');
}

function genererToken(pseudo) {
    return jwt.sign({ pseudo }, JWT_SECRET, { expiresIn: JWT_TTL });
}

function verifierToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

// ========================================
// 🔧 NORMALISATION
// ========================================
function normaliserPseudo(pseudo) {
    if (!pseudo) return '';
    const trimmed = String(pseudo).trim();
    if (trimmed.length === 0) return '';
    const nettoye = trimmed.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
    if (nettoye.length === 0) return '';
    return nettoye.charAt(0).toUpperCase() + nettoye.slice(1).toLowerCase();
}

// ========================================
// 📦 EN MÉMOIRE
// ========================================
const joueurs = {};
const salles = {};
const invitations = {};

let classements = {};
let abonnementsPush = {};
let meta = {
    derniereNotif10h: null,
    derniereNotif16h: null
};

let envoiNotifEnCours = false;

// ========================================
// 💾 JSONBIN
// ========================================
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || 'TON_BIN_ID_ICI';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || 'TA_MASTER_KEY_ICI';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function chargerDonnees() {
    try {
        const res = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const data = await res.json();
        const record = data.record || {};

        if (record && (record.classements || record.abonnementsPush || record.meta)) {
            classements = record.classements || {};
            abonnementsPush = record.abonnementsPush || {};
            meta = record.meta || { derniereNotif10h: null, derniereNotif16h: null };
        } else if (record && typeof record === 'object') {
            classements = record;
            abonnementsPush = {};
            meta = { derniereNotif10h: null, derniereNotif16h: null };
        } else {
            classements = {};
            abonnementsPush = {};
            meta = { derniereNotif10h: null, derniereNotif16h: null };
        }

        // 🔧 Normalisation + migration
        const pseudosNormalises = {};
        for (const [pseudo, stats] of Object.entries(classements)) {
            const normalise = normaliserPseudo(pseudo);

            let monde = stats.soloScoreMonde || 0;
            let afrique = stats.soloScoreAfrique || 0;

            if (typeof stats.soloScore === 'number' && stats.soloScore > 0 && monde === 0 && afrique === 0) {
                monde = stats.soloScore;
            }

            const corrigees = {
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                soloScoreMonde: monde,
                soloScoreAfrique: afrique,
                soloScore: monde + afrique,
                niveauMonde: stats.niveauMonde || 1,
                niveauAfrique: stats.niveauAfrique || 1,
                niveau: Math.max(stats.niveauMonde || 1, stats.niveauAfrique || 1)
            };

            if (!pseudosNormalises[normalise]) {
                pseudosNormalises[normalise] = corrigees;
            } else {
                const e = pseudosNormalises[normalise];
                const maxMonde = Math.max(e.soloScoreMonde, corrigees.soloScoreMonde);
                const maxAfrique = Math.max(e.soloScoreAfrique, corrigees.soloScoreAfrique);
                pseudosNormalises[normalise] = {
                    victoires: Math.max(e.victoires, corrigees.victoires),
                    defaites: Math.max(e.defaites, corrigees.defaites),
                    egalites: Math.max(e.egalites, corrigees.egalites),
                    parties: Math.max(e.parties, corrigees.parties),
                    meilleurScore: Math.max(e.meilleurScore, corrigees.meilleurScore),
                    soloScoreMonde: maxMonde,
                    soloScoreAfrique: maxAfrique,
                    soloScore: maxMonde + maxAfrique,
                    niveauMonde: Math.max(e.niveauMonde, corrigees.niveauMonde),
                    niveauAfrique: Math.max(e.niveauAfrique, corrigees.niveauAfrique),
                    niveau: Math.max(e.niveau, corrigees.niveau)
                };
            }
        }
        classements = pseudosNormalises;

        // 🔁 Recalcul du score global
        for (const pseudo of Object.keys(classements)) {
            const s = classements[pseudo];
            s.soloScore = (s.soloScoreMonde || 0) + (s.soloScoreAfrique || 0);
            s.niveau = Math.max(s.niveauMonde || 1, s.niveauAfrique || 1);
        }

        await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({ classements, abonnementsPush, meta })
        });

        console.log(`📂 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push chargés`);

    } catch (e) {
        console.error('❌ Erreur chargement jsonbin:', e.message);
        classements = {};
        abonnementsPush = {};
        meta = { derniereNotif10h: null, derniereNotif16h: null };
    }
}

let saveTimeout = null;
function sauvegarderDonnees() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            const res = await fetch(JSONBIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({ classements, abonnementsPush, meta })
            });
            if (res.ok) {
                console.log(`💾 Sauvegardé (${Object.keys(classements).length} joueurs)`);
            } else {
                console.error('❌ Erreur sauvegarde:', res.status);
            }
        } catch (e) {
            console.error('❌ Erreur sauvegarde jsonbin:', e.message);
        }
    }, 2000);
}

// ========================================
// 📢 NOTIFICATIONS
// ========================================
async function envoyerNotification(pseudo, titre, message, url = '/') {
    const subscription = abonnementsPush[pseudo];
    if (!subscription) return { success: false, error: 'Non abonné' };

    try {
        await webpush.sendNotification(subscription, JSON.stringify({
            title: titre || 'AryseX Quiz',
            body: message || 'Nouveau quiz disponible !',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            url: url
        }));
        return { success: true };
    } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            delete abonnementsPush[pseudo];
            sauvegarderDonnees();
        }
        return { success: false, error: error.message };
    }
}

async function envoyerNotificationATous(titre, message, url = '/') {
    let envoyes = 0;
    let erreurs = 0;
    const pseudos = Object.keys(abonnementsPush);

    if (pseudos.length === 0) return { envoyes: 0, erreurs: 0, total: 0 };

    for (const pseudo of pseudos) {
        try {
            await webpush.sendNotification(abonnementsPush[pseudo], JSON.stringify({
                title: titre || 'AryseX Quiz',
                body: message || 'Nouveau quiz disponible ! 🎯',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-96.png',
                url: url
            }));
            envoyes++;
        } catch (e) {
            erreurs++;
            if (e.statusCode === 410 || e.statusCode === 404) {
                delete abonnementsPush[pseudo];
            }
        }
    }

    if (erreurs > 0) sauvegarderDonnees();
    console.log(`📬 Broadcast: ${envoyes} envoyés, ${erreurs} erreurs`);
    return { envoyes, erreurs, total: pseudos.length };
}

// ========================================
// 🕐 HEURE ABIDJAN
// ========================================
function getHeureAbidjan() {
    const maintenant = new Date();
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Abidjan',
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(maintenant);
    const get = (type) => parts.find(p => p.type === type)?.value;
    return {
        heure: parseInt(get('hour')),
        minute: parseInt(get('minute')),
        jour: `${get('year')}-${get('month')}-${get('day')}`
    };
}

// ========================================
// 🔔 NOTIFS AUTO
// ========================================
async function verifierNotificationsJour() {
    if (envoiNotifEnCours) return;
    envoiNotifEnCours = true;
    try {
        const { heure, minute, jour } = getHeureAbidjan();

        if ((heure > 10 || (heure === 10 && minute >= 0)) && meta.derniereNotif10h !== jour) {
            meta.derniereNotif10h = jour;
            sauvegarderDonnees();
            const msg = getMessage('matin');
            await envoyerNotificationATous(msg.titre, msg.body, '/');
        }

        if ((heure > 16 || (heure === 16 && minute >= 0)) && meta.derniereNotif16h !== jour) {
            meta.derniereNotif16h = jour;
            sauvegarderDonnees();
            const msg = getMessage('apresMidi');
            await envoyerNotificationATous(msg.titre, msg.body, '/');
        }
    } catch (e) {
        console.error('❌ Erreur verif notifs:', e.message);
    } finally {
        envoiNotifEnCours = false;
    }
}

// ========================================
// 🌐 ROUTES HTTP
// ========================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        abonnes: Object.keys(abonnementsPush).length,
        joueurs: Object.keys(joueurs).length,
        classements: Object.keys(classements).length,
        meta,
        heureAbidjan: getHeureAbidjan()
    });
});

// 🔑 AUTHENTIFICATION (génère le JWT)
app.post('/api/auth', (req, res) => {
    const { pseudo } = req.body || {};
    if (!pseudo || typeof pseudo !== 'string') {
        return res.status(400).json({ error: 'Pseudo requis' });
    }
    const pseudoNormalise = normaliserPseudo(pseudo);
    if (pseudoNormalise.length < 2 || pseudoNormalise.length > 20) {
        return res.status(400).json({ error: 'Pseudo invalide (2-20 caractères)' });
    }
    const token = genererToken(pseudoNormalise);
    console.log(`🔑 Token généré pour ${pseudoNormalise}`);
    res.json({ success: true, token, pseudo: pseudoNormalise });
});

app.post('/api/notifier', async (req, res) => {
    const { pseudo, titre, message, url, tous } = req.body;
    if (tous) {
        const result = await envoyerNotificationATous(titre, message, url);
        return res.json({ success: true, ...result });
    }
    if (!pseudo) return res.status(400).json({ error: 'Pseudo manquant' });
    const result = await envoyerNotification(normaliserPseudo(pseudo), titre, message, url);
    if (result.success) res.json({ success: true });
    else res.status(404).json({ error: result.error });
});

// ========================================
// 🔐 MIDDLEWARE SOCKET (VÉRIFICATION JWT)
// ========================================
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        console.log(`🚫 Refusé (pas de token): ${socket.id}`);
        return next(new Error('Token manquant'));
    }

    const payload = verifierToken(token);
    if (!payload || !payload.pseudo) {
        console.log(`🚫 Refusé (token invalide): ${socket.id}`);
        return next(new Error('Token invalide'));
    }

    socket.pseudoVerifie = payload.pseudo;
    next();
});

// ========================================
// 🔌 SOCKET
// ========================================
io.on('connection', (socket) => {
    console.log(`🔗 Connecté: ${socket.id} (${socket.pseudoVerifie})`);

    // ====== ENREGISTRER ======
    socket.on('enregistrer', () => {
        const pseudo = socket.pseudoVerifie;
        if (!pseudo) return;

        if (!classements[pseudo]) {
            classements[pseudo] = {
                victoires: 0, defaites: 0, egalites: 0,
                parties: 0, meilleurScore: 0,
                soloScoreMonde: 0,
                soloScoreAfrique: 0,
                soloScore: 0,
                niveauMonde: 1,
                niveauAfrique: 1,
                niveau: 1
            };
            sauvegarderDonnees();
        }

        const stats = classements[pseudo];
        const existant = Object.values(joueurs).find(j => j.pseudo === pseudo);

        stats.soloScoreMonde = stats.soloScoreMonde || 0;
        stats.soloScoreAfrique = stats.soloScoreAfrique || 0;
        stats.niveauMonde = stats.niveauMonde || 1;
        stats.niveauAfrique = stats.niveauAfrique || 1;
        stats.soloScore = stats.soloScoreMonde + stats.soloScoreAfrique;
        stats.niveau = Math.max(stats.niveauMonde, stats.niveauAfrique);

        joueurs[socket.id] = {
            pseudo,
            niveau: stats.niveau,
            niveauMonde: stats.niveauMonde,
            niveauAfrique: stats.niveauAfrique,
            score: stats.soloScore,
            enLigne: true,
            enDuel: false,
            salleId: null,
            victoires: existant ? existant.victoires : stats.victoires,
            defaites: existant ? existant.defaites : stats.defaites,
            egalites: existant ? existant.egalites : stats.egalites,
            parties: existant ? existant.parties : stats.parties,
            meilleurScore: Math.max(existant?.meilleurScore || 0, stats.meilleurScore || 0)
        };

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());

        socket.emit('mon_profil', {
            pseudo,
            niveau: stats.niveau,
            niveauMonde: stats.niveauMonde,
            niveauAfrique: stats.niveauAfrique,
            soloScore: stats.soloScore,
            soloScoreMonde: stats.soloScoreMonde,
            soloScoreAfrique: stats.soloScoreAfrique,
            victoires: stats.victoires || 0,
            defaites: stats.defaites || 0,
            parties: stats.parties || 0
        });

        console.log(`✅ ${pseudo} connecté (M:${stats.niveauMonde} / A:${stats.niveauAfrique})`);
        verifierNotificationsJour().catch(e => console.error(e.message));
    });

    // ====== SOLO : MISE À JOUR SCORE ======
    socket.on('solo_maj_score', (data) => {
        const joueur = joueurs[socket.id];
        if (!joueur) return;
        if (!data || typeof data.scoreTotal !== 'number') return;
        if (!Number.isFinite(data.scoreTotal)) return;

        const mode = data.mode === 'afrique' ? 'afrique' : 'monde';

        if (!classements[joueur.pseudo]) {
            classements[joueur.pseudo] = {
                victoires: 0, defaites: 0, egalites: 0,
                parties: 0, meilleurScore: 0,
                soloScoreMonde: 0,
                soloScoreAfrique: 0,
                soloScore: 0,
                niveauMonde: 1,
                niveauAfrique: 1,
                niveau: 1
            };
        }

        const stats = classements[joueur.pseudo];
        stats.soloScoreMonde = stats.soloScoreMonde || 0;
        stats.soloScoreAfrique = stats.soloScoreAfrique || 0;
        stats.niveauMonde = stats.niveauMonde || 1;
        stats.niveauAfrique = stats.niveauAfrique || 1;

        const nouveauScore = Math.max(0, Math.floor(data.scoreTotal));
        let ancien;

        if (mode === 'afrique') {
            ancien = stats.soloScoreAfrique;
            if (nouveauScore <= ancien) return;
            stats.soloScoreAfrique = nouveauScore;
        } else {
            ancien = stats.soloScoreMonde;
            if (nouveauScore <= ancien) return;
            stats.soloScoreMonde = nouveauScore;
        }

        // ✅ Mise à jour du niveau envoyé par le client (sans recalcul auto)
        if (typeof data.niveau === 'number' && data.niveau > 0) {
            if (mode === 'afrique') stats.niveauAfrique = data.niveau;
            else stats.niveauMonde = data.niveau;
        }

        stats.soloScore = stats.soloScoreMonde + stats.soloScoreAfrique;
        stats.niveau = Math.max(stats.niveauMonde, stats.niveauAfrique);

        joueur.score = stats.soloScore;
        joueur.niveau = stats.niveau;
        joueur.niveauMonde = stats.niveauMonde;
        joueur.niveauAfrique = stats.niveauAfrique;

        sauvegarderDonnees();
        io.emit('classements', getClassements());
        io.emit('joueurs_en_ligne', getJoueursEnLigne());

        socket.emit('solo_score_maj', {
            soloScoreMonde: stats.soloScoreMonde,
            soloScoreAfrique: stats.soloScoreAfrique,
            soloScore: stats.soloScore,
            niveauMonde: stats.niveauMonde,
            niveauAfrique: stats.niveauAfrique
        });

        console.log(`📤 ${joueur.pseudo} [${mode}] : M:${stats.soloScoreMonde} / A:${stats.soloScoreAfrique}`);
    });

    // ====== DEMANDES ======
    socket.on('demander_joueurs', () => {
        socket.emit('joueurs_en_ligne', getJoueursEnLigne());
    });

    socket.on('demander_classements', () => {
        socket.emit('classements', getClassements());
    });

    // ====== PUSH ======
    socket.on('enregistrer_push', (data) => {
        const { subscription } = data;
        const pseudo = socket.pseudoVerifie;

        if (!subscription || !pseudo) return;

        const estNouveau = !abonnementsPush[pseudo];
        abonnementsPush[pseudo] = subscription;
        sauvegarderDonnees();

        console.log(`📬 Push ${estNouveau ? 'enregistré' : 'mis à jour'} pour ${pseudo}`);
        socket.emit('push_enregistre', { success: true });
    });

    // ====== DUEL ======
    socket.on('inviter_duel', (data) => {
        const { adversaireId, questions } = data;
        const joueur = joueurs[socket.id];
        const adversaire = joueurs[adversaireId];

        if (!joueur) return;
        if (!adversaire || !adversaire.enLigne || adversaire.enDuel) {
            socket.emit('erreur', { message: 'Adversaire indisponible' });
            return;
        }
        if (joueur.enDuel) {
            socket.emit('erreur', { message: 'Vous êtes déjà en duel' });
            return;
        }
        if (!Array.isArray(questions) || questions.length === 0 || questions.length > 20) return;

        const invitationId = `invit_${Date.now()}_${socket.id}`;
        invitations[invitationId] = {
            id: invitationId,
            inviteurId: socket.id,
            inviteurPseudo: joueur.pseudo,
            adversaireId,
            questions: questions.map(q => ({
                question: q.question,
                correct: q.correct,
                options: q.options
            })),
            timestamp: Date.now()
        };

        io.to(adversaireId).emit('invitation_duel', {
            invitationId,
            inviteurPseudo: joueur.pseudo,
            inviteurId: socket.id
        });

        envoyerNotification(adversaire.pseudo, '⚔️ Duel en attente', `${joueur.pseudo} te défie !`);
        console.log(`📨 ${joueur.pseudo} → ${adversaire.pseudo}`);
    });

    socket.on('repondre_invitation', (data) => {
        const { invitationId, accepte } = data;
        const invitation = invitations[invitationId];
        if (!invitation) return;

        const inviteur = joueurs[invitation.inviteurId];
        const adversaire = joueurs[invitation.adversaireId];
        const inviteurId = invitation.inviteurId;
        const adversaireId = invitation.adversaireId;

        delete invitations[invitationId];

        if (!accepte) {
            if (inviteur) {
                io.to(inviteurId).emit('invitation_refusee', {
                    joueur: adversaire?.pseudo || 'Adversaire'
                });
            }
            return;
        }

        if (!inviteur || !adversaire) {
            io.to(inviteurId).emit('erreur', { message: 'Adversaire déconnecté' });
            return;
        }

        const salleId = `salle_${Date.now()}`;
        salles[salleId] = {
            joueur1: inviteurId,
            joueur2: adversaireId,
            questions: invitation.questions,
            scores: { [inviteurId]: 0, [adversaireId]: 0 },
            reponses: { [inviteurId]: 0, [adversaireId]: 0 },
            dejaRepondu: { [inviteurId]: new Set(), [adversaireId]: new Set() },
            terminee: false,
            termines: {}
        };

        joueurs[inviteurId].enDuel = true;
        joueurs[adversaireId].enDuel = true;

        io.to(inviteurId).emit('demarrer_duel', {
            salleId,
            adversaire: adversaire.pseudo,
            questions: invitation.questions
        });
        io.to(adversaireId).emit('demarrer_duel', {
            salleId,
            adversaire: inviteur.pseudo,
            questions: invitation.questions
        });

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
    });

    socket.on('reponse_duel', (data) => {
        const { salleId, indexQuestion, reponse, tempsRestant } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;
        if (socket.id !== salle.joueur1 && socket.id !== salle.joueur2) return;

        if (!salle.dejaRepondu[socket.id]) salle.dejaRepondu[socket.id] = new Set();
        if (salle.dejaRepondu[socket.id].has(indexQuestion)) return;
        salle.dejaRepondu[socket.id].add(indexQuestion);

        const question = salle.questions[indexQuestion];
        if (!question) return;

        let scoreGagne = 0;
        if (reponse === question.correct) {
            const temps = Math.max(0, Math.min(10, tempsRestant || 0));
            const bonus = Math.max(0, Math.floor(temps / 3) * 5);
            scoreGagne = 10 + bonus;
            salle.reponses[socket.id]++;
        }

        salle.scores[socket.id] += scoreGagne;

        const adversaireId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
        io.to(adversaireId).emit('adversaire_repondu', {
            adversaireScore: salle.scores[socket.id],
            adversaireBonnes: salle.reponses[socket.id]
        });

        socket.emit('mon_score_duel', {
            score: salle.scores[socket.id],
            bonnes: salle.reponses[socket.id]
        });
    });

    socket.on('duel_termine', (data) => {
        const { salleId } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        salle.termines[socket.id] = true;

        if (salle.termines[salle.joueur1] && salle.termines[salle.joueur2]) {
            terminerDuel(salleId);
        } else {
            const autreId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
            io.to(autreId).emit('adversaire_termine', {});
        }
    });

    async function terminerDuel(salleId) {
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;
        salle.terminee = true;

        const score1 = salle.scores[salle.joueur1] || 0;
        const score2 = salle.scores[salle.joueur2] || 0;

        let gagnantId = null;
        if (score1 > score2) gagnantId = salle.joueur1;
        else if (score2 > score1) gagnantId = salle.joueur2;

        const joueur1 = joueurs[salle.joueur1];
        const joueur2 = joueurs[salle.joueur2];

        if (joueur1 && joueur2) {
            joueur1.parties = (joueur1.parties || 0) + 1;
            joueur2.parties = (joueur2.parties || 0) + 1;

            if (gagnantId === salle.joueur1) {
                joueur1.victoires = (joueur1.victoires || 0) + 1;
                joueur2.defaites = (joueur2.defaites || 0) + 1;
            } else if (gagnantId === salle.joueur2) {
                joueur2.victoires = (joueur2.victoires || 0) + 1;
                joueur1.defaites = (joueur1.defaites || 0) + 1;
            } else {
                joueur1.egalites = (joueur1.egalites || 0) + 1;
                joueur2.egalites = (joueur2.egalites || 0) + 1;
            }

            if (!classements[joueur1.pseudo]) classements[joueur1.pseudo] = {};
            if (!classements[joueur2.pseudo]) classements[joueur2.pseudo] = {};

            Object.assign(classements[joueur1.pseudo], {
                victoires: joueur1.victoires,
                defaites: joueur1.defaites,
                egalites: joueur1.egalites,
                parties: joueur1.parties
            });
            Object.assign(classements[joueur2.pseudo], {
                victoires: joueur2.victoires,
                defaites: joueur2.defaites,
                egalites: joueur2.egalites,
                parties: joueur2.parties
            });

            sauvegarderDonnees();
        }

        const resultats = {
            joueur1: { pseudo: joueur1?.pseudo || 'J1', score: score1, reponses: salle.reponses[salle.joueur1] || 0 },
            joueur2: { pseudo: joueur2?.pseudo || 'J2', score: score2, reponses: salle.reponses[salle.joueur2] || 0 },
            gagnant: gagnantId ? joueurs[gagnantId]?.pseudo : 'Égalité'
        };

        io.to(salle.joueur1).emit('fin_duel', resultats);
        io.to(salle.joueur2).emit('fin_duel', resultats);

        if (joueurs[salle.joueur1]) joueurs[salle.joueur1].enDuel = false;
        if (joueurs[salle.joueur2]) joueurs[salle.joueur2].enDuel = false;

        setTimeout(() => { delete salles[salleId]; }, 30000);

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
    }

    // ====== HELPERS ======
    function getClassements() {
        const result = [];
        for (const [pseudo, stats] of Object.entries(classements)) {
            const enLigne = Object.values(joueurs).some(j => j.pseudo === pseudo && j.enLigne);
            const monde = stats.soloScoreMonde || 0;
            const afrique = stats.soloScoreAfrique || 0;
            const total = monde + afrique;
            const nivM = stats.niveauMonde || 1;
            const nivA = stats.niveauAfrique || 1;
            result.push({
                pseudo,
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                soloScoreMonde: monde,
                soloScoreAfrique: afrique,
                soloScore: total,
                niveau: Math.max(nivM, nivA),
                niveauMonde: nivM,
                niveauAfrique: nivA,
                enLigne,
                winRate: stats.parties > 0 ? Math.round((stats.victoires / stats.parties) * 100) : 0
            });
        }
        result.sort((a, b) => {
            if (b.victoires !== a.victoires) return b.victoires - a.victoires;
            return b.winRate - a.winRate;
        });
        return result;
    }

    function getJoueursEnLigne() {
        const result = [];
        for (const [id, data] of Object.entries(joueurs)) {
            if (data.enLigne && !data.enDuel) {
                const stats = classements[data.pseudo] || {};
                const monde = stats.soloScoreMonde || 0;
                const afrique = stats.soloScoreAfrique || 0;
                const total = monde + afrique;
                const nivM = stats.niveauMonde || 1;
                const nivA = stats.niveauAfrique || 1;
                result.push({
                    id,
                    pseudo: data.pseudo,
                    niveau: Math.max(nivM, nivA),
                    niveauMonde: nivM,
                    niveauAfrique: nivA,
                    score: total,
                    scoreMonde: monde,
                    scoreAfrique: afrique,
                    victoires: stats.victoires || 0,
                    defaites: stats.defaites || 0,
                    parties: stats.parties || 0
                });
            }
        }
        return result;
    }

    // ====== DISCONNECT ======
    socket.on('disconnect', () => {
        const joueur = joueurs[socket.id];
        if (joueur) {
            console.log(`👋 ${joueur.pseudo} déco`);
            if (joueur.salleId && salles[joueur.salleId]) {
                terminerDuel(joueur.salleId);
            }
            delete joueurs[socket.id];
            io.emit('joueurs_en_ligne', getJoueursEnLigne());
            io.emit('classements', getClassements());
        }
    });
});

// ========================================
// 🚀 DÉMARRER
// ========================================
const PORT = process.env.PORT || 3000;

chargerDonnees().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Serveur sécurisé sur ${PORT}`);
        console.log(`📊 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push`);
        console.log(`🔐 JWT TTL: ${JWT_TTL}`);
        console.log(`🌐 Origines autorisées: ${ORIGINES_AUTORISEES.join(', ')}`);
    });
});