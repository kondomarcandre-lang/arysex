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

const joueurs = {};           // { socketId: { pseudo, niveau, score, enLigne, enDuel, salleId, victoires, defaites, egalites } }
const salles = {};            // { salleId: { joueur1, joueur2, questions, scores, reponses, indexQuestion, terminee, timer } }

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
        
        // Récupérer les stats du joueur depuis les classements
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

        // Mettre à jour la liste des joueurs en ligne
        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        io.emit('classements', getClassements());
        console.log(`✅ ${joueurs[socket.id].pseudo} est en ligne`);
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
    // 🎮 INVITATION EN DUEL
    // ========================================

    socket.on('inviter_duel', (data) => {
        const { adversaireId, questions } = data;
        const joueur = joueurs[socket.id];
        const adversaire = joueurs[adversaireId];

        if (!adversaire || !adversaire.enLigne || adversaire.enDuel) {
            socket.emit('erreur', { message: 'Adversaire indisponible' });
            return;
        }

        // Créer une salle de duel
        const salleId = `salle_${Date.now()}`;
        salles[salleId] = {
            joueur1: socket.id,
            joueur2: adversaireId,
            questions: questions || [],
            scores: { [socket.id]: 0, [adversaireId]: 0 },
            reponses: { [socket.id]: 0, [adversaireId]: 0 },
            indexQuestion: 0,
            terminee: false,
            timer: 15
        };

        // Mettre à jour les joueurs
        joueurs[socket.id].enDuel = true;
        joueurs[socket.id].salleId = salleId;
        joueurs[adversaireId].enDuel = true;
        joueurs[adversaireId].salleId = salleId;

        // Notifier les deux joueurs
        io.to(socket.id).emit('duel_debute', {
            salleId,
            adversaire: adversaire.pseudo,
            estCreateur: true
        });

        io.to(adversaireId).emit('duel_debute', {
            salleId,
            adversaire: joueur.pseudo,
            estCreateur: false
        });

        io.emit('joueurs_en_ligne', getJoueursEnLigne());
        console.log(`⚔️ Duel lancé: ${joueur.pseudo} vs ${adversaire.pseudo}`);
    });

    // ========================================
    // ✅ RÉPONSE À UNE INVITATION
    // ========================================

    socket.on('repondre_invitation', (data) => {
        const { adversaireId, accepte } = data;
        const joueur = joueurs[socket.id];
        const adversaire = joueurs[adversaireId];

        if (!adversaire || !adversaire.enLigne) return;

        if (!accepte) {
            io.to(adversaireId).emit('invitation_refusee', {
                joueur: joueur.pseudo
            });
            return;
        }

        // L'invitation est acceptée, on lance le duel
        const salleId = joueur.salleId;
        if (salleId && salles[salleId]) {
            io.to(adversaireId).emit('demarrer_duel', {
                adversaire: joueur.pseudo,
                questions: salles[salleId].questions
            });
            
            io.to(socket.id).emit('demarrer_duel', {
                adversaire: adversaire.pseudo,
                questions: salles[salleId].questions
            });
        }
    });

    // ========================================
    // 📤 ENVOYER UNE RÉPONSE EN DUEL
    // ========================================

    socket.on('reponse_duel', (data) => {
        const { salleId, indexQuestion, reponse, tempsRestant } = data;
        const salle = salles[salleId];
        if (!salle || salle.terminee) return;

        const joueur = joueurs[socket.id];
        const question = salle.questions[indexQuestion];
        if (!question) return;

        // Vérifier la réponse
        const estCorrecte = (reponse === question.correct);
        if (estCorrecte) {
            const bonusTemps = Math.max(0, Math.floor(tempsRestant / 3) * 5);
            salle.scores[socket.id] += 10 + bonusTemps;
            salle.reponses[socket.id]++;
        }

        // Envoyer le résultat au joueur
        const adversaireId = salle.joueur1 === socket.id ? salle.joueur2 : salle.joueur1;
        socket.emit('resultat_duel', {
            correct: estCorrecte,
            score: salle.scores[socket.id],
            adversaireScore: salle.scores[adversaireId] || 0
        });

        // Passer à la question suivante
        if (indexQuestion < salle.questions.length - 1) {
            // METTRE À JOUR L'INDEX DANS LA SALLE (CORRECTION ICI)
            salle.indexQuestion = indexQuestion + 1;

            setTimeout(() => {
                if (!salle.terminee) {
                    const nextIndex = salle.indexQuestion;
                    const nextQuestion = salle.questions[nextIndex];
                    io.to(salle.joueur1).emit('question_suivante', {
                        index: nextIndex,
                        question: nextQuestion
                    });
                    io.to(salle.joueur2).emit('question_suivante', {
                        index: nextIndex,
                        question: nextQuestion
                    });
                }
            }, 1000);
        } else {
            // Fin du duel
            setTimeout(() => {
                terminerDuel(salleId);
            }, 1500);
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

        // Mettre à jour les classements
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
            
            // Sauvegarder dans les classements globaux
            classements[joueur1.pseudo] = {
                victoires: joueur1.victoires,
                defaites: joueur1.defaites,
                egalites: joueur1.egalites,
                parties: joueur1.parties,
                meilleurScore: joueur1.meilleurScore
            };
            classements[joueur2.pseudo] = {
                victoires: joueur2.victoires,
                defaites: joueur2.defaites,
                egalites: joueur2.egalites,
                parties: joueur2.parties,
                meilleurScore: joueur2.meilleurScore
            };
            sauvegarderClassements(classements);
        }

        // Résultats
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

        // Envoyer les résultats aux deux joueurs
        io.to(salle.joueur1).emit('fin_duel', resultats);
        io.to(salle.joueur2).emit('fin_duel', resultats);

        // Libérer les joueurs
        if (joueurs[salle.joueur1]) {
            joueurs[salle.joueur1].enDuel = false;
            joueurs[salle.joueur1].salleId = null;
        }
        if (joueurs[salle.joueur2]) {
            joueurs[salle.joueur2].enDuel = false;
            joueurs[salle.joueur2].salleId = null;
        }

        // Supprimer la salle après 30 secondes
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
            // Vérifier si le joueur est en ligne
            const enLigne = Object.values(joueurs).some(j => j.pseudo === pseudo && j.enLigne);
            result.push({
                pseudo: pseudo,
                victoires: stats.victoires || 0,
                defaites: stats.defaites || 0,
                egalites: stats.egalites || 0,
                parties: stats.parties || 0,
                meilleurScore: stats.meilleurScore || 0,
                enLigne: enLigne,
                winRate: stats.parties > 0 ? Math.round((stats.victoires / stats.parties) * 100) : 0
            });
        }
        // Trier par victoires, puis par winRate
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
            
            // Si le joueur était en duel, terminer le duel
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
            // Chercher si le joueur existe déjà
            for (const [id, j] of Object.entries(joueurs)) {
                if (j.pseudo === pseudo) {
                    joueurs[id].enLigne = false;
                    delete joueurs[id];
                }
            }
            // Réenregistrer
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