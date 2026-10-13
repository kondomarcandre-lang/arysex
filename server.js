// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel
// jsonbin.io + web-push + notifications fun à la connexion
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const webpush = require('web-push');
const { getMessage } = require('./messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));  

// ========================================
// 🔔 CONFIGURATION WEB-PUSH
// ========================================
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || 'BCm3hviRAjgIirkr81ce66VYPUzD7L3RBmnHuUFJ2HXEFJL9hCt1Xh-pFq6agQLlGHQdHs7D0vFacEPgg5pC7Xo';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'Rbw9F5qxXgzCVmIuip6aCheTRPRcp2LJ6YFkoJckz9s';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contact@arysex.com';

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

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

// Anti-double envoi simultané
let envoiNotifEnCours = false;

// ========================================
// 💾 JSONBIN.IO
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
            // Ancien format : le record EST le classement
            classements = record;
            abonnementsPush = {};
            meta = { derniereNotif10h: null, derniereNotif16h: null };
        } else {
            classements = {};
            abonnementsPush = {};
            meta = { derniereNotif10h: null, derniereNotif16h: null };
        }

        console.log(`📂 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push chargés`);
        console.log(`📅 Meta: 10h=${meta.derniereNotif10h || 'jamais'}, 16h=${meta.derniereNotif16h || 'jamais'}`);
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
// 📢 FONCTIONS DE NOTIFICATION
// ========================================
async function envoyerNotification(pseudo, titre, message, url = '/') {
    const subscription = abonnementsPush[pseudo];

    if (!subscription) {
        console.warn(`⚠️ Pas d'abonnement pour ${pseudo}`);
        return { success: false, error: 'Non abonné' };
    }

    try {
        await webpush.sendNotification(subscription, JSON.stringify({
            title: titre || 'AryseX Quiz',
            body: message || 'Nouveau quiz disponible !',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            url: url
        }));
        console.log(`📬 Notif envoyée à ${pseudo}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Erreur push pour ${pseudo}: [${error.statusCode}] ${error.message}`);

        if (error.statusCode === 410 || error.statusCode === 404) {
            delete abonnementsPush[pseudo];
            sauvegarderDonnees();
            console.log(`🗑️ Abonnement supprimé pour ${pseudo}`);
        }
        return { success: false, error: error.message };
    }
}

