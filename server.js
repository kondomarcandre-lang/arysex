// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel (jsonbin.io)
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ========================================
// 📦 EN MÉMOIRE
// ========================================
const joueurs = {};
const salles = {};
const invitations = {};

// ========================================
// 💾 JSONBIN.IO (persistance gratuite)
// ========================================
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || 'TON_BIN_ID_ICI';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || 'TA_MASTER_KEY_ICI';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let classements = {};

async function chargerClassements() {
    try {
        const res = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const data = await res.json();
        const record = data.record || {};
        console.log(`📂 ${Object.keys(record).length} joueurs chargés depuis jsonbin`);
        return record;
    } catch (e) {
        console.error('❌ Erreur chargement jsonbin:', e.message);
        return {};
    }
}

async function sauvegarderClassements() {
    try {
        const res = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(classements)
        });
        if (res.ok) {
            console.log(`💾 Classements sauvegardés (${Object.keys(classements).length} joueurs)`);
        } else {
            console.error('❌ Erreur sauvegarde:', res.status);
        }
    } catch (e) {
        console.error('❌ Erreur sauvegarde jsonbin:', e.message);
    }
}

// ========================================
// 🔌 CONNEXION
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
            sauvegarderClassements();
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
            sauvegarderClassements();
            io.emit('classements', getClassements());
        }
    });

    socket.on('demander_joueurs', () => {
        socket.emit('joueurs_en_ligne', getJoueursEnLigne());
    });

    socket.on('demander_classements', () => {
        socket.emit('classements', getClassements());
    });

    // ===== INVITATION =====
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
        const { salleId, score, bonnes } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        salle.scores[socket.id] = score || 0;
        salle.reponses[socket.id] = bonnes || 0;

        const adversaireId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
        io.to(adversaireId).emit('adversaire_repondu', {
            adversaireScore: score || 0,
            adversaireBonnes: bonnes || 0
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

            // 💾 SAUVEGARDE JSONBIN
            await sauvegarderClassements();
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

chargerClassements().then(data => {
    classements = data;
    server.listen(PORT, () => {
        console.log(`🚀 Serveur sur ${PORT}`);
        console.log(`📊 ${Object.keys(classements).length} joueurs chargés`);
    });
});