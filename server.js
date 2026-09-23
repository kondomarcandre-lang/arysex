// ========================================
// 🔥 SERVEUR - AryseX Quiz Duel
// ========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ========================================
// 📦 DONNÉES EN MÉMOIRE
// ========================================

const joueurs = {};
const salles = {};
const invitations = {};

// ========================================
// 💾 SAUVEGARDE DES CLASSEMENTS
// ========================================

const CLASSEMENT_FILE = path.join(__dirname, 'classements.json');

function chargerClassements() {
    try {
        if (fs.existsSync(CLASSEMENT_FILE)) {
            const data = fs.readFileSync(CLASSEMENT_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Erreur chargement classements:', e);
    }
    return {};
}

function sauvegarderClassements(classements) {
    try {
        fs.writeFileSync(CLASSEMENT_FILE, JSON.stringify(classements, null, 2));
    } catch (e) {
        console.error('Erreur sauvegarde classements:', e);
    }
}

let classements = chargerClassements();

// ========================================
// 🔌 CONNEXION
// ========================================

io.on('connection', (socket) => {
    console.log(`🔗 Joueur connecté: ${socket.id}`);

    // ========================================
    // 📝 ENREGISTRER UN JOUEUR
    // ========================================

    socket.on('enregistrer', (data) => {
        const { pseudo, niveau, score } = data;

        const stats = classements[pseudo] || { victoires: 0, defaites: 0, egalites: 0, parties: 0, meilleurScore: 0 };

        joueurs[socket.id] = {
            pseudo: pseudo || 'Anonyme',
            niveau: niveau || 1,
            score: score || 0,
            enLigne: true,
            enDuel: false,
            salleId: null,
            victoires: stats.victoires || 0,
            defaites: stats.defaites || 0,
            egalites: stats.egalites || 0,
            parties: stats.parties || 0,
            meilleurScore: stats.meilleurScore || 0
        };

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
        console.log(`✅ ${joueurs[socket.id].pseudo} est en ligne`);
    });

    // ========================================
    // 📊 METTRE À JOUR LE SCORE SOLO
    // ========================================

    socket.on('mettre_a_jour_score', (data) => {
        const joueur = joueurs[socket.id];
        if (!joueur) return;

        const { score } = data;

        if (!classements[joueur.pseudo]) {
            classements[joueur.pseudo] = {
                victoires: 0,
                defaites: 0,
                egalites: 0,
                parties: 0,
                meilleurScore: 0,
                soloScore: 0
            };
        }

        if (score > classements[joueur.pseudo].soloScore) {
            classements[joueur.pseudo].soloScore = score;
            sauvegarderClassements(classements);
            io.emit('classements', getClassements());
            console.log(`📊 ${joueur.pseudo} a atteint ${score} pts en solo`);
        }
    });

    // ========================================
    // 📋 LISTE DES JOUEURS EN LIGNE
    // ========================================

    socket.on('demander_joueurs', () => {
        socket.emit('joueurs_en_ligne', getJoueursEnLigne());
    });

    // ========================================
    // 📊 DEMANDER LES CLASSEMENTS
    // ========================================

    socket.on('demander_classements', () => {
        socket.emit('classements', getClassements());
    });

    // ========================================
    // 🎮 INVITATION EN DUEL (nouveau flux)
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
            adversaireId: adversaireId,
            questions: questions || [],
            timestamp: Date.now()
        };

        // Envoyer UNIQUEMENT à l'adversaire
        io.to(adversaireId).emit('invitation_duel', {
            invitationId,
            inviteurPseudo: joueur.pseudo,
            inviteurId: socket.id
        });

        console.log(`📨 Invitation: ${joueur.pseudo} → ${adversaire.pseudo}`);
    });

    // ========================================
    // ✅ RÉPONSE À UNE INVITATION
    // ========================================

    socket.on('repondre_invitation', (data) => {
        const { invitationId, accepte } = data;
        const invitation = invitations[invitationId];
        if (!invitation) return;

        const inviteur = joueurs[invitation.inviteurId];
        const adversaire = joueurs[invitation.adversaireId];
        const inviteurId = invitation.inviteurId;
        const adversaireId = invitation.adversaireId;

        delete invitations[invitationId];

        // ===== REFUS =====
        if (!accepte) {
            if (inviteur) {
                io.to(inviteurId).emit('invitation_refusee', {
                    joueur: adversaire?.pseudo || 'Adversaire'
                });
            }
            console.log(`❌ ${adversaire?.pseudo} a refusé le duel de ${inviteur?.pseudo}`);
            return;
        }

        // ===== ACCEPTATION =====
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

        // Envoyer les questions AUX DEUX joueurs
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
        console.log(`⚔️ Duel lancé: ${inviteur.pseudo} vs ${adversaire.pseudo} (${invitation.questions.length} questions)`);
    });

    // ========================================
    // 📤 RÉPONSE EN DUEL
    // ========================================

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

    // ========================================
    // 🏁 UN JOUEUR A TERMINÉ SES QUESTIONS
    // ========================================

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

    // ========================================
    // 🏁 TERMINER UN DUEL
    // ========================================

    function terminerDuel(salleId) {
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        salle.terminee = true;

        const score1 = salle.scores[salle.joueur1] || 0;
        const score2 = salle.scores[salle.joueur2] || 0;

        let gagnantId = null;
        let statut = 'egalite';

        if (score1 > score2) {
            gagnantId = salle.joueur1;
            statut = 'victoire';
        } else if (score2 > score1) {
            gagnantId = salle.joueur2;
            statut = 'victoire';
        }

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
            sauvegarderClassements(classements);
        }

        const resultats = {
            joueur1: {
                pseudo: joueur1?.pseudo || 'Joueur 1',
                score: score1,
                reponses: salle.reponses[salle.joueur1] || 0
            },
            joueur2: {
                pseudo: joueur2?.pseudo || 'Joueur 2',
                score: score2,
                reponses: salle.reponses[salle.joueur2] || 0
            },
            gagnant: gagnantId ? joueurs[gagnantId]?.pseudo : 'Égalité',
            statut: statut
        };

        io.to(salle.joueur1).emit('fin_duel', resultats);
        io.to(salle.joueur2).emit('fin_duel', resultats);

        if (joueurs[salle.joueur1]) {
            joueurs[salle.joueur1].enDuel = false;
            joueurs[salle.joueur1].salleId = null;
        }
        if (joueurs[salle.joueur2]) {
            joueurs[salle.joueur2].enDuel = false;
            joueurs[salle.joueur2].salleId = null;
        }

        setTimeout(() => {
            delete salles[salleId];
        }, 30000);

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
        console.log(`🏁 Duel terminé! Gagnant: ${resultats.gagnant}`);
    }

    // ========================================
    // 📊 RÉCUPÉRER LES CLASSEMENTS
    // ========================================

    function getClassements() {
        const result = [];
        for (const [pseudo, stats] of Object.entries(classements)) {
            const enLigne = Object.values(joueurs).some(j => j.pseudo === pseudo && j.enLigne);
            result.push({
                pseudo: pseudo,
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                soloScore: stats.soloScore || 0,
                enLigne: enLigne,
                winRate: stats.parties > 0 ? Math.round((stats.victoires / stats.parties) * 100) : 0
            });
        }
        result.sort((a, b) => {
            if (b.victoires !== a.victoires) return b.victoires - a.victoires;
            return b.winRate - a.winRate;
        });
        return result;
    }

    // ========================================
    // 👥 RÉCUPÉRER LES JOUEURS EN LIGNE
    // ========================================

    function getJoueursEnLigne() {
        const result = [];
        for (const [id, data] of Object.entries(joueurs)) {
            if (data.enLigne && !data.enDuel) {
                const stats = classements[data.pseudo] || {};
                result.push({
                    id: id,
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

    // ========================================
    // 👋 DÉCONNEXION
    // ========================================

    socket.on('disconnect', () => {
        const joueur = joueurs[socket.id];
        if (joueur) {
            console.log(`👋 ${joueur.pseudo} s'est déconnecté`);

            if (joueur.salleId && salles[joueur.salleId]) {
                terminerDuel(joueur.salleId);
            }

            delete joueurs[socket.id];
            io.emit('joueurs_en_ligne', getJoueursEnLigne());
            io.emit('classements', getClassements());
        }
    });

    // ========================================
    // 🔥 RECONNEXION
    // ========================================

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
                pseudo: pseudo,
                niveau: joueurs[socket.id]?.niveau || 1,
                score: joueurs[socket.id]?.score || 0
            });
        }
    });
});

// ========================================
// 🚀 DÉMARRER LE SERVEUR
// ========================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur AryseX Quiz lancé sur http://localhost:${PORT}`);
    console.log(`📊 ${Object.keys(classements).length} joueurs enregistrés`);
});