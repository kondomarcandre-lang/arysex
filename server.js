// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel
// jsonbin.io + web-push + notifications auto 10h/16h (Abidjan)
// VERSION CORRIGÉE : validation serveur des réponses duel
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const webpush = require('web-push');

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

        if (record && (record.classements || record.abonnementsPush)) {
            classements = record.classements || {};
            abonnementsPush = record.abonnementsPush || {};
        } else if (record && typeof record === 'object') {
            // Ancien format : le record EST le classement
            classements = record;
            abonnementsPush = {};
        } else {
            classements = {};
            abonnementsPush = {};
        }

        console.log(`📂 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push chargés`);
    } catch (e) {
        console.error('❌ Erreur chargement jsonbin:', e.message);
        classements = {};
        abonnementsPush = {};
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
                body: JSON.stringify({ classements, abonnementsPush })
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
// 🌐 ROUTES HTTP
// ========================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        abonnes: Object.keys(abonnementsPush).length,
        joueurs: Object.keys(joueurs).length,
        classements: Object.keys(classements).length,
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
    console.log('🧪 Test manuel du cron...');
    const result = await envoyerNotificationATous(
        '🎯 Test notification',
        'Ceci est un test des notifications automatiques.'
    );
    res.json({ success: true, ...result });
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
    // ⚔️ INVITATION DUEL
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

        envoyerNotification(
            adversaire.pseudo,
            `⚔️ ${joueur.pseudo} te défie !`,
            'Ouvre l\'app pour accepter le duel 🎯'
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

                envoyerNotification(
                    inviteur.pseudo,
                    '❌ Duel refusé',
                    `${adversaire?.pseudo || 'L\'adversaire'} a refusé ton invitation.`
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
            // ✅ Suivi des questions déjà répondues pour anti-triche
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
    // ✅ VALIDATION SERVEUR DES RÉPONSES DUEL (CORRIGÉ)
    // ========================================
    socket.on('reponse_duel', (data) => {
        const { salleId, indexQuestion, reponse, tempsRestant } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        // Vérifier que le joueur est bien dans cette salle
        if (socket.id !== salle.joueur1 && socket.id !== salle.joueur2) return;

        // Anti-double-réponse sur la même question
        if (!salle.dejaRepondu[socket.id]) {
            salle.dejaRepondu[socket.id] = new Set();
        }
        if (salle.dejaRepondu[socket.id].has(indexQuestion)) return;
        salle.dejaRepondu[socket.id].add(indexQuestion);

        // Récupérer la question depuis le serveur (source de vérité)
        const question = salle.questions[indexQuestion];
        if (!question) return;

        // ✅ Le serveur calcule le score (le client ne peut pas tricher)
        let scoreGagne = 0;
        const bonneReponse = (reponse === question.correct);

        if (bonneReponse) {
            // Bonus de rapidité : max +15 pts (si réponse instantanée)
            const temps = Math.max(0, Math.min(10, tempsRestant || 0));
            const bonus = Math.max(0, Math.floor(temps / 3) * 5);
            scoreGagne = 10 + bonus;
            salle.reponses[socket.id] = (salle.reponses[socket.id] || 0) + 1;
        }

        salle.scores[socket.id] = (salle.scores[socket.id] || 0) + scoreGagne;

        // Informer l'adversaire
        const adversaireId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
        io.to(adversaireId).emit('adversaire_repondu', {
            adversaireScore: salle.scores[socket.id],
            adversaireBonnes: salle.reponses[socket.id]
        });

        // ✅ Envoyer au client SA propre mise à jour (score autoritaire)
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

            if (gagnantId === salle.joueur1) {
                envoyerNotification(joueur1.pseudo, '🏆 Victoire !', `Tu as battu ${joueur2.pseudo} ${score1}-${score2} 🎉`);
                envoyerNotification(joueur2.pseudo, '💔 Défaite', `${joueur1.pseudo} t'a battu ${score2}-${score1}. Revanche ?`);
            } else if (gagnantId === salle.joueur2) {
                envoyerNotification(joueur2.pseudo, '🏆 Victoire !', `Tu as battu ${joueur1.pseudo} ${score2}-${score1} 🎉`);
                envoyerNotification(joueur1.pseudo, '💔 Défaite', `${joueur2.pseudo} t'a battu ${score1}-${score2}. Revanche ?`);
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
// ⏰ CRON : NOTIFICATIONS AUTOMATIQUES 10H & 16H
// Heure de Côte d'Ivoire (Abidjan, UTC+0)
// ========================================
function demarrerCronNotifications() {
    let derniereNotif10h = null;
    let derniereNotif16h = null;

    setInterval(async () => {
        const { heure, minute, jour } = getHeureAbidjan();

        if (heure === 10 && minute === 0 && derniereNotif10h !== jour) {
            derniereNotif10h = jour;
            console.log('⏰ [10h Abidjan] Envoi du rappel matinal...');
            await envoyerNotificationATous(
                '🎯 Quiz du matin !',
                'Bonjour ! Un nouveau quiz t\'attend. Viens jouer ! 🚀',
                '/'
            );
        }

        if (heure === 16 && minute === 0 && derniereNotif16h !== jour) {
            derniereNotif16h = jour;
            console.log('⏰ [16h Abidjan] Envoi du rappel de l\'après-midi...');
            await envoyerNotificationATous(
                '🎯 Quiz de l\'après-midi !',
                'Nouveau défi disponible. Montre qui est le meilleur ! 🔥',
                '/'
            );
        }
    }, 60000);

    console.log('⏰ Cron notifications démarré (10h + 16h heure de Côte d\'Ivoire)');
}

// ========================================
// 🚀 DÉMARRER
// ========================================
const PORT = process.env.PORT || 3000;

chargerDonnees().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Serveur sur ${PORT}`);
        console.log(`📊 ${Object.keys(classements).length} joueurs chargés`);
        console.log(`📬 ${Object.keys(abonnementsPush).length} abonnements push chargés`);
        console.log(`🔔 VAPID configuré: ${VAPID_PUBLIC.substring(0, 20)}...`);
        console.log(`🕐 Heure actuelle Abidjan: ${JSON.stringify(getHeureAbidjan())}`);

        demarrerCronNotifications();
    });
});