async function envoyerNotificationATous(titre, message, url = '/') {
    let envoyes = 0;
    let erreurs = 0;
    const pseudos = Object.keys(abonnementsPush);

    if (pseudos.length === 0) {
        console.warn('⚠️ Aucun abonné à notifier');
        return { envoyes: 0, erreurs: 0, total: 0 };
    }

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
// 🕐 HEURE DE CÔTE D'IVOIRE (Abidjan, UTC+0)
// ========================================
function getHeureAbidjan() {
    const maintenant = new Date();
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Abidjan',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
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
// 🔔 NOTIFICATIONS À LA CONNEXION (MESSAGES FUN)
// ========================================
async function verifierNotificationsJour() {
    if (envoiNotifEnCours) return;
    envoiNotifEnCours = true;

    try {
        const { heure, minute, jour } = getHeureAbidjan();

        // ---- Notification du matin (à partir de 10h) ----
        if ((heure > 10 || (heure === 10 && minute >= 0))
            && meta.derniereNotif10h !== jour) {

            meta.derniereNotif10h = jour;
            sauvegarderDonnees();

            const msg = getMessage('matin');
            console.log(`⏰ [Connexion] Notif matinale (${jour} ${heure}h${minute}) : "${msg.titre}"`);
            await envoyerNotificationATous(msg.titre, msg.body, '/');
        }

        // ---- Notification de l'après-midi (à partir de 16h) ----
        if ((heure > 16 || (heure === 16 && minute >= 0))
            && meta.derniereNotif16h !== jour) {

            meta.derniereNotif16h = jour;
            sauvegarderDonnees();

            const msg = getMessage('apresMidi');
            console.log(`⏰ [Connexion] Notif après-midi (${jour} ${heure}h${minute}) : "${msg.titre}"`);
            await envoyerNotificationATous(msg.titre, msg.body, '/');
        }
    } catch (e) {
        console.error('❌ Erreur verifierNotificationsJour:', e.message);
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

    if (!pseudo) {
        return res.status(400).json({ error: 'Pseudo manquant' });
    }

    const result = await envoyerNotification(pseudo, titre, message, url);

    if (result.success) {
        res.json({ success: true, message: `Notification envoyée à ${pseudo}` });
    } else {
        res.status(404).json({ error: result.error });
    }
});

app.post('/api/test-cron', async (req, res) => {
    console.log('🧪 Test manuel...');
    const result = await envoyerNotificationATous(
        '🎯 Test notification',
        'Ceci est un test.'
    );
    res.json({ success: true, ...result });
});

// Endpoint pour déclencher manuellement la vérif
app.post('/api/verifier-notifs', async (req, res) => {
    await verifierNotificationsJour();
    res.json({ success: true, meta });
});

// 🧪 Tester un message spécifique : /api/test-message/crush
app.get('/api/test-message/:type', async (req, res) => {
    const { type } = req.params;
    const msg = getMessage(type);
    console.log(`🧪 Test message "${type}" : ${msg.titre}`);
    const result = await envoyerNotificationATous(msg.titre, msg.body, '/');
    res.json({ msg, result });
});

// ========================================
// 🔌 CONNEXION SOCKET
// ========================================
io.on('connection', (socket) => {
    console.log(`🔗 Connecté: ${socket.id}`);

    socket.on('enregistrer', (data) => {
        const { pseudo, niveau, score } = data;
        if (!pseudo) return;

        const stats = classements[pseudo] || {
            victoires: 0, defaites: 0, egalites: 0,
            parties: 0, meilleurScore: 0, soloScore: 0
        };

        const existant = Object.values(joueurs).find(j => j.pseudo === pseudo);

        joueurs[socket.id] = {
            pseudo,
            niveau: niveau || 1,
            score: score || 0,
            enLigne: true,
            enDuel: false,
            salleId: null,
            victoires: existant ? existant.victoires : stats.victoires,
            defaites: existant ? existant.defaites : stats.defaites,
            egalites: existant ? existant.egalites : stats.egalites,
            parties: existant ? existant.parties : stats.parties,
            meilleurScore: Math.max(existant?.meilleurScore || 0, stats.meilleurScore || 0)
        };

        if (!classements[pseudo]) {
            classements[pseudo] = { ...stats };
            sauvegarderDonnees();
        }

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
        console.log(`✅ ${pseudo} (🏆 ${joueurs[socket.id].victoires}V)`);

        // 🔔 Vérifier les notifications du jour
        verifierNotificationsJour().catch(e =>
            console.error('❌ Erreur notif connexion:', e.message)
        );
    });

    socket.on('mettre_a_jour_score', (data) => {
        const joueur = joueurs[socket.id];
        if (!joueur) return;
        const { score } = data;

        if (!classements[joueur.pseudo]) {
            classements[joueur.pseudo] = {
                victoires: 0, defaites: 0, egalites: 0,
                parties: 0, meilleurScore: 0, soloScore: 0
            };
        }
        if (score > (classements[joueur.pseudo].soloScore || 0)) {
            classements[joueur.pseudo].soloScore = score;
            sauvegarderDonnees();
            io.emit('classements', getClassements());
        }
    });

    socket.on('demander_joueurs', () => {
        socket.emit('joueurs_en_ligne', getJoueursEnLigne());
    });

    socket.on('demander_classements', () => {
        socket.emit('classements', getClassements());
    });

    // ========================================
    // 🔔 ENREGISTRER UN ABONNEMENT PUSH
    // ========================================
    socket.on('enregistrer_push', (data) => {
        const { subscription, pseudo } = data;

        if (!subscription || !pseudo) {
            console.warn('⚠️ Abonnement push invalide');
            return;
        }

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

    // ========================================
    // 📢 NOTIFICATION DEPUIS UN CLIENT
    // ========================================
    socket.on('envoyer_notification', async (data) => {
        const { pseudo, titre, message, url } = data;

        if (!pseudo) {
            socket.emit('erreur', { message: 'Pseudo manquant' });
            return;
        }

        const result = await envoyerNotification(pseudo, titre, message, url);

        if (result.success) {
            socket.emit('notification_envoyee', { success: true });
        } else {
            socket.emit('erreur', { message: result.error });
        }
    });

    // ========================================
    // 💬 CHAT
    // ========================================
    socket.on('envoyer_message', async (data) => {
        const { destinataire, message } = data;
        const expediteur = joueurs[socket.id]?.pseudo;

        if (!expediteur || !destinataire || !message) return;

        await envoyerNotification(
            destinataire,
            `💬 ${expediteur}`,
            message
        );
    });

    // ========================================
    // ⚔️ INVITATION DUEL (avec notif fun)
    // ========================================
    socket.on('inviter_duel', (data) => {
        const { adversaireId, questions } = data;
        const joueur = joueurs[socket.id];
        const adversaire = joueurs[adversaireId];

        if (!adversaire || !adversaire.enLigne || adversaire.enDuel) {
            socket.emit('erreur', { message: 'Adversaire indisponible' });
            return;
        }
        if (joueur.enDuel) {
            socket.emit('erreur', { message: 'Vous êtes déjà en duel' });
            return;
        }

        const invitationId = `invit_${Date.now()}_${socket.id}`;
        invitations[invitationId] = {
            id: invitationId,
            inviteurId: socket.id,
            inviteurPseudo: joueur.pseudo,
            adversaireId,
            questions: questions || [],
            timestamp: Date.now()
        };

        io.to(adversaireId).emit('invitation_duel', {
            invitationId,
            inviteurPseudo: joueur.pseudo,
            inviteurId: socket.id
        });

        // 🎯 Notif fun pour le duel
        const messagesDuel = [
            `⚔️ ${joueur.pseudo} te défie ! T'as peur ou quoi ? 😏`,
            `🔥 ${joueur.pseudo} veut ta peau en duel. Tu acceptes ?`,
            `👊 ${joueur.pseudo} t'attend. Le perdant paie le resto 😎`,
            `💘 ${joueur.pseudo} te lance un défi. Réponds, ne fuis pas !`,
            `🎯 Duel ! ${joueur.pseudo} vs toi. Ouvre l'app pour voir qui gère.`,
            `😤 ${joueur.pseudo} se la raconte. Fais-le taire en duel !`
        ];
        const notifDuel = messagesDuel[Math.floor(Math.random() * messagesDuel.length)];

        envoyerNotification(
            adversaire.pseudo,
            '⚔️ Duel en attente',
            notifDuel
        );

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

                // Notif fun refus
                const refusMsgs = [
                    `💔 ${adversaire?.pseudo || 'L\'adversaire'} a refusé. Il a peur 😏`,
                    `😅 ${adversaire?.pseudo || 'L\'adversaire'} s'est dégonflé !`,
                    `🚪 ${adversaire?.pseudo || 'L\'adversaire'} a fui le duel…`
                ];
                const refusMsg = refusMsgs[Math.floor(Math.random() * refusMsgs.length)];

                envoyerNotification(
                    inviteur.pseudo,
                    '❌ Duel refusé',
                    refusMsg
                );
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

    // ========================================
    // ✅ VALIDATION SERVEUR DES RÉPONSES DUEL
    // ========================================
    socket.on('reponse_duel', (data) => {
        const { salleId, indexQuestion, reponse, tempsRestant } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        if (socket.id !== salle.joueur1 && socket.id !== salle.joueur2) return;

        if (!salle.dejaRepondu[socket.id]) {
            salle.dejaRepondu[socket.id] = new Set();
        }
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
            indexQuestion: indexQuestion,
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

            classements[joueur1.pseudo] = {
                victoires: joueur1.victoires,
                defaites: joueur1.defaites,
                egalites: joueur1.egalites,
                parties: joueur1.parties,
                meilleurScore: joueur1.meilleurScore,
                soloScore: classements[joueur1.pseudo]?.soloScore || 0
            };
            classements[joueur2.pseudo] = {
                victoires: joueur2.victoires,
                defaites: joueur2.defaites,
                egalites: joueur2.egalites,
                parties: joueur2.parties,
                meilleurScore: joueur2.meilleurScore,
                soloScore: classements[joueur2.pseudo]?.soloScore || 0
            };

            sauvegarderDonnees();

            // 🎯 Notifs de fin de duel fun
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

            console.log(`🏆 ${joueur1.pseudo}(${joueur1.victoires}V) vs ${joueur2.pseudo}(${joueur2.victoires}V)`);
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
                soloScore: stats.soloScore || 0,
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
                result.push({
                    id,
                    pseudo: data.pseudo,
                    niveau: data.niveau,
                    score: data.score,
                    victoires: stats.victoires || 0,
                    defaites: stats.defaites || 0,
                    parties: stats.parties || 0
                });
            }
        }
        return result;
    }

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

    socket.on('reconnecter', (data) => {
        const { pseudo } = data;
        if (pseudo) {
            for (const [id, j] of Object.entries(joueurs)) {
                if (j.pseudo === pseudo) {
                    joueurs[id].enLigne = false;
                    delete joueurs[id];
                }
            }
            socket.emit('enregistrer', {
                pseudo,
                niveau: joueurs[socket.id]?.niveau || 1,
                score: joueurs[socket.id]?.score || 0
            });
        }
    });
});

// ========================================
// 🚀 DÉMARRER
// ========================================
const PORT = process.env.PORT || 3000;

chargerDonnees().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Serveur sur ${PORT}`);
        console.log(`📊 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push chargés`);
        console.log(`📅 Meta: 10h=${meta.derniereNotif10h || 'jamais'}, 16h=${meta.derniereNotif16h || 'jamais'}`);
        console.log(`🔔 VAPID configuré: ${VAPID_PUBLIC.substring(0, 20)}...`);
        console.log(`🕐 Heure actuelle Abidjan: ${JSON.stringify(getHeureAbidjan())}`);
        console.log('✅ Notifications fun déclenchées à la 1ère connexion après 10h/16h');
        console.log('🎯 Endpoints test : /api/test-message/matin | crush | potes | argent | vendredi | weekend | relance');
    });
});