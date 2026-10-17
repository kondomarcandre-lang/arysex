// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel
// Scores séparés par mode (Monde / Afrique) + JWT + validation serveur
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const { getMessage } = require('./messages');

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

// Schéma d'un joueur :
// {
//   victoires, defaites, egalites, parties, meilleurScore,
//   soloScoreMonde, soloScoreAfrique,
//   niveauMonde, niveauAfrique
// }

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

        // 🔧 Normalisation + migration ancien format
        const pseudosNormalises = {};
        for (const [pseudo, stats] of Object.entries(classements)) {
            const normalise = normaliserPseudo(pseudo);
            const corrigees = {
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                // Migration : l'ancien soloScore/niveau → Monde
                soloScoreMonde: stats.soloScoreMonde ?? stats.soloScore ?? 0,
                soloScoreAfrique: stats.soloScoreAfrique ?? 0,
                niveauMonde: stats.niveauMonde ?? stats.niveau ?? 1,
                niveauAfrique: stats.niveauAfrique ?? 1
            };

            if (!pseudosNormalises[normalise]) {
                pseudosNormalises[normalise] = corrigees;
            } else {
                const e = pseudosNormalises[normalise];
                pseudosNormalises[normalise] = {
                    victoires: Math.max(e.victoires, corrigees.victoires),
                    defaites: Math.max(e.defaites, corrigees.defaites),
                    egalites: Math.max(e.egalites, corrigees.egalites),
                    parties: Math.max(e.parties, corrigees.parties),
                    meilleurScore: Math.max(e.meilleurScore, corrigees.meilleurScore),
                    soloScoreMonde: Math.max(e.soloScoreMonde, corrigees.soloScoreMonde),
                    soloScoreAfrique: Math.max(e.soloScoreAfrique, corrigees.soloScoreAfrique),
                    niveauMonde: Math.max(e.niveauMonde, corrigees.niveauMonde),
                    niveauAfrique: Math.max(e.niveauAfrique, corrigees.niveauAfrique)
                };
                console.log(`🔧 Fusion doublon : "${pseudo}" → "${normalise}"`);
            }
        }
        classements = pseudosNormalises;

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
                console.log(`💾 Sauvegardé (${Object.keys(classements).length} joueurs, ${Object.keys(abonnementsPush).length} abonnés)`);
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

app.post('/api/auth', (req, res) => {
    const { pseudo } = req.body || {};
    if (!pseudo || typeof pseudo !== 'string') {
        return res.status(400).json({ error: 'Pseudo requis' });
    }
    const pseudoNormalise = normaliserPseudo(pseudo);
    if (pseudoNormalise.length < 2 || pseudoNormalise.length > 20) {
        return res.status(400).json({ error: 'Pseudo invalide (2-20 caractères, lettres/chiffres)' });
    }
    const token = genererToken(pseudoNormalise);
    console.log(`🔑 Token généré pour ${pseudoNormalise}`);
    res.json({ success: true, token, pseudo: pseudoNormalise });
});

app.get('/api/abonnes', (req, res) => {
    res.json({
        total: Object.keys(abonnementsPush).length,
        pseudos: Object.keys(abonnementsPush)
    });
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

app.post('/api/notifier-special', async (req, res) => {
    const { titre, message, url } = req.body || {};
    const msg = (titre && message)
        ? { titre, body: message }
        : getMessage('special');
    console.log(`🎯 Notif spéciale : "${msg.titre}"`);
    const result = await envoyerNotificationATous(msg.titre, msg.body, url || '/');
    res.json({ success: true, msg, result });
});

// ========================================
// 🧹 ADMIN
// ========================================
app.get('/api/admin/scores-list', (req, res) => {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Non autorisé' });
    }
    const liste = Object.entries(classements)
        .map(([pseudo, s]) => ({
            pseudo,
            monde: s.soloScoreMonde || 0,
            afrique: s.soloScoreAfrique || 0,
            victoires: s.victoires || 0
        }))
        .sort((a, b) => Math.max(b.monde, b.afrique) - Math.max(a.monde, a.afrique));
    res.json(liste);
});

app.post('/api/admin/reset-scores-suspects', async (req, res) => {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Non autorisé' });
    }
    const SEUIL = parseInt(req.body.seuil) || 1000;
    const tricheurs = [];

    for (const [pseudo, stats] of Object.entries(classements)) {
        const monde = stats.soloScoreMonde || 0;
        const afrique = stats.soloScoreAfrique || 0;

        if (monde > SEUIL) {
            tricheurs.push({ pseudo, mode: 'monde', ancienScore: monde });
            classements[pseudo].soloScoreMonde = 0;
        }
        if (afrique > SEUIL) {
            tricheurs.push({ pseudo, mode: 'afrique', ancienScore: afrique });
            classements[pseudo].soloScoreAfrique = 0;
        }
    }

    sauvegarderDonnees();
    console.log(`🧹 Reset ciblé (seuil ${SEUIL}) : ${tricheurs.length} scores remis à 0`);
    res.json({ success: true, seuil: SEUIL, tricheurs });
});

