// ========================================
// 💬 BANQUE DE MESSAGES - AryseX Quiz
// Ton fun, taquin, complice
// ========================================

const messages = {
    // ========================================
    // 🌅 MATIN (10h)
    // ========================================
    matin: [
        { titre: "☕ Debout là-dedans !", body: "Ton cerveau a besoin d'un échauffement. 3 questions et tu es prêt pour la journée 😎" },
        { titre: "🎯 Quiz du matin", body: "Ton crush a déjà joué ce matin… tu vas le laisser gagner ? 😏" },
        { titre: "🌞 Réveil intellectuel", body: "Prouve que ton cerveau fonctionne mieux qu'hier soir. Viens jouer !" },
        { titre: "😴 Encore au lit ?", body: "Un quiz, un café, et tu deviens imbattable. C'est maintenant !" },
        { titre: "🧠 Coup de boost", body: "5 questions pour démarrer la journée. Simple, rapide, efficace." },
        { titre: "🏆 Reprends la tête", body: "Quelqu'un t'a dépassé au classement cette nuit. Corrige ça ! 👀" },
        { titre: "🌅 Bonjour champion", body: "Ta place de numéro 1 t'attend. Viens la récupérer 💪" },
        { titre: "😏 Petit dej' + quiz ?", body: "Le combo parfait pour une journée de gagnant ☕🎯" },
        { titre: "🎓 Réveille ton QI", body: "Prouve que t'es pas juste un lève-tôt, mais un lève-tôt intelligent 😎" }
    ],

    // ========================================
    // 🌆 APRÈS-MIDI (16h)
    // ========================================
    apresMidi: [
        { titre: "🔥 Coup de chaud", body: "L'après-midi ronronne… viens mettre le feu au classement !" },
        { titre: "⚔️ Duel surprise", body: "Trouve un adversaire en ligne et montre qui gère vraiment 💪" },
        { titre: "🎯 Petit creux ?", body: "Un quiz de 2 minutes et tu repars plus affûté qu'avant." },
        { titre: "😎 Tu te la racontes ?", body: "Prouve-le en duel. Les paroles s'envolent, les scores restent." },
        { titre: "🏁 Mi-temps de la journée", body: "Fais le point : un p'tit quiz, et tu finis la journée en héros." },
        { titre: "🍵 Pause thé + quiz ?", body: "Le combo détente + compétition. Parfait non ? ☕🎯" },
        { titre: "😈 Tu vas pas me dire…", body: "…que t'as peur d'un p'tit quiz de rien du tout ? 😏" }
    ],

    // ========================================
    // 💘 SPÉCIAL CRUSH / DUEL ROMANTIQUE
    // ========================================
    crush: [
        { titre: "💘 Ta go te manque ?", body: "Fais-lui un duel. Si tu gagnes, elle te doit un resto. Si tu perds… tu paies 😏" },
        { titre: "😍 Elle t'a liké, prouve-le", body: "Défie ton crush en duel. Le perdant offre le prochain date." },
        { titre: "💌 Message subliminal", body: "Un duel, c'est plus fun qu'un 'tu fais quoi ce soir ?' Non ? 😏" },
        { titre: "🥰 Qui paie le resto ?", body: "Défie ton/ta partenaire. Le perdant paie l'addition ce week-end 🍽️" },
        { titre: "💕 Petit défi en amoureux", body: "Un duel maintenant, un date après. Deal ? 😉" },
        { titre: "😘 Tu penses à elle ?", body: "Fais-lui un duel. C'est une façon originale de dire 'je pense à toi' 💌" },
        { titre: "💞 Le grand jeu", body: "Impressionne ton crush en le battant à plate couture 😎" },
        { titre: "💓 Petit cœur qui bat ?", body: "Défie ton crush. Tu sauras vite si c'est réciproque 😏" },
        { titre: "🌹 Duel romantique", body: "Une partie, deux cœurs, un seul gagnant. Qui paye le ciné ? 🎬" },
        { titre: "💖 Ta moitié t'attend", body: "Fais-lui un signe : défie-la en duel 😘" }
    ],

    // ========================================
    // 👯 SPÉCIAL POTES / DÉFIS ENTRE AMIS
    // ========================================
    potes: [
        { titre: "👊 Défi ton gar", body: "Fais un duel avec ton pote pour voir qui paie le prochain resto 🍔" },
        { titre: "😂 Ta réputation est en jeu", body: "Ton pote se vante d'être meilleur que toi. Prouve-lui le contraire." },
        { titre: "🤜 Qui est le boss ?", body: "Un duel, un perdant, un resto payé. Simple, efficace 💸" },
        { titre: "🍕 Pari entre potes", body: "Défie ton ami. Le perdant commande les pizzas ce soir 🍕" },
        { titre: "🎮 Rivalité ancestrale", body: "T'as un compte à régler avec quelqu'un ? C'est le moment ⚔️" },
        { titre: "🏆 Qui a la plus grosse…", body: "…culture générale ? Prouve-le en duel 😏" },
        { titre: "🎯 Duel de gangs", body: "Rassemble ton équipe, défiez les autres. Que le meilleur gagne 🔥" },
        { titre: "😤 Tu vas la fermer ?", body: "Ton pote parle trop. Fais-le taire avec un duel bien senti 😏" }
    ],

    // ========================================
    // 🤑 SPÉCIAL ARGENT / FIN DE SEMAINE
    // ========================================
    argent: [
        { titre: "💸 Petit budget ce week-end ?", body: "Fais un date avec ton crush ici. C'est gratuit et ça impressionne autant 😏" },
        { titre: "🪙 Pas de sous pour sortir ?", body: "Invite ton crush à un duel. Ambiance garantie, addition en moins 😉" },
        { titre: "😅 Flemme de dépenser ?", body: "Un date virtuel version quiz, c'est original ET gratuit 💕" },
        { titre: "🎁 Surprise sans frais", body: "Défie ton/ta partenaire. Le gagnant choisit le prochain resto 😎" },
        { titre: "💳 Le compte est vide ?", body: "Pas grave ! Un duel gratuit vaut mieux qu'un date hors de prix 😏" },
        { titre: "🏦 Économise et gagne", body: "Duel ce soir, resto la semaine prochaine payé par le perdant 💰" }
    ],

    // ========================================
    // 🎉 SPÉCIAL VENDREDI / WEEK-END
    // ========================================
    vendredi: [
        { titre: "🎉 C'est vendredi !", body: "Pas de date prévu ? Fais-en un ici avec ton crush, en mode duel 😏" },
        { titre: "🎉 C'est vendredi !", body: "Tu n'as l'argent pour faire sortir ta go ? Vient date ici ! 😏" },
        { titre: "🍹 Vendredi soir", body: "Lance un duel avec ton/ta chéri(e). Le perdant paie l'apéro 🍻" },
        { titre: "💃 Ambiance week-end", body: "Un quiz, un p'tit défi au crush, et ton vendredi est réussi 😎" },
        { titre: "🎊 Enfin le week-end !", body: "Défie ton crush pour savoir qui organise le prochain date 💕" },
        { titre: "🌟 C'est vendredi bordel", body: "Oublie la semaine, place au fun. Un duel pour fêter ça ! 🎉" },
        { titre: "🎈 Sortie ou duel ?", body: "Pourquoi pas les deux ? Duel ici, sortie après 😏" }
    ],

    weekend: [
        { titre: "😎 Week-end chill", body: "Rien de prévu ? Défie ton crush en duel, ambiance garantie ✨" },
        { titre: "🎈 Samedi, jour de défi", body: "Un quiz tranquille, un duel, et tu deviens le boss du week-end 🏆" },
        { titre: "🌞 Dimanche tranquille", body: "Journée parfaite pour un p'tit duel entre amoureux 💕" },
        { titre: "☕ Réveil tranquille", body: "Un café, un quiz, et ton dimanche est parfait 🌅" },
        { titre: "🎯 Dimanche = détente", body: "Détends-toi... mais garde l'esprit affûté avec un quiz 😎" }
    ],

    // ========================================
    // 😂 RELANCE / TROLL DOUX
    // ========================================
    relance: [
        { titre: "😴 Tu dors ?", body: "Ton score au classement pleure. Viens le consoler 🥲" },
        { titre: "😴 Tu dors ?", body: "Ton score au classement pleure. Et quelqu'un défi ta go 🥲" },
        { titre: "📉 Chute au classement", body: "Quelqu'un t'a doublé. On ne va pas laisser passer ça, si ? 😤" },
        { titre: "🕵️ On t'a vu…", body: "…hier, perdre un duel. Viens te rattraper 😏" },
        { titre: "😎 Tu te la joues ?", body: "Alors prouve-le. Un duel, maintenant." },
        { titre: "🥱 Tu t'ennuies ?", body: "Un quiz, un duel, et ta journée change de couleur 🎨" },
        { titre: "🔥 Le boss t'attend", body: "Un adversaire veut ta place. Tu vas la défendre ? 💪" },
        { titre: "😏 On parie ?", body: "T'es pas cap de me battre en 10 questions. Allez, prouve-le !" },
        { titre: "👀 Petit rappel", body: "Ton compte t'attend. Et ton classement aussi 😉" }
    ]
};

// ========================================
// 🎯 SÉLECTION DYNAMIQUE SELON JOUR
// ========================================
function getMessage(type) {
    const maintenant = new Date();
    const jourSemaine = maintenant.getDay(); // 0 = dim, 5 = ven, 6 = sam

    // Pour matin / apresMidi : mélanger avec des catégories contextuelles
    if (type === 'matin' || type === 'apresMidi') {
        let pool = [...messages[type]];

        if (jourSemaine === 5) {
            // Vendredi : ajouter crush + vendredi + argent
            pool = [...pool, ...messages.vendredi, ...messages.crush, ...messages.argent];
        } else if (jourSemaine === 0 || jourSemaine === 6) {
            // Week-end : ajouter crush + weekend + potes
            pool = [...pool, ...messages.weekend, ...messages.crush, ...messages.potes];
        } else {
            // Lundi à jeudi : ajouter potes + crush + argent + relance
            pool = [...pool, ...messages.potes, ...messages.crush, ...messages.argent, ...messages.relance];
        }

        return pickRandom(pool);
    }

    // Autres types : pioche directe
    if (messages[type]) {
        return pickRandom(messages[type]);
    }

    // Fallback
    return pickRandom(messages.matin);
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = { messages, getMessage, pickRandom };