// ========================================
// 🔐 MIDDLEWARE SOCKET
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
    socket.on('enregistrer', (data) => {
        const pseudo = socket.pseudoVerifie;
        if (!pseudo) return;

        const mode = data?.mode === 'afrique' ? 'afrique' : 'monde';

        if (!classements[pseudo]) {
            classements[pseudo] = {
                victoires: 0, defaites: 0, egalites: 0,
                parties: 0, meilleurScore: 0,
                soloScoreMonde: 0, soloScoreAfrique: 0,
                niveauMonde: 1, niveauAfrique: 1
            };
            sauvegarderDonnees();
        }

        const stats = classements[pseudo];
        const existant = Object.values(joueurs).find(j => j.pseudo === pseudo);

        joueurs[socket.id] = {
            pseudo,
            modeActif: mode,
            niveau: mode === 'afrique' ? (stats.niveauAfrique || 1) : (stats.niveauMonde || 1),
            score: mode === 'afrique' ? (stats.soloScoreAfrique || 0) : (stats.soloScoreMonde || 0),
            enLigne: true,
            enDuel: false,
            salleId: null,
            victoires: existant ? existant.victoires : stats.victoires,
            defaites: existant ? existant.defaites : stats.defaites,
            egalites: existant ? existant.egalites : stats.egalites,
            parties: existant ? existant.parties : stats.parties,
            meilleurScore: Math.max(existant?.meilleurScore || 0, stats.meilleurScore || 0),
            partieSolo: null
        };

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());

        // 🔑 Envoie au client son profil complet (les 2 modes)
        socket.emit('mon_profil', {
            pseudo,
            modeActif: mode,
            niveauMonde: stats.niveauMonde || 1,
            niveauAfrique: stats.niveauAfrique || 1,
            soloScoreMonde: stats.soloScoreMonde || 0,
            soloScoreAfrique: stats.soloScoreAfrique || 0,
            victoires: stats.victoires || 0,
            defaites: stats.defaites || 0,
            parties: stats.parties || 0
        });

        console.log(`✅ ${pseudo} connecté [${mode}] (Monde: ${stats.soloScoreMonde || 0}pts N${stats.niveauMonde || 1} · Afrique: ${stats.soloScoreAfrique || 0}pts N${stats.niveauAfrique || 1})`);

        verifierNotificationsJour().catch(e =>
            console.error('❌ Erreur notif connexion:', e.message)
        );
    });

    // ====== SOLO : DÉMARRER ======
    socket.on('solo_demarrer', (data) => {
        const joueur = joueurs[socket.id];
        if (!joueur) return;

        const { questions, mode, niveau } = data;
        if (!Array.isArray(questions) || questions.length === 0) return;
        if (questions.length > 30) return;

        const modeValide = mode === 'afrique' ? 'afrique' : 'monde';

        joueur.modeActif = modeValide;
        joueur.partieSolo = {
            questions: questions.map(q => ({
                question: q.question,
                correct: q.correct,
                options: q.options
            })),
            index: 0,
            score: 0,
            bonnes: 0,
            mauvaises: 0,
            dejaRepondu: new Set(),
            terminee: false,
            mode: modeValide,
            niveau: niveau || 1,
            commencee: Date.now()
        };

        // Resync niveau et score du joueur selon le mode
        const stats = classements[joueur.pseudo];
        if (stats) {
            joueur.niveau = modeValide === 'afrique' ? (stats.niveauAfrique || 1) : (stats.niveauMonde || 1);
            joueur.score = modeValide === 'afrique' ? (stats.soloScoreAfrique || 0) : (stats.soloScoreMonde || 0);
        }

        console.log(`🎮 ${joueur.pseudo} démarre solo [${modeValide}] niveau ${niveau}`);
        socket.emit('solo_pret', { total: questions.length, mode: modeValide });
    });

    // ====== SOLO : RÉPONDRE ======
    socket.on('solo_repondre', (data) => {
        const joueur = joueurs[socket.id];
        if (!joueur || !joueur.partieSolo) return;

        const partie = joueur.partieSolo;
        const { indexQuestion, reponse, tempsRestant } = data;

        if (partie.terminee) return;
        if (indexQuestion !== partie.index) return;
        if (partie.dejaRepondu.has(indexQuestion)) return;

        const question = partie.questions[indexQuestion];
        if (!question) return;

        partie.dejaRepondu.add(indexQuestion);

        const estCorrecte = (reponse === question.correct);
        let pointsGagnes = 0;

        if (estCorrecte) {
            const temps = Math.max(0, Math.min(15, tempsRestant || 0));
            const bonus = Math.max(0, Math.floor(temps / 3) * 5);
            pointsGagnes = 10 + bonus;
            partie.score += pointsGagnes;
            partie.bonnes++;
        } else {
            partie.mauvaises++;
        }

        partie.index++;

        socket.emit('solo_resultat', {
            indexQuestion,
            correcte: estCorrecte,
            pointsGagnes,
            scoreTotal: partie.score,
            bonnes: partie.bonnes,
            mauvaises: partie.mauvaises,
            indexSuivant: partie.index,
            terminee: partie.index >= partie.questions.length
        });
    });

    // ====== SOLO : TERMINER ======
    socket.on('solo_terminer', () => {
        const joueur = joueurs[socket.id];
        if (!joueur || !joueur.partieSolo) return;

        const partie = joueur.partieSolo;
        if (partie.terminee) return;
        partie.terminee = true;

        if (!classements[joueur.pseudo]) {
            classements[joueur.pseudo] = {
                victoires: 0, defaites: 0, egalites: 0,
                parties: 0, meilleurScore: 0,
                soloScoreMonde: 0, soloScoreAfrique: 0,
                niveauMonde: 1, niveauAfrique: 1
            };
        }

        const stats = classements[joueur.pseudo];
        const mode = partie.mode || 'monde';
        const cleScore = mode === 'afrique' ? 'soloScoreAfrique' : 'soloScoreMonde';
        const cleNiveau = mode === 'afrique' ? 'niveauAfrique' : 'niveauMonde';

        // Cumul
        const ancienScore = stats[cleScore] || 0;
        const nouveauScore = ancienScore + partie.score;
        stats[cleScore] = nouveauScore;

        // Validation niveau (10/10 → +1)
        let niveauChange = false;
        if (partie.bonnes === 10 && partie.niveau === (stats[cleNiveau] || 1)) {
            stats[cleNiveau] = (stats[cleNiveau] || 1) + 1;
            niveauChange = true;
            console.log(`🎉 ${joueur.pseudo} passe niveau ${stats[cleNiveau]} [${mode}]`);
        }

        // Mise à jour du joueur en mémoire
        if (mode === 'afrique') {
            joueur.score = stats.soloScoreAfrique;
            joueur.niveau = stats.niveauAfrique;
        } else {
            joueur.score = stats.soloScoreMonde;
            joueur.niveau = stats.niveauMonde;
        }

        sauvegarderDonnees();
        io.emit('classements', getClassements());
        io.emit('joueurs_en_ligne', getJoueursEnLigne());

        socket.emit('solo_termine', {
            mode,
            scorePartie: partie.score,
            scoreTotal: nouveauScore,
            bonnes: partie.bonnes,
            mauvaises: partie.mauvaises,
            niveau: stats[cleNiveau] || 1,
            niveauChange
        });

        console.log(`📈 ${joueur.pseudo} [${mode}] : +${partie.score} pts (total ${nouveauScore}, niveau ${stats[cleNiveau]})`);

        joueur.partieSolo = null;
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

        if (estNouveau) {
            setTimeout(() => {
                envoyerNotification(
                    pseudo,
                    '🎯 Bienvenue sur AryseX Quiz !',
                    'Tu recevras les nouveaux quiz et défis. Bon jeu ! 🚀'
                );
            }, 2000);
        }
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

        const messagesDuel = [
            `⚔️ ${joueur.pseudo} te défie ! T'as peur ou quoi ? 😏`,
            `🔥 ${joueur.pseudo} veut ta peau en duel. Tu acceptes ?`,
            `👊 ${joueur.pseudo} t'attend. Le perdant paie le resto 😎`,
            `💘 ${joueur.pseudo} te lance un défi. Réponds, ne fuis pas !`,
            `🎯 Duel ! ${joueur.pseudo} vs toi. Ouvre l'app pour voir qui gère.`,
            `😤 ${joueur.pseudo} se la raconte. Fais-le taire en duel !`
        ];
        const notifDuel = messagesDuel[Math.floor(Math.random() * messagesDuel.length)];

        envoyerNotification(adversaire.pseudo, '⚔️ Duel en attente', notifDuel);
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
                const refusMsgs = [
                    `💔 ${adversaire?.pseudo || 'L\'adversaire'} a refusé. Il a peur 😏`,
                    `😅 ${adversaire?.pseudo || 'L\'adversaire'} s'est dégonflé !`,
                    `🚪 ${adversaire?.pseudo || 'L\'adversaire'} a fui le duel…`
                ];
                const refusMsg = refusMsgs[Math.floor(Math.random() * refusMsgs.length)];
                envoyerNotification(inviteur.pseudo, '❌ Duel refusé', refusMsg);
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
            indexQuestion: 0,
            terminee: false,
            termines: {}
        };

        joueurs[inviteurId].enDuel = true;
        joueurs[inviteurId].salleId = salleId;
        joueurs[adversaireId].enDuel = true;
        joueurs[adversaireId].salleId = salleId;

        io.to(inviteurId).emit('demarrer_duel', {
            salleId,
            adversaire: adversaire.pseudo,
            questions: invitation.questions,
            estCreateur: true
        });
        io.to(adversaireId).emit('demarrer_duel', {
            salleId,
            adversaire: inviteur.pseudo,
            questions: invitation.questions,
            estCreateur: false
        });

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        console.log(`⚔️ ${inviteur.pseudo} vs ${adversaire.pseudo}`);
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
        const bonneReponse = (reponse === question.correct);

        if (bonneReponse) {
            const temps = Math.max(0, Math.min(10, tempsRestant || 0));
            const bonus = Math.max(0, Math.floor(temps / 3) * 5);
            scoreGagne = 10 + bonus;
            salle.reponses[socket.id] = (salle.reponses[socket.id] || 0) + 1;
        }

        salle.scores[socket.id] = (salle.scores[socket.id] || 0) + scoreGagne;

        const adversaireId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
        io.to(adversaireId).emit('adversaire_repondu', {
            adversaireScore: salle.scores[socket.id],
            adversaireBonnes: salle.reponses[socket.id]
        });

        socket.emit('mon_score_duel', {
            score: salle.scores[socket.id],
            bonnes: salle.reponses[socket.id],
            indexQuestion,
            correcte: bonneReponse
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
            joueur1.parties++;
            joueur2.parties++;

            if (gagnantId === salle.joueur1) {
                joueur1.victoires++;
                joueur2.defaites++;
                joueur1.meilleurScore = Math.max(joueur1.meilleurScore, score1);
            } else if (gagnantId === salle.joueur2) {
                joueur2.victoires++;
                joueur1.defaites++;
                joueur2.meilleurScore = Math.max(joueur2.meilleurScore, score2);
            } else {
                joueur1.egalites++;
                joueur2.egalites++;
            }

            // Mise à jour sélective (ne PAS écraser les scores solo)
            if (!classements[joueur1.pseudo]) classements[joueur1.pseudo] = {};
            if (!classements[joueur2.pseudo]) classements[joueur2.pseudo] = {};

            Object.assign(classements[joueur1.pseudo], {
                victoires: joueur1.victoires,
                defaites: joueur1.defaites,
                egalites: joueur1.egalites,
                parties: joueur1.parties,
                meilleurScore: joueur1.meilleurScore
            });
            Object.assign(classements[joueur2.pseudo], {
                victoires: joueur2.victoires,
                defaites: joueur2.defaites,
                egalites: joueur2.egalites,
                parties: joueur2.parties,
                meilleurScore: joueur2.meilleurScore
            });

            sauvegarderDonnees();

            if (gagnantId === salle.joueur1) {
                envoyerNotification(joueur1.pseudo, '🏆 Victoire !', `Tu as battu ${joueur2.pseudo} ${score1}-${score2} 🎉`);
                envoyerNotification(joueur2.pseudo, '💔 Défaite', `${joueur1.pseudo} t'a battu ${score2}-${score1}. Revanche ? 😤`);
            } else if (gagnantId === salle.joueur2) {
                envoyerNotification(joueur2.pseudo, '🏆 Victoire !', `Tu as battu ${joueur1.pseudo} ${score2}-${score1} 🎉`);
                envoyerNotification(joueur1.pseudo, '💔 Défaite', `${joueur2.pseudo} t'a battu ${score1}-${score2}. Revanche ? 😤`);
            } else {
                envoyerNotification(joueur1.pseudo, '🤝 Égalité !', `Match nul ${score1}-${score2} contre ${joueur2.pseudo}`);
                envoyerNotification(joueur2.pseudo, '🤝 Égalité !', `Match nul ${score2}-${score1} contre ${joueur1.pseudo}`);
            }
        }

        const resultats = {
            joueur1: { pseudo: joueur1?.pseudo || 'J1', score: score1, reponses: salle.reponses[salle.joueur1] || 0 },
            joueur2: { pseudo: joueur2?.pseudo || 'J2', score: score2, reponses: salle.reponses[salle.joueur2] || 0 },
            gagnant: gagnantId ? joueurs[gagnantId]?.pseudo : 'Égalité',
            statut: gagnantId ? 'victoire' : 'egalite'
        };

        io.to(salle.joueur1).emit('fin_duel', resultats);
        io.to(salle.joueur2).emit('fin_duel', resultats);

        if (joueurs[salle.joueur1]) { joueurs[salle.joueur1].enDuel = false; joueurs[salle.joueur1].salleId = null; }
        if (joueurs[salle.joueur2]) { joueurs[salle.joueur2].enDuel = false; joueurs[salle.joueur2].salleId = null; }

        setTimeout(() => { delete salles[salleId]; }, 30000);

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
    }

    // ====== HELPERS ======
    function getClassements() {
        const result = [];
        for (const [pseudo, stats] of Object.entries(classements)) {
            const enLigne = Object.values(joueurs).some(j => j.pseudo === pseudo && j.enLigne);
            result.push({
                pseudo,
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                soloScoreMonde: stats.soloScoreMonde || 0,
                soloScoreAfrique: stats.soloScoreAfrique || 0,
                niveauMonde: stats.niveauMonde || 1,
                niveauAfrique: stats.niveauAfrique || 1,
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
                const mode = data.modeActif || 'monde';

                const niveauAffiche = mode === 'afrique'
                    ? (stats.niveauAfrique || 1)
                    : (stats.niveauMonde || 1);
                const scoreAffiche = mode === 'afrique'
                    ? (stats.soloScoreAfrique || 0)
                    : (stats.soloScoreMonde || 0);

                result.push({
                    id,
                    pseudo: data.pseudo,
                    mode,
                    niveau: niveauAffiche,
                    score: scoreAffiche,
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