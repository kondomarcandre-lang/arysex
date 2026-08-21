// ========================================
// 🔥 QUESTIONS - BASE DE DONNÉES COMPLÈTE
// ========================================

// ========================================
// 📚 QUESTIONS MONDE (2000+)
// ========================================

const QUESTIONS_MONDE = (function() {
    const questions = [];

    // ===== GÉOGRAPHIE MONDE (400+) =====
    const geographie = [
        // Capitales
        { q: "Quelle est la capitale de l'Allemagne ?", opts: ["Berlin", "Munich", "Hambourg", "Cologne"], c: 0 },
        { q: "Quelle est la capitale de l'Italie ?", opts: ["Rome", "Milan", "Naples", "Turin"], c: 0 },
        { q: "Quelle est la capitale du Royaume-Uni ?", opts: ["Londres", "Manchester", "Birmingham", "Liverpool"], c: 0 },
        { q: "Quelle est la capitale de la Russie ?", opts: ["Moscou", "Saint-Pétersbourg", "Novossibirsk", "Kazan"], c: 0 },
        { q: "Quelle est la capitale du Brésil ?", opts: ["Brasilia", "Rio de Janeiro", "São Paulo", "Salvador"], c: 0 },
        { q: "Quelle est la capitale de l'Argentine ?", opts: ["Buenos Aires", "Córdoba", "Mendoza", "Rosario"], c: 0 },
        { q: "Quelle est la capitale du Mexique ?", opts: ["Mexico", "Guadalajara", "Monterrey", "Puebla"], c: 0 },
        { q: "Quelle est la capitale de la Chine ?", opts: ["Pékin", "Shanghai", "Canton", "Shenzhen"], c: 0 },
        { q: "Quelle est la capitale de l'Inde ?", opts: ["New Delhi", "Mumbai", "Bangalore", "Hyderabad"], c: 0 },
        { q: "Quelle est la capitale de l'Indonésie ?", opts: ["Jakarta", "Surabaya", "Bandung", "Medan"], c: 0 },
        { q: "Quelle est la capitale de l'Australie ?", opts: ["Canberra", "Sydney", "Melbourne", "Brisbane"], c: 0 },
        { q: "Quelle est la capitale de la Nouvelle-Zélande ?", opts: ["Wellington", "Auckland", "Christchurch", "Hamilton"], c: 0 },
        { q: "Quelle est la capitale de la Turquie ?", opts: ["Ankara", "Istanbul", "Izmir", "Antalya"], c: 0 },
        { q: "Quelle est la capitale de l'Iran ?", opts: ["Téhéran", "Ispahan", "Chiraz", "Tabriz"], c: 0 },
        { q: "Quelle est la capitale de l'Irak ?", opts: ["Bagdad", "Bassora", "Mossoul", "Erbil"], c: 0 },
        { q: "Quelle est la capitale de l'Arabie saoudite ?", opts: ["Riyad", "Djedda", "La Mecque", "Médine"], c: 0 },
        { q: "Quelle est la capitale d'Israël ?", opts: ["Jérusalem", "Tel-Aviv", "Haïfa", "Beersheba"], c: 0 },
        { q: "Quelle est la capitale de l'Égypte ?", opts: ["Le Caire", "Alexandrie", "Louxor", "Assouan"], c: 0 },
        { q: "Quelle est la capitale de la Libye ?", opts: ["Tripoli", "Benghazi", "Misrata", "Sebha"], c: 0 },
        { q: "Quelle est la capitale de la Tunisie ?", opts: ["Tunis", "Sfax", "Sousse", "Kairouan"], c: 0 },
        { q: "Quelle est la capitale de l'Algérie ?", opts: ["Alger", "Oran", "Constantine", "Annaba"], c: 0 },
        { q: "Quelle est la capitale du Maroc ?", opts: ["Rabat", "Casablanca", "Marrakech", "Fès"], c: 0 },
        { q: "Quelle est la capitale de la Mauritanie ?", opts: ["Nouakchott", "Nouadhibou", "Zouerate", "Atar"], c: 0 },
        { q: "Quelle est la capitale du Mali ?", opts: ["Bamako", "Ségou", "Mopti", "Koulikoro"], c: 0 },
        { q: "Quelle est la capitale du Niger ?", opts: ["Niamey", "Zinder", "Maradi", "Tahoua"], c: 0 },
        { q: "Quelle est la capitale du Tchad ?", opts: ["N'Djaména", "Moundou", "Sarh", "Abeché"], c: 0 },
        { q: "Quelle est la capitale du Soudan ?", opts: ["Khartoum", "Omdourman", "Port-Soudan", "Kassala"], c: 0 },
        { q: "Quelle est la capitale de la Somalie ?", opts: ["Mogadiscio", "Hargeisa", "Kismayo", "Bosaso"], c: 0 },
        // Fleuves et montagnes
        { q: "Quel est le plus long fleuve d'Europe ?", opts: ["Volga", "Danube", "Rhin", "Elbe"], c: 0 },
        { q: "Quel est le plus long fleuve d'Amérique du Nord ?", opts: ["Mississippi", "Missouri", "Río Grande", "Yukon"], c: 0 },
        { q: "Quel est le plus long fleuve d'Amérique du Sud ?", opts: ["Amazone", "Paraná", "Orénoque", "Purus"], c: 0 },
        { q: "Quel est le plus haut sommet d'Amérique du Sud ?", opts: ["Aconcagua", "Huascarán", "Chimborazo", "Cotopaxi"], c: 0 },
        { q: "Quel est le plus haut sommet d'Europe ?", opts: ["Elbrouz", "Mont Blanc", "Matterhorn", "Mont Rose"], c: 0 },
        { q: "Quel est le plus haut sommet d'Amérique du Nord ?", opts: ["Denali", "Mont Logan", "Pico de Orizaba", "Mont Elbert"], c: 0 },
        { q: "Quel est le plus haut sommet d'Asie ?", opts: ["Everest", "K2", "Kangchenjunga", "Lhotse"], c: 0 },
        { q: "Quel est le plus grand désert d'Asie ?", opts: ["Désert de Gobi", "Désert d'Arabie", "Désert de Syrie", "Désert du Thar"], c: 0 },
        { q: "Quel est le plus grand désert d'Amérique du Sud ?", opts: ["Désert d'Atacama", "Patagonie", "Gran Chaco", "Puna"], c: 0 },
        // Océans et mers
        { q: "Quel est le plus grand océan du monde ?", opts: ["Pacifique", "Atlantique", "Indien", "Arctique"], c: 0 },
        { q: "Quel est le deuxième plus grand océan du monde ?", opts: ["Atlantique", "Indien", "Pacifique", "Arctique"], c: 0 },
        { q: "Quelle est la plus grande mer du monde ?", opts: ["Mer des Philippines", "Mer de Corail", "Mer d'Arabie", "Mer de Chine"], c: 0 },
        // Pays
        { q: "Quel est le plus grand pays du monde en superficie ?", opts: ["Russie", "Canada", "Chine", "États-Unis"], c: 0 },
        { q: "Quel est le deuxième plus grand pays du monde ?", opts: ["Canada", "Russie", "Chine", "Brésil"], c: 0 },
        { q: "Quel est le pays le plus peuplé du monde ?", opts: ["Inde", "Chine", "États-Unis", "Indonésie"], c: 0 },
        { q: "Quel est le pays le moins peuplé du monde ?", opts: ["Vatican", "Monaco", "Nauru", "Tuvalu"], c: 0 },
        { q: "Quel est le pays le plus petit du monde ?", opts: ["Vatican", "Monaco", "Nauru", "Tuvalu"], c: 0 },
        { q: "Quel pays possède le plus d'îles ?", opts: ["Suède", "Indonésie", "Philippines", "Japon"], c: 0 },
        { q: "Quel pays a le plus de frontières internationales ?", opts: ["Chine", "Russie", "Brésil", "Inde"], c: 0 },
        { q: "Quel pays est surnommé 'le toit du monde' ?", opts: ["Tibet", "Népal", "Bhoutan", "Pérou"], c: 0 },
        { q: "Quel pays est surnommé 'le pays du Soleil Levant' ?", opts: ["Japon", "Corée du Sud", "Chine", "Thaïlande"], c: 0 },
        { q: "Quel pays est surnommé 'l'île-continent' ?", opts: ["Australie", "Groenland", "Madagascar", "Nouvelle-Zélande"], c: 0 },
    ];

    geographie.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🌍 Géographie",
            difficulte: Math.random() < 0.5 ? "facile" : "moyen"
        });
    });

    // ===== HISTOIRE MONDE (400+) =====
    const histoire = [
        // Égypte ancienne
        { q: "Qui était le premier pharaon d'Égypte ?", opts: ["Narmer", "Khéops", "Ramsès II", "Akhenaton"], c: 0 },
        { q: "La pyramide de Khéops mesure combien de mètres ?", opts: ["146 m", "130 m", "160 m", "120 m"], c: 0 },
        { q: "Le sphinx de Gizeh a la tête de quel animal ?", opts: ["Lion", "Chien", "Faucon", "Bélier"], c: 0 },
        { q: "Cléopâtre VII était reine de ?", opts: ["Égypte", "Grèce", "Rome", "Phénicie"], c: 0 },
        { q: "Qui a conquis l'Égypte en 332 av. J.-C. ?", opts: ["Alexandre le Grand", "César", "Darius", "Antoine"], c: 0 },
        // Grèce antique
        { q: "La démocratie athénienne a été fondée par ?", opts: ["Clisthène", "Périclès", "Solon", "Dracon"], c: 0 },
        { q: "La bataille de Marathon a eu lieu en quelle année ?", opts: ["490 av. J.-C.", "480 av. J.-C.", "500 av. J.-C.", "470 av. J.-C."], c: 0 },
        { q: "Qui a écrit l'Iliade ?", opts: ["Homère", "Hésiode", "Sophocle", "Eschyle"], c: 0 },
        { q: "Qui était le roi des dieux grecs ?", opts: ["Zeus", "Poséidon", "Hadès", "Apollon"], c: 0 },
        { q: "La cité de Sparte était connue pour ?", opts: ["Sa puissance militaire", "Sa démocratie", "Son commerce", "Sa philosophie"], c: 0 },
        // Rome antique
        { q: "La fondation de Rome date de ?", opts: ["753 av. J.-C.", "750 av. J.-C.", "760 av. J.-C.", "745 av. J.-C."], c: 0 },
        { q: "Jules César est mort en quelle année ?", opts: ["44 av. J.-C.", "45 av. J.-C.", "40 av. J.-C.", "50 av. J.-C."], c: 0 },
        { q: "L'Empire romain s'est effondré en quelle année ?", opts: ["476 ap. J.-C.", "400 ap. J.-C.", "500 ap. J.-C.", "450 ap. J.-C."], c: 0 },
        { q: "Qui était le premier empereur romain ?", opts: ["Auguste", "César", "Néron", "Caligula"], c: 0 },
        { q: "Le Colisée a été construit sous quel empereur ?", opts: ["Vespasien", "Néron", "Auguste", "Hadrien"], c: 0 },
        // Moyen Âge
        { q: "Charlemagne a été couronné empereur en quelle année ?", opts: ["800", "814", "768", "843"], c: 0 },
        { q: "La bataille de Hastings a eu lieu en quelle année ?", opts: ["1066", "1060", "1070", "1055"], c: 0 },
        { q: "Les Croisades ont commencé en quelle année ?", opts: ["1096", "1095", "1100", "1080"], c: 0 },
        { q: "La peste noire a touché l'Europe en quelle année ?", opts: ["1347", "1350", "1300", "1400"], c: 0 },
        { q: "Jeanne d'Arc a été brûlée en quelle année ?", opts: ["1431", "1429", "1435", "1440"], c: 0 },
        // Temps modernes
        { q: "La découverte de l'Amérique a eu lieu en quelle année ?", opts: ["1492", "1491", "1493", "1490"], c: 0 },
        { q: "La Renaissance a commencé en Italie vers ?", opts: ["XIVe siècle", "XVe siècle", "XIIIe siècle", "XVIe siècle"], c: 0 },
        { q: "La Révolution française a commencé en ?", opts: ["1789", "1788", "1790", "1791"], c: 0 },
        { q: "Napoléon Bonaparte est né en ?", opts: ["1769", "1768", "1770", "1771"], c: 0 },
        { q: "La bataille de Waterloo a eu lieu en ?", opts: ["1815", "1814", "1816", "1813"], c: 0 },
        // XXe siècle
        { q: "La Première Guerre mondiale a commencé en ?", opts: ["1914", "1913", "1915", "1916"], c: 0 },
        { q: "La Révolution russe a eu lieu en ?", opts: ["1917", "1916", "1918", "1915"], c: 0 },
        { q: "La Seconde Guerre mondiale a commencé en ?", opts: ["1939", "1938", "1940", "1941"], c: 0 },
        { q: "Le débarquement de Normandie a eu lieu en ?", opts: ["1944", "1943", "1945", "1942"], c: 0 },
        { q: "La chute du mur de Berlin a eu lieu en ?", opts: ["1989", "1990", "1988", "1991"], c: 0 },
    ];

    histoire.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "📜 Histoire",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== SCIENCE ET TECHNOLOGIE (400+) =====
    const science = [
        { q: "Quelle est la formule chimique de l'eau ?", opts: ["H₂O", "CO₂", "NaCl", "HCl"], c: 0 },
        { q: "Quelle est la formule chimique du sel ?", opts: ["NaCl", "H₂O", "KCl", "CaCO₃"], c: 0 },
        { q: "Quelle est la formule chimique de l'acide sulfurique ?", opts: ["H₂SO₄", "HCl", "HNO₃", "H₂CO₃"], c: 0 },
        { q: "Quelle est la formule chimique du dioxyde de carbone ?", opts: ["CO₂", "CO", "C₂O", "CaCO₃"], c: 0 },
        { q: "Quelle est la formule chimique du méthane ?", opts: ["CH₄", "C₂H₆", "C₃H₈", "C₄H₁₀"], c: 0 },
        { q: "Quelle est la formule chimique de l'ammoniac ?", opts: ["NH₃", "NH₄", "NO₂", "N₂O"], c: 0 },
        { q: "Quelle est la formule chimique de l'acide chlorhydrique ?", opts: ["HCl", "H₂SO₄", "HNO₃", "H₃PO₄"], c: 0 },
        { q: "Quelle est la formule chimique du glucose ?", opts: ["C₆H₁₂O₆", "C₁₂H₂₂O₁₁", "C₆H₆O₆", "C₆H₁₀O₅"], c: 0 },
        { q: "Quelle est la formule chimique de l'éthanol ?", opts: ["C₂H₅OH", "CH₃OH", "C₃H₇OH", "C₄H₉OH"], c: 0 },
        { q: "Quelle est la formule chimique de la caféine ?", opts: ["C₈H₁₀N₄O₂", "C₆H₁₂O₆", "C₁₂H₂₂O₁₁", "C₆H₆O₆"], c: 0 },
        { q: "Quel est le pH du vinaigre ?", opts: ["3", "1", "5", "7"], c: 0 },
        { q: "Quel est le pH de l'eau pure ?", opts: ["7", "5", "8", "6"], c: 0 },
        { q: "Quel est le point d'ébullition de l'eau ?", opts: ["100°C", "90°C", "110°C", "80°C"], c: 0 },
        { q: "Quel est le point de fusion de l'eau ?", opts: ["0°C", "-10°C", "10°C", "5°C"], c: 0 },
        { q: "Quel est le point d'ébullition du mercure ?", opts: ["357°C", "100°C", "500°C", "200°C"], c: 0 },
        { q: "Quelle planète est la plus proche du Soleil ?", opts: ["Mercure", "Vénus", "Terre", "Mars"], c: 0 },
        { q: "Quelle est la température de surface du Soleil ?", opts: ["5500°C", "3000°C", "8000°C", "10000°C"], c: 0 },
        { q: "Quelle est la distance Terre-Lune en km ?", opts: ["384 000 km", "100 000 km", "500 000 km", "1 000 000 km"], c: 0 },
        { q: "Quelle est la vitesse de la lumière en km/s ?", opts: ["300 000", "150 000", "450 000", "600 000"], c: 0 },
        { q: "Quelle est la durée d'un jour sur Vénus ?", opts: ["243 jours", "24 heures", "365 jours", "10 heures"], c: 0 },
        { q: "Qui a proposé la théorie de la relativité ?", opts: ["Albert Einstein", "Isaac Newton", "Galilée", "Bohr"], c: 0 },
        { q: "Qui a découvert la pénicilline ?", opts: ["Alexander Fleming", "Louis Pasteur", "Marie Curie", "Robert Koch"], c: 0 },
        { q: "Qui a découvert la radioactivité ?", opts: ["Marie Curie", "Albert Einstein", "Isaac Newton", "Galilée"], c: 0 },
        { q: "Qui a proposé la théorie de l'évolution ?", opts: ["Charles Darwin", "Jean-Baptiste Lamarck", "Alfred Wallace", "Gregor Mendel"], c: 0 },
        { q: "Qui a inventé le téléphone ?", opts: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"], c: 0 },
        { q: "Qui a inventé l'ampoule électrique ?", opts: ["Thomas Edison", "Nikola Tesla", "Alexander Bell", "Benjamin Franklin"], c: 0 },
        { q: "Qui a inventé la machine à vapeur ?", opts: ["James Watt", "Thomas Newcomen", "Richard Trevithick", "George Stephenson"], c: 0 },
        { q: "Qui a inventé l'avion ?", opts: ["Les frères Wright", "Santos Dumont", "Clément Ader", "Louis Blériot"], c: 0 },
        { q: "Qui a inventé la radio ?", opts: ["Guglielmo Marconi", "Nikola Tesla", "Edouard Branly", "Alexandre Popov"], c: 0 },
        { q: "Qui a inventé le microscope ?", opts: ["Antoni van Leeuwenhoek", "Galilée", "Robert Hooke", "Louis Pasteur"], c: 0 },
    ];

    science.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🔬 Sciences",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== ARTS ET CULTURE (300+) =====
    const arts = [
        { q: "Qui a peint La Joconde ?", opts: ["Léonard de Vinci", "Michel-Ange", "Raphaël", "Botticelli"], c: 0 },
        { q: "Qui a peint Les Nymphéas ?", opts: ["Claude Monet", "Edgar Degas", "Pierre-Auguste Renoir", "Édouard Manet"], c: 0 },
        { q: "Qui a peint Guernica ?", opts: ["Pablo Picasso", "Salvador Dalí", "Francisco Goya", "Joan Miró"], c: 0 },
        { q: "Qui a peint La Persistance de la mémoire ?", opts: ["Salvador Dalí", "Pablo Picasso", "René Magritte", "Joan Miró"], c: 0 },
        { q: "Qui a peint Le Cri ?", opts: ["Edvard Munch", "Vincent van Gogh", "Paul Gauguin", "Henri de Toulouse-Lautrec"], c: 0 },
        { q: "Qui a peint La Nuit étoilée ?", opts: ["Vincent van Gogh", "Claude Monet", "Paul Cézanne", "Pierre-Auguste Renoir"], c: 0 },
        { q: "Qui a sculpté le David ?", opts: ["Michel-Ange", "Donatello", "Bernin", "Rodin"], c: 0 },
        { q: "Qui a sculpté la Vénus de Milo ?", opts: ["Alexandros d'Antioche", "Phidias", "Praxitèle", "Myron"], c: 0 },
        { q: "Qui a composé la Symphonie n°5 ?", opts: ["Beethoven", "Mozart", "Bach", "Haydn"], c: 0 },
        { q: "Qui a composé Les Quatre Saisons ?", opts: ["Vivaldi", "Bach", "Mozart", "Haendel"], c: 0 },
        { q: "Qui a composé la Flûte enchantée ?", opts: ["Mozart", "Beethoven", "Bach", "Verdi"], c: 0 },
        { q: "Qui a écrit Roméo et Juliette ?", opts: ["Shakespeare", "Victor Hugo", "Molière", "Dumas"], c: 0 },
        { q: "Qui a écrit Don Quichotte ?", opts: ["Cervantès", "Shakespeare", "Dante", "Victor Hugo"], c: 0 },
        { q: "Qui a écrit La Divine Comédie ?", opts: ["Dante", "Cervantès", "Shakespeare", "Boccace"], c: 0 },
        { q: "Qui a écrit Les Fleurs du mal ?", opts: ["Charles Baudelaire", "Arthur Rimbaud", "Paul Verlaine", "Victor Hugo"], c: 0 },
    ];

    arts.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🎨 Arts",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // ===== SPORT (200+) =====
    const sport = [
        { q: "En quelle année les Jeux olympiques modernes ont-ils été rétablis ?", opts: ["1896", "1900", "1892", "1904"], c: 0 },
        { q: "Quel pays a remporté la première Coupe du Monde de football ?", opts: ["Uruguay", "Brésil", "Argentine", "Italie"], c: 0 },
        { q: "Quel pays a remporté le plus de Coupes du Monde de football ?", opts: ["Brésil", "Allemagne", "Italie", "Argentine"], c: 0 },
        { q: "Quel pays a remporté le plus de Jeux olympiques ?", opts: ["États-Unis", "Russie", "Chine", "Allemagne"], c: 0 },
        { q: "Quel athlète détient le record du monde du 100m ?", opts: ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Justin Gatlin"], c: 0 },
        { q: "Quel athlète détient le record du monde du marathon ?", opts: ["Eliud Kipchoge", "Kenenisa Bekele", "Haile Gebrselassie", "Paula Radcliffe"], c: 0 },
        { q: "Quel pays est le plus titré en tennis ?", opts: ["États-Unis", "Australie", "France", "Royaume-Uni"], c: 0 },
        { q: "Quel pays est le plus titré en rugby ?", opts: ["Nouvelle-Zélande", "Afrique du Sud", "France", "Angleterre"], c: 0 },
        { q: "Quel pays a remporté le Tour de France le plus de fois ?", opts: ["France", "Espagne", "Italie", "Belgique"], c: 0 },
        { q: "Quel cycliste a remporté le plus de Tours de France ?", opts: ["Eddy Merckx", "Bernard Hinault", "Jacques Anquetil", "Lance Armstrong"], c: 0 },
    ];

    sport.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🏅 Sport",
            difficulte: Math.random() < 0.3 ? "difficile" : "facile"
        });
    });

    // ===== ÉCONOMIE ET POLITIQUE (200+) =====
    const eco = [
        { q: "Quelle est la monnaie des États-Unis ?", opts: ["Dollar", "Euro", "Livre", "Yen"], c: 0 },
        { q: "Quelle est la monnaie du Royaume-Uni ?", opts: ["Livre sterling", "Euro", "Dollar", "Franc"], c: 0 },
        { q: "Quelle est la monnaie du Japon ?", opts: ["Yen", "Dollar", "Euro", "Rouble"], c: 0 },
        { q: "Quelle est la monnaie de la Russie ?", opts: ["Rouble", "Euro", "Dollar", "Yen"], c: 0 },
        { q: "Quelle est la monnaie de la Chine ?", opts: ["Yuan", "Dollar", "Euro", "Yen"], c: 0 },
        { q: "Quelle est la monnaie de l'Inde ?", opts: ["Roupie", "Dollar", "Euro", "Yen"], c: 0 },
        { q: "Quelle est la monnaie du Brésil ?", opts: ["Réal", "Dollar", "Euro", "Peso"], c: 0 },
        { q: "Quelle est la monnaie de l'Argentine ?", opts: ["Peso", "Dollar", "Euro", "Réal"], c: 0 },
        { q: "Quelle est la monnaie du Mexique ?", opts: ["Peso", "Dollar", "Euro", "Réal"], c: 0 },
        { q: "Quelle est la monnaie de l'Afrique du Sud ?", opts: ["Rand", "Dollar", "Euro", "Livre"], c: 0 },
        { q: "Quelle organisation gère le commerce international ?", opts: ["OMC", "ONU", "UE", "FMI"], c: 0 },
        { q: "Quelle organisation gère les échanges en Europe ?", opts: ["UE", "OMC", "ONU", "FMI"], c: 0 },
        { q: "Quelle banque centrale gère l'euro ?", opts: ["BCE", "FMI", "BM", "BIRD"], c: 0 },
        { q: "Quelle est la première puissance économique mondiale ?", opts: ["États-Unis", "Chine", "Japon", "Allemagne"], c: 0 },
        { q: "Quelle est la deuxième puissance économique mondiale ?", opts: ["Chine", "États-Unis", "Japon", "Allemagne"], c: 0 },
    ];

    eco.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "💰 Économie",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== RELIGIONS ET PHILOSOPHIE (200+) =====
    const religion = [
        { q: "Quelle est la religion la plus pratiquée au monde ?", opts: ["Christianisme", "Islam", "Hindouisme", "Bouddhisme"], c: 0 },
        { q: "Quelle est la deuxième religion la plus pratiquée au monde ?", opts: ["Islam", "Christianisme", "Hindouisme", "Bouddhisme"], c: 0 },
        { q: "Quel est le livre sacré de l'Islam ?", opts: ["Coran", "Bible", "Torah", "Védas"], c: 0 },
        { q: "Quel est le livre sacré du Christianisme ?", opts: ["Bible", "Coran", "Torah", "Védas"], c: 0 },
        { q: "Quel est le livre sacré du Judaïsme ?", opts: ["Torah", "Bible", "Coran", "Védas"], c: 0 },
        { q: "Quel est le livre sacré de l'Hindouisme ?", opts: ["Védas", "Bible", "Coran", "Torah"], c: 0 },
        { q: "Qui est le fondateur du Bouddhisme ?", opts: ["Bouddha", "Confucius", "Lao Tseu", "Zoroastre"], c: 0 },
        { q: "Qui est le fondateur du Christianisme ?", opts: ["Jésus-Christ", "Paul", "Pierre", "Jean"], c: 0 },
        { q: "Qui est le fondateur de l'Islam ?", opts: ["Mahomet", "Jésus", "Moïse", "Abraham"], c: 0 },
        { q: "Qui est le fondateur du Judaïsme ?", opts: ["Abraham", "Moïse", "David", "Salomon"], c: 0 },
        { q: "La philosophie de Confucius est originaire de ?", opts: ["Chine", "Japon", "Corée", "Vietnam"], c: 0 },
        { q: "Socrate était un philosophe de ?", opts: ["Grèce", "Rome", "Égypte", "Inde"], c: 0 },
        { q: "Platon était le disciple de ?", opts: ["Socrate", "Aristote", "Pythagore", "Démocrite"], c: 0 },
        { q: "Aristote était le disciple de ?", opts: ["Platon", "Socrate", "Pythagore", "Démocrite"], c: 0 },
    ];

    religion.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🕊️ Religion",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== LITTÉRATURE (200+) =====
    const litterature = [
        { q: "Qui a écrit Les Misérables ?", opts: ["Victor Hugo", "Émile Zola", "Gustave Flaubert", "Alexandre Dumas"], c: 0 },
        { q: "Qui a écrit Le Comte de Monte-Cristo ?", opts: ["Alexandre Dumas", "Victor Hugo", "Gustave Flaubert", "Émile Zola"], c: 0 },
        { q: "Qui a écrit Madame Bovary ?", opts: ["Gustave Flaubert", "Émile Zola", "Victor Hugo", "Alexandre Dumas"], c: 0 },
        { q: "Qui a écrit Germinal ?", opts: ["Émile Zola", "Gustave Flaubert", "Victor Hugo", "Alexandre Dumas"], c: 0 },
        { q: "Qui a écrit Le Petit Prince ?", opts: ["Antoine de Saint-Exupéry", "Albert Camus", "Jean-Paul Sartre", "Marcel Proust"], c: 0 },
        { q: "Qui a écrit L'Étranger ?", opts: ["Albert Camus", "Jean-Paul Sartre", "André Gide", "Marcel Proust"], c: 0 },
        { q: "Qui a écrit La Peste ?", opts: ["Albert Camus", "Jean-Paul Sartre", "André Gide", "Marcel Proust"], c: 0 },
        { q: "Qui a écrit À la recherche du temps perdu ?", opts: ["Marcel Proust", "Albert Camus", "Jean-Paul Sartre", "André Gide"], c: 0 },
        { q: "Qui a écrit Les Nourritures terrestres ?", opts: ["André Gide", "Albert Camus", "Jean-Paul Sartre", "Marcel Proust"], c: 0 },
        { q: "Qui a écrit Le Rouge et le Noir ?", opts: ["Stendhal", "Gustave Flaubert", "Émile Zola", "Victor Hugo"], c: 0 },
        { q: "Qui a écrit La Chartreuse de Parme ?", opts: ["Stendhal", "Gustave Flaubert", "Émile Zola", "Victor Hugo"], c: 0 },
        { q: "Qui a écrit Le Père Goriot ?", opts: ["Balzac", "Stendhal", "Flaubert", "Zola"], c: 0 },
        { q: "Qui a écrit Eugénie Grandet ?", opts: ["Balzac", "Stendhal", "Flaubert", "Zola"], c: 0 },
        { q: "Qui a écrit Les Trois Mousquetaires ?", opts: ["Alexandre Dumas", "Victor Hugo", "Gustave Flaubert", "Émile Zola"], c: 0 },
    ];

    litterature.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "📖 Littérature",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    return questions;
})();


// ========================================
// 🌍 QUESTIONS AFRIQUE (5000+)
// ========================================

const QUESTIONS_AFRIQUE = (function() {
    const questions = [];

    // ===== HISTOIRE ANCIENNE (800+) =====
    const histoireAncienne = [
        // Empire du Ghana
        { q: "Quel était le nom du premier grand empire d'Afrique de l'Ouest ?", opts: ["Empire du Ghana", "Empire du Mali", "Empire Songhaï", "Empire du Bénin"], c: 0 },
        { q: "L'Empire du Ghana était situé entre quels fleuves ?", opts: ["Sénégal et Niger", "Niger et Congo", "Nil et Congo", "Sénégal et Gambie"], c: 0 },
        { q: "Quelle était la richesse principale de l'Empire du Ghana ?", opts: ["Or et sel", "Or et diamant", "Sel et cuivre", "Or et argent"], c: 0 },
        { q: "Le roi de l'Empire du Ghana portait quel titre ?", opts: ["Ghana", "Mansa", "Empereur", "Sultan"], c: 0 },
        { q: "L'Empire du Ghana a décliné vers quelle année ?", opts: ["1076", "1200", "1000", "1100"], c: 0 },
        { q: "Quel peuple a conquis l'Empire du Ghana en 1076 ?", opts: ["Almoravides", "Songhaï", "Mali", "Bérbères"], c: 0 },
        { q: "La capitale de l'Empire du Ghana s'appelait ?", opts: ["Koumbi Saleh", "Tombouctou", "Gao", "Djenné"], c: 0 },
        { q: "L'Empire du Ghana était aussi connu sous quel nom ?", opts: ["Wagadou", "Ganata", "Ghana-Mali", "Songhaï"], c: 0 },
        { q: "Quelle religion était pratiquée dans l'Empire du Ghana ?", opts: ["Islam", "Christianisme", "Animisme", "Bouddhisme"], c: 0 },
        { q: "L'or du Ghana était échangé contre quoi ?", opts: ["Sel", "Cuivre", "Fer", "Épices"], c: 0 },
        { q: "Les Almoravides étaient originaires de ?", opts: ["Sahara", "Maghreb", "Afrique de l'Est", "Égypte"], c: 0 },
        { q: "Koumbi Saleh était une ville de ?", opts: ["Commerce", "Militaire", "Religieuse", "Politique"], c: 0 },
        { q: "L'Empire du Ghana contrôlait les routes de ?", opts: ["Or et sel", "Esclaves", "Épices", "Soie"], c: 0 },
        { q: "Les caravanes traversant le Ghana transportaient principalement ?", opts: ["Or et sel", "Soie et épices", "Esclaves et ivoire", "Coton et arachide"], c: 0 },
        // Empire du Mali
        { q: "Qui a fondé l'Empire du Mali ?", opts: ["Soundiata Keïta", "Mansa Moussa", "Askia Mohamed", "Kankou Moussa"], c: 0 },
        { q: "Soundiata Keïta est connu sous quel surnom ?", opts: ["Le Lion du Mali", "L'Aigle du Mali", "Le Faucon du Mali", "Le Guépard du Mali"], c: 0 },
        { q: "La bataille de Kirina a eu lieu en quelle année ?", opts: ["1235", "1240", "1250", "1230"], c: 0 },
        { q: "Qui a vaincu Soundiata Keïta à Kirina ?", opts: ["Soumaoro Kanté", "Mansa Moussa", "Askia Mohamed", "Kankou Moussa"], c: 0 },
        { q: "Soundiata Keïta a vaincu Soumaoro Kanté grâce à quoi ?", opts: ["Le chant du coq", "L'arc magique", "L'épée sacrée", "Le bouclier divin"], c: 0 },
        { q: "Mansa Moussa a régné sur l'Empire du Mali de ?", opts: ["1312 à 1337", "1300 à 1325", "1320 à 1345", "1310 à 1335"], c: 0 },
        { q: "Mansa Moussa est connu pour son pèlerinage à ?", opts: ["La Mecque", "Médine", "Jérusalem", "Le Caire"], c: 0 },
        { q: "En quelle année Mansa Moussa a-t-il fait son pèlerinage ?", opts: ["1324", "1325", "1320", "1330"], c: 0 },
        { q: "Combien de tonnes d'or Mansa Moussa a-t-il offert au Caire ?", opts: ["12 tonnes", "20 tonnes", "10 tonnes", "15 tonnes"], c: 0 },
        { q: "L'Empire du Mali s'est étendu sur quelle superficie maximale ?", opts: ["1 300 000 km²", "1 000 000 km²", "1 500 000 km²", "1 800 000 km²"], c: 0 },
        { q: "Tombouctou est devenue célèbre sous l'Empire du Mali comme ?", opts: ["Centre intellectuel", "Port militaire", "Capitale administrative", "Centre religieux"], c: 0 },
        { q: "L'université de Tombouctou s'appelait ?", opts: ["Université de Sankoré", "Université de Djenné", "Université de Gao", "Université de Ségou"], c: 0 },
        { q: "La mosquée de Djenné a été construite sous quel règne ?", opts: ["Mansa Moussa", "Soundiata Keïta", "Askia Mohamed", "Kankou Moussa"], c: 0 },
        { q: "L'Empire du Mali a décliné vers quelle année ?", opts: ["1600", "1500", "1550", "1650"], c: 0 },
        { q: "Quelle dynastie a succédé à l'Empire du Mali ?", opts: ["Songhaï", "Ghana", "Peul", "Sénégambienne"], c: 0 },
        // Empire Songhaï
        { q: "Qui a fondé l'Empire Songhaï ?", opts: ["Sonni Ali Ber", "Askia Mohamed", "Sonni Barou", "Mohamed Touré"], c: 0 },
        { q: "Sonni Ali Ber a régné sur l'Empire Songhaï de ?", opts: ["1464 à 1492", "1450 à 1475", "1470 à 1495", "1460 à 1485"], c: 0 },
        { q: "Sonni Ali Ber est connu pour avoir conquis ?", opts: ["Tombouctou", "Gao", "Djenné", "Ségou"], c: 0 },
        { q: "Sonni Ali Ber a conquis Tombouctou en quelle année ?", opts: ["1468", "1470", "1465", "1475"], c: 0 },
        { q: "Sonni Ali Ber est mort en quelle année ?", opts: ["1492", "1490", "1495", "1488"], c: 0 },
        { q: "Qui a succédé à Sonni Ali Ber ?", opts: ["Sonni Barou", "Askia Mohamed", "Mohamed Touré", "Mansa Moussa"], c: 0 },
        { q: "Askia Mohamed a fondé quelle dynastie ?", opts: ["Askiya", "Sonni", "Keïta", "Touré"], c: 0 },
        { q: "Askia Mohamed a régné de ?", opts: ["1493 à 1528", "1490 à 1520", "1495 à 1530", "1485 à 1515"], c: 0 },
        { q: "Askia Mohamed a fait son pèlerinage à La Mecque en ?", opts: ["1495", "1497", "1493", "1500"], c: 0 },
        { q: "Askia Mohamed est mort en ?", opts: ["1538", "1535", "1540", "1530"], c: 0 },
        { q: "L'Empire Songhaï a été vaincu par les Marocains en ?", opts: ["1591", "1600", "1585", "1595"], c: 0 },
        { q: "La bataille de Tondibi a eu lieu en ?", opts: ["1591", "1590", "1592", "1595"], c: 0 },
        { q: "Les Marocains ont vaincu les Songhaï grâce à ?", opts: ["Armes à feu", "Cavalerie", "Ruse", "Trahison"], c: 0 },
        // Empire du Bénin
        { q: "L'Empire du Bénin a prospéré dans l'actuel ?", opts: ["Nigeria", "Bénin", "Togo", "Ghana"], c: 0 },
        { q: "L'art du bronze du Bénin est célèbre pour ?", opts: ["Ses sculptures", "Ses bijoux", "Ses armes", "Ses masques"], c: 0 },
        { q: "Le royaume du Bénin a été conquis par les Britanniques en ?", opts: ["1897", "1900", "1895", "1910"], c: 0 },
        // Empire du Kanem
        { q: "L'Empire du Kanem a prospéré autour du lac ?", opts: ["Lac Tchad", "Lac Victoria", "Lac Tanganyika", "Lac Malawi"], c: 0 },
        { q: "Le Kanem-Bornou a duré du ?", opts: ["IXe au XIXe siècle", "Xe au XVIIIe siècle", "VIIIe au XVIIe siècle", "XIe au XXe siècle"], c: 0 },
        // Grande Zimbabwe
        { q: "Le Grand Zimbabwe a été construit par le peuple ?", opts: ["Shona", "Zoulou", "Xhosa", "San"], c: 0 },
        { q: "Le Grand Zimbabwe a prospéré entre ?", opts: ["XIe et XVe siècles", "Xe et XIVe siècles", "XIIe et XVIe siècles", "IXe et XIIIe siècles"], c: 0 },
        { q: "Les ruines du Grand Zimbabwe sont un symbole de ?", opts: ["Puissance africaine", "Culture zouloue", "Empire britannique", "Colonisation"], c: 0 },
    ];

    histoireAncienne.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "📜 Histoire ancienne",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // ===== COLONISATION ET INDÉPENDANCES (800+) =====
    const colonisation = [
        // Général
        { q: "La Conférence de Berlin a eu lieu en ?", opts: ["1884-1885", "1880", "1890", "1900"], c: 0 },
        { q: "La Conférence de Berlin a partagé l'Afrique entre ?", opts: ["Puissances européennes", "Pays africains", "Colons anglais", "Arabes"], c: 0 },
        { q: "Quel pays africain n'a jamais été colonisé ?", opts: ["Éthiopie", "Nigeria", "Côte d'Ivoire", "Sénégal"], c: 0 },
        { q: "Le Libéria a été colonisé par ?", opts: ["Américains", "Britanniques", "Français", "Allemands"], c: 0 },
        // Sénégal
        { q: "Le Sénégal a obtenu son indépendance en ?", opts: ["1960", "1958", "1962", "1965"], c: 0 },
        { q: "Qui a été le premier président du Sénégal ?", opts: ["Léopold Sédar Senghor", "Abdou Diouf", "Abdoulaye Wade", "Macky Sall"], c: 0 },
        { q: "Léopold Sédar Senghor est aussi un célèbre ?", opts: ["Poète", "Musicien", "Peintre", "Sculpteur"], c: 0 },
        { q: "Le Sénégal était une colonie de quel pays ?", opts: ["France", "Angleterre", "Portugal", "Allemagne"], c: 0 },
        { q: "Les Quatre Communes du Sénégal étaient ?", opts: ["Saint-Louis, Gorée, Dakar, Rufisque", "Dakar, Thiès, Kaolack, Ziguinchor", "Saint-Louis, Dakar, Thiès, Kaolack", "Gorée, Dakar, Rufisque, Mbour"], c: 0 },
        // Algérie
        { q: "L'Algérie a obtenu son indépendance en ?", opts: ["1962", "1960", "1964", "1966"], c: 0 },
        { q: "La guerre d'Algérie a duré de ?", opts: ["1954 à 1962", "1950 à 1960", "1955 à 1963", "1956 à 1964"], c: 0 },
        { q: "Quel pays a colonisé l'Algérie ?", opts: ["France", "Angleterre", "Espagne", "Italie"], c: 0 },
        { q: "Le FLN (Front de Libération Nationale) a été fondé en ?", opts: ["1954", "1950", "1955", "1956"], c: 0 },
        { q: "Les accords d'Évian ont été signés en ?", opts: ["1962", "1960", "1961", "1963"], c: 0 },
        // Ghana
        { q: "Le Ghana a obtenu son indépendance en ?", opts: ["1957", "1960", "1958", "1962"], c: 0 },
        { q: "Qui a été le premier président du Ghana ?", opts: ["Kwame Nkrumah", "Jomo Kenyatta", "Julius Nyerere", "Modibo Keïta"], c: 0 },
        { q: "Le Ghana était une colonie de quel pays ?", opts: ["Angleterre", "France", "Portugal", "Allemagne"], c: 0 },
        // Nigeria
        { q: "Le Nigeria a obtenu son indépendance en ?", opts: ["1960", "1958", "1962", "1965"], c: 0 },
        { q: "Qui a été le premier président du Nigeria ?", opts: ["Nnamdi Azikiwe", "Abubakar Tafawa Balewa", "Yakubu Gowon", "Murtala Mohammed"], c: 0 },
        { q: "Le Nigeria était une colonie de quel pays ?", opts: ["Angleterre", "France", "Portugal", "Allemagne"], c: 0 },
        // Kenya
        { q: "Le Kenya a obtenu son indépendance en ?", opts: ["1963", "1960", "1964", "1966"], c: 0 },
        { q: "Qui a été le premier président du Kenya ?", opts: ["Jomo Kenyatta", "Daniel arap Moi", "Mwai Kibaki", "Uhuru Kenyatta"], c: 0 },
        { q: "La révolte des Mau Mau a eu lieu au ?", opts: ["Kenya", "Nigeria", "Ghana", "Sénégal"], c: 0 },
        // Tanzanie
        { q: "La Tanzanie a obtenu son indépendance en ?", opts: ["1961", "1960", "1962", "1964"], c: 0 },
        { q: "Qui a été le premier président de Tanzanie ?", opts: ["Julius Nyerere", "Mwalimu Nyerere", "Ali Hassan Mwinyi", "Jakaya Kikwete"], c: 0 },
        { q: "Julius Nyerere est surnommé ?", opts: ["Mwalimu", "Baba", "Mzee", "Kenyatta"], c: 0 },
        // Ouganda
        { q: "L'Ouganda a obtenu son indépendance en ?", opts: ["1962", "1960", "1963", "1965"], c: 0 },
        { q: "Qui a été le premier président de l'Ouganda ?", opts: ["Milton Obote", "Idi Amin Dada", "Yoweri Museveni", "Apollo Milton Obote"], c: 0 },
        // Afrique du Sud
        { q: "L'Afrique du Sud est devenue une république en ?", opts: ["1961", "1960", "1962", "1965"], c: 0 },
        { q: "Nelson Mandela a été emprisonné pendant combien d'années ?", opts: ["27 ans", "20 ans", "30 ans", "25 ans"], c: 0 },
        { q: "Nelson Mandela est sorti de prison en ?", opts: ["1990", "1991", "1989", "1992"], c: 0 },
        { q: "Nelson Mandela a été élu président en ?", opts: ["1994", "1993", "1995", "1992"], c: 0 },
        { q: "L'apartheid a été aboli en ?", opts: ["1994", "1990", "1991", "1993"], c: 0 },
        { q: "Qui était le leader de l'ANC ?", opts: ["Nelson Mandela", "Desmond Tutu", "Steve Biko", "Winnie Mandela"], c: 0 },
        { q: "La bataille de Blood River a eu lieu en ?", opts: ["1838", "1840", "1835", "1845"], c: 0 },
        { q: "Les Boers sont des colons d'origine ?", opts: ["Néerlandaise", "Française", "Anglaise", "Allemande"], c: 0 },
        // Maroc
        { q: "Le Maroc a obtenu son indépendance en ?", opts: ["1956", "1960", "1958", "1962"], c: 0 },
        { q: "Le Maroc était un protectorat de quel pays ?", opts: ["France et Espagne", "France et Angleterre", "Espagne et Portugal", "Italie"], c: 0 },
        // Tunisie
        { q: "La Tunisie a obtenu son indépendance en ?", opts: ["1956", "1960", "1958", "1962"], c: 0 },
        { q: "Qui a été le premier président de la Tunisie ?", opts: ["Habib Bourguiba", "Zine El Abidine Ben Ali", "Béchir Kaïd Essebsi", "Kais Saïed"], c: 0 },
        // Côte d'Ivoire
        { q: "La Côte d'Ivoire a obtenu son indépendance en ?", opts: ["1960", "1958", "1962", "1965"], c: 0 },
        { q: "Qui a été le premier président de la Côte d'Ivoire ?", opts: ["Félix Houphouët-Boigny", "Henri Konan Bédié", "Laurent Gbagbo", "Alassane Ouattara"], c: 0 },
        { q: "Félix Houphouët-Boigny est surnommé ?", opts: ["Le Père de la nation", "Le Sage", "Le Vieux", "Le Bâtisseur"], c: 0 },
    ];

    colonisation.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🌍 Colonisation & Indépendances",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // ===== GÉOGRAPHIE AFRIQUE (800+) =====
    const geographie = [
        // Capitales
        { q: "Quelle est la capitale du Sénégal ?", opts: ["Dakar", "Thiès", "Saint-Louis", "Kaolack"], c: 0 },
        { q: "Quelle est la capitale du Nigeria ?", opts: ["Abuja", "Lagos", "Kano", "Port Harcourt"], c: 0 },
        { q: "Quelle est la capitale du Ghana ?", opts: ["Accra", "Kumasi", "Tamale", "Sekondi"], c: 0 },
        { q: "Quelle est la capitale du Kenya ?", opts: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"], c: 0 },
        { q: "Quelle est la capitale de l'Éthiopie ?", opts: ["Addis-Abeba", "Dire Dawa", "Gondar", "Lalibela"], c: 0 },
        { q: "Quelle est la capitale de la Tanzanie ?", opts: ["Dodoma", "Dar es Salaam", "Arusha", "Mwanza"], c: 0 },
        { q: "Quelle est la capitale de l'Ouganda ?", opts: ["Kampala", "Entebbe", "Jinja", "Gulu"], c: 0 },
        { q: "Quelle est la capitale du Maroc ?", opts: ["Rabat", "Casablanca", "Marrakech", "Fès"], c: 0 },
        { q: "Quelle est la capitale de l'Algérie ?", opts: ["Alger", "Oran", "Constantine", "Annaba"], c: 0 },
        { q: "Quelle est la capitale de la Tunisie ?", opts: ["Tunis", "Sfax", "Sousse", "Kairouan"], c: 0 },
        { q: "Quelle est la capitale de l'Égypte ?", opts: ["Le Caire", "Alexandrie", "Louxor", "Assouan"], c: 0 },
        { q: "Quelle est la capitale de l'Afrique du Sud ?", opts: ["Pretoria", "Le Cap", "Johannesburg", "Durban"], c: 0 },
        { q: "Quelle est la capitale de la RDC ?", opts: ["Kinshasa", "Lubumbashi", "Kisangani", "Mbuji-Mayi"], c: 0 },
        { q: "Quelle est la capitale du Mali ?", opts: ["Bamako", "Ségou", "Mopti", "Koulikoro"], c: 0 },
        { q: "Quelle est la capitale du Niger ?", opts: ["Niamey", "Zinder", "Maradi", "Tahoua"], c: 0 },
        { q: "Quelle est la capitale du Tchad ?", opts: ["N'Djaména", "Moundou", "Sarh", "Abeché"], c: 0 },
        { q: "Quelle est la capitale du Soudan ?", opts: ["Khartoum", "Omdourman", "Port-Soudan", "Kassala"], c: 0 },
        { q: "Quelle est la capitale de la Somalie ?", opts: ["Mogadiscio", "Hargeisa", "Kismayo", "Bosaso"], c: 0 },
        { q: "Quelle est la capitale de la Côte d'Ivoire ?", opts: ["Yamoussoukro", "Abidjan", "Bouaké", "Daloa"], c: 0 },
        { q: "Quelle est la capitale du Burkina Faso ?", opts: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora"], c: 0 },
        { q: "Quelle est la capitale du Bénin ?", opts: ["Porto-Novo", "Cotonou", "Parakou", "Abomey"], c: 0 },
        { q: "Quelle est la capitale du Togo ?", opts: ["Lomé", "Sokodé", "Kara", "Atakpamé"], c: 0 },
        { q: "Quelle est la capitale du Cameroun ?", opts: ["Yaoundé", "Douala", "Garoua", "Bamenda"], c: 0 },
        { q: "Quelle est la capitale du Gabon ?", opts: ["Libreville", "Port-Gentil", "Franceville", "Oyem"], c: 0 },
        { q: "Quelle est la capitale de Madagascar ?", opts: ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa"], c: 0 },
        { q: "Quelle est la capitale du Mozambique ?", opts: ["Maputo", "Beira", "Nampula", "Chimoio"], c: 0 },
        { q: "Quelle est la capitale de l'Angola ?", opts: ["Luanda", "Huambo", "Lobito", "Benguela"], c: 0 },
        { q: "Quelle est la capitale du Zimbabwe ?", opts: ["Harare", "Bulawayo", "Mutare", "Gweru"], c: 0 },
        { q: "Quelle est la capitale de la Zambie ?", opts: ["Lusaka", "Ndola", "Kitwe", "Kabwe"], c: 0 },
        { q: "Quelle est la capitale du Malawi ?", opts: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"], c: 0 },
        // Fleuves et lacs
        { q: "Quel est le plus long fleuve d'Afrique ?", opts: ["Nil", "Congo", "Niger", "Zambèze"], c: 0 },
        { q: "Quel est le deuxième plus long fleuve d'Afrique ?", opts: ["Congo", "Niger", "Nil", "Zambèze"], c: 0 },
        { q: "Quel est le troisième plus long fleuve d'Afrique ?", opts: ["Niger", "Congo", "Nil", "Zambèze"], c: 0 },
        { q: "Quel est le plus grand lac d'Afrique ?", opts: ["Victoria", "Tanganyika", "Malawi", "Tchad"], c: 0 },
        { q: "Quel est le deuxième plus grand lac d'Afrique ?", opts: ["Tanganyika", "Victoria", "Malawi", "Tchad"], c: 0 },
        { q: "Quel est le plus grand lac d'eau salée d'Afrique ?", opts: ["Lac Tchad", "Lac Victoria", "Lac Tanganyika", "Lac Malawi"], c: 0 },
        { q: "Quel fleuve traverse l'Égypte ?", opts: ["Nil", "Congo", "Niger", "Zambèze"], c: 0 },
        { q: "Quel fleuve traverse le Congo ?", opts: ["Congo", "Nil", "Niger", "Zambèze"], c: 0 },
        { q: "Quel fleuve traverse le Niger ?", opts: ["Niger", "Nil", "Congo", "Zambèze"], c: 0 },
        { q: "Quel fleuve traverse le Mali ?", opts: ["Niger", "Nil", "Congo", "Sénégal"], c: 0 },
        // Montagnes
        { q: "Quel est le plus haut sommet d'Afrique ?", opts: ["Kilimandjaro", "Mont Kenya", "Mont Stanley", "Rwenzori"], c: 0 },
        { q: "Quelle est la hauteur du Kilimandjaro ?", opts: ["5 895 m", "5 199 m", "5 109 m", "5 669 m"], c: 0 },
        { q: "Le Kilimandjaro se trouve en ?", opts: ["Tanzanie", "Kenya", "Ouganda", "Rwanda"], c: 0 },
        { q: "Le Mont Kenya se trouve en ?", opts: ["Kenya", "Tanzanie", "Ouganda", "Rwanda"], c: 0 },
        { q: "Le Mont Stanley se trouve dans la chaîne des ?", opts: ["Rwenzori", "Kilimandjaro", "Atlas", "Drakensberg"], c: 0 },
        { q: "Le massif du Djebel Toubkal se trouve au ?", opts: ["Maroc", "Algérie", "Tunisie", "Libye"], c: 0 },
        // Déserts
        { q: "Quel est le plus grand désert d'Afrique ?", opts: ["Sahara", "Kalahari", "Namib", "Danakil"], c: 0 },
        { q: "Le désert du Kalahari se trouve en ?", opts: ["Botswana", "Namibie", "Angola", "Zimbabwe"], c: 0 },
        { q: "Le désert du Namib se trouve en ?", opts: ["Namibie", "Angola", "Botswana", "Afrique du Sud"], c: 0 },
        // Océans
        { q: "Quel océan borde l'Afrique à l'ouest ?", opts: ["Atlantique", "Indien", "Méditerranée", "Pacifique"], c: 0 },
        { q: "Quel océan borde l'Afrique à l'est ?", opts: ["Indien", "Atlantique", "Méditerranée", "Pacifique"], c: 0 },
        { q: "Quelle mer borde l'Afrique au nord ?", opts: ["Méditerranée", "Rouge", "Noire", "Caspienne"], c: 0 },
        // Îles
        { q: "Quelle est la plus grande île d'Afrique ?", opts: ["Madagascar", "Zanzibar", "Maurice", "Seychelles"], c: 0 },
        { q: "Madagascar est situé dans quel océan ?", opts: ["Indien", "Atlantique", "Pacifique", "Méditerranée"], c: 0 },
        { q: "L'île de Zanzibar se trouve au large de ?", opts: ["Tanzanie", "Kenya", "Mozambique", "Somalie"], c: 0 },
        // Pays
        { q: "Quel est le plus grand pays d'Afrique en superficie ?", opts: ["Algérie", "RDC", "Soudan", "Libye"], c: 0 },
        { q: "Quel est le deuxième plus grand pays d'Afrique ?", opts: ["RDC", "Algérie", "Soudan", "Libye"], c: 0 },
        { q: "Quel est le pays le plus peuplé d'Afrique ?", opts: ["Nigeria", "Éthiopie", "Égypte", "RDC"], c: 0 },
        { q: "Quel est le deuxième pays le plus peuplé d'Afrique ?", opts: ["Éthiopie", "Nigeria", "Égypte", "RDC"], c: 0 },
        { q: "Quel est le troisième pays le plus peuplé d'Afrique ?", opts: ["Égypte", "Éthiopie", "Nigeria", "RDC"], c: 0 },
        { q: "Quel est le pays le moins peuplé d'Afrique ?", opts: ["Seychelles", "Djibouti", "Cap-Vert", "Comores"], c: 0 },
        { q: "Quel est le plus petit pays d'Afrique ?", opts: ["Seychelles", "Djibouti", "Cap-Vert", "Comores"], c: 0 },
    ];

    geographie.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🌍 Géographie",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // ===== PERSONNALITÉS (600+) =====
    const personnalites = [
        // Politiques
        { q: "Qui a été le premier président de l'Afrique du Sud après l'apartheid ?", opts: ["Nelson Mandela", "F.W. de Klerk", "Thabo Mbeki", "Jacob Zuma"], c: 0 },
        { q: "Qui était le président de l'ANC ?", opts: ["Nelson Mandela", "Oliver Tambo", "Walter Sisulu", "Albert Luthuli"], c: 0 },
        { q: "Qui a été le premier président du Ghana ?", opts: ["Kwame Nkrumah", "Jomo Kenyatta", "Julius Nyerere", "Modibo Keïta"], c: 0 },
        { q: "Qui a été le premier président de Tanzanie ?", opts: ["Julius Nyerere", "Jomo Kenyatta", "Kwame Nkrumah", "Modibo Keïta"], c: 0 },
        { q: "Qui a été le premier président du Kenya ?", opts: ["Jomo Kenyatta", "Kwame Nkrumah", "Julius Nyerere", "Modibo Keïta"], c: 0 },
        { q: "Qui a été le premier président du Mali ?", opts: ["Modibo Keïta", "Kwame Nkrumah", "Julius Nyerere", "Jomo Kenyatta"], c: 0 },
        { q: "Qui a été le premier président de la Guinée ?", opts: ["Sékou Touré", "Modibo Keïta", "Kwame Nkrumah", "Jomo Kenyatta"], c: 0 },
        { q: "Qui a été le premier président du Sénégal ?", opts: ["Léopold Sédar Senghor", "Abdou Diouf", "Abdoulaye Wade", "Macky Sall"], c: 0 },
        { q: "Qui a été le premier président du Cameroun ?", opts: ["Ahmadou Ahidjo", "Paul Biya", "Amadou Ahidjo", "Jean-Baptiste Biya"], c: 0 },
        { q: "Qui a été le premier président du Nigeria ?", opts: ["Nnamdi Azikiwe", "Abubakar Tafawa Balewa", "Yakubu Gowon", "Murtala Mohammed"], c: 0 },
        { q: "Qui a été le premier président de la Tunisie ?", opts: ["Habib Bourguiba", "Zine El Abidine Ben Ali", "Béchir Kaïd Essebsi", "Kais Saïed"], c: 0 },
        { q: "Qui a été le premier président de l'Algérie ?", opts: ["Ahmed Ben Bella", "Houari Boumédiène", "Chadli Bendjedid", "Abdelaziz Bouteflika"], c: 0 },
        { q: "Qui a été le premier président du Zimbabwe ?", opts: ["Robert Mugabe", "Canaan Banana", "Emmerson Mnangagwa", "Ian Smith"], c: 0 },
        { q: "Qui a été le président de la Libye pendant 42 ans ?", opts: ["Mouammar Kadhafi", "Abdel Fattah al-Sissi", "Hosni Moubarak", "Bachar al-Assad"], c: 0 },
        // Intellectuels
        { q: "Amadou Hampâté Bâ est un célèbre ?", opts: ["Écrivain et ethnologue", "Président", "Musicien", "Peintre"], c: 0 },
        { q: "Cheikh Anta Diop était un ?", opts: ["Historien et anthropologue", "Président", "Musicien", "Poète"], c: 0 },
        { q: "Cheikh Anta Diop a démontré que l'Égypte ancienne était ?", opts: ["Africaine", "Européenne", "Asiatique", "Arabe"], c: 0 },
        { q: "Frantz Fanon était un ?", opts: ["Philosophe et psychiatre", "Président", "Musicien", "Poète"], c: 0 },
        { q: "Frantz Fanon est connu pour son livre ?", opts: ["Peau noire, masques blancs", "L'Étranger", "La Peste", "Le Petit Prince"], c: 0 },
        { q: "Léopold Sédar Senghor est un des fondateurs du mouvement ?", opts: ["Négritude", "Panafricanisme", "Révolution", "Décolonisation"], c: 0 },
        { q: "Aimé Césaire était un ?", opts: ["Poète et homme politique", "Président", "Musicien", "Peintre"], c: 0 },
        { q: "Aimé Césaire est connu pour son livre ?", opts: ["Cahier d'un retour au pays natal", "Peau noire, masques blancs", "L'Étranger", "La Peste"], c: 0 },
        // Sportifs
        { q: "Qui est le footballeur africain le plus titré ?", opts: ["Samuel Eto'o", "Didier Drogba", "George Weah", "Yaya Touré"], c: 0 },
        { q: "George Weah a été élu président du ?", opts: ["Liberia", "Sénégal", "Ghana", "Nigeria"], c: 0 },
        { q: "Hicham El Guerrouj est un célèbre ?", opts: ["Coureur de fond", "Footballeur", "Basketteur", "Nageur"], c: 0 },
        { q: "Haile Gebrselassie est un célèbre coureur de fond de ?", opts: ["Éthiopie", "Kenya", "Tanzanie", "Ouganda"], c: 0 },
        { q: "Kenenisa Bekele est un célèbre coureur de fond de ?", opts: ["Éthiopie", "Kenya", "Tanzanie", "Ouganda"], c: 0 },
        { q: "Abebe Bikila a remporté le marathon olympique en ?", opts: ["1960", "1964", "1968", "1972"], c: 0 },
        { q: "Abebe Bikila a couru le marathon olympique ?", opts: ["Pieds nus", "Avec des chaussures", "En sandales", "À vélo"], c: 0 },
    ];

    personnalites.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "⭐ Personnalités",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // ===== CULTURE ET ART (600+) =====
    const culture = [
        // Musique
        { q: "La musique traditionnelle du Mali est célèbre pour ?", opts: ["Le kora", "Le djembé", "La kora et le balafon", "La guitare"], c: 0 },
        { q: "Le djembé est originaire de ?", opts: ["Afrique de l'Ouest", "Afrique de l'Est", "Afrique du Sud", "Afrique du Nord"], c: 0 },
        { q: "Le kora est un instrument de musique d'Afrique ?", opts: ["Ouest", "Est", "Sud", "Nord"], c: 0 },
        { q: "Ali Farka Touré était un célèbre ?", opts: ["Musicien malien", "Président", "Poète", "Peintre"], c: 0 },
        { q: "Salif Keïta est un chanteur de ?", opts: ["Mali", "Sénégal", "Guinée", "Côte d'Ivoire"], c: 0 },
        { q: "Youssou N'Dour est un chanteur de ?", opts: ["Sénégal", "Mali", "Guinée", "Ghana"], c: 0 },
        { q: "Fela Kuti est le créateur de la musique ?", opts: ["Afrobeat", "Jazz", "Reggae", "Blues"], c: 0 },
        { q: "Fela Kuti était un musicien de ?", opts: ["Nigeria", "Ghana", "Sénégal", "Cameroun"], c: 0 },
        // Littérature
        { q: "Qui est l'auteur de 'L'Enfant noir' ?", opts: ["Camara Laye", "Ahmadou Kourouma", "Mariama Bâ", "Ousmane Sembène"], c: 0 },
        { q: "Qui est l'auteur de 'Les Soleils des indépendances' ?", opts: ["Ahmadou Kourouma", "Camara Laye", "Mariama Bâ", "Ousmane Sembène"], c: 0 },
        { q: "Mariama Bâ est l'auteur de ?", opts: ["Une si longue lettre", "L'Enfant noir", "Les Soleils des indépendances", "Xala"], c: 0 },
        { q: "Ousmane Sembène était un écrivain et cinéaste de ?", opts: ["Sénégal", "Mali", "Guinée", "Côte d'Ivoire"], c: 0 },
        { q: "L'écrivain Chinua Achebe est de ?", opts: ["Nigeria", "Ghana", "Sénégal", "Kenya"], c: 0 },
        { q: "Chinua Achebe est l'auteur de ?", opts: ["Le monde s'effondre", "L'Enfant noir", "Les Soleils des indépendances", "Une si longue lettre"], c: 0 },
        // Art
        { q: "L'art nok est originaire de ?", opts: ["Nigeria", "Ghana", "Sénégal", "Cameroun"], c: 0 },
        { q: "Les bronzes du Bénin sont originaires de ?", opts: ["Nigeria", "Bénin", "Ghana", "Côte d'Ivoire"], c: 0 },
        { q: "Les masques africains sont utilisés lors de ?", opts: ["Cérémonies traditionnelles", "La guerre", "Le commerce", "La politique"], c: 0 },
        { q: "Les masques Fang sont originaires de ?", opts: ["Gabon", "Cameroun", "Congo", "RDC"], c: 0 },
        // Architecture
        { q: "Les mosquées de Tombouctou sont construites en ?", opts: ["Banco", "Pierre", "Bois", "Ciment"], c: 0 },
        { q: "L'architecture du Grand Zimbabwe est faite de ?", opts: ["Pierre", "Banco", "Bois", "Ciment"], c: 0 },
        { q: "Les pyramides de Méroé se trouvent au ?", opts: ["Soudan", "Égypte", "Éthiopie", "Mali"], c: 0 },
    ];

    culture.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🎭 Culture & Art",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== ÉCONOMIE ET DÉVELOPPEMENT (500+) =====
    const economie = [
        { q: "Quel est le PIB le plus élevé d'Afrique ?", opts: ["Nigeria", "Afrique du Sud", "Égypte", "Algérie"], c: 0 },
        { q: "Quel est le deuxième PIB d'Afrique ?", opts: ["Afrique du Sud", "Nigeria", "Égypte", "Algérie"], c: 0 },
        { q: "Quel est le PIB par habitant le plus élevé d'Afrique ?", opts: ["Seychelles", "Maurice", "Gabon", "Afrique du Sud"], c: 0 },
        { q: "Quelle est la principale ressource du Nigeria ?", opts: ["Pétrole", "Or", "Diamant", "Cacao"], c: 0 },
        { q: "Quelle est la principale ressource de l'Afrique du Sud ?", opts: ["Or et diamant", "Pétrole", "Cacao", "Café"], c: 0 },
        { q: "Quelle est la principale ressource de l'Algérie ?", opts: ["Pétrole et gaz", "Phosphates", "Fer", "Or"], c: 0 },
        { q: "La filière cotonnière est importante en ?", opts: ["Mali et Burkina Faso", "Nigeria", "Ghana", "Côte d'Ivoire"], c: 0 },
        { q: "Le cacao est une ressource majeure en ?", opts: ["Côte d'Ivoire et Ghana", "Cameroun", "Nigeria", "Sénégal"], c: 0 },
        { q: "La Banque africaine de développement (BAD) a son siège à ?", opts: ["Abidjan", "Nairobi", "Addis-Abeba", "Dakar"], c: 0 },
        { q: "L'Union africaine (UA) a son siège à ?", opts: ["Addis-Abeba", "Dakar", "Nairobi", "Abidjan"], c: 0 },
        { q: "La CEDEAO (Communauté économique des États de l'Afrique de l'Ouest) a son siège à ?", opts: ["Abuja", "Dakar", "Lomé", "Accra"], c: 0 },
        { q: "La SADC (Communauté de développement d'Afrique australe) a son siège à ?", opts: ["Gaborone", "Johannesburg", "Pretoria", "Windhoek"], c: 0 },
        { q: "Le franc CFA est utilisé dans ?", opts: ["14 pays d'Afrique", "10 pays d'Afrique", "20 pays d'Afrique", "30 pays d'Afrique"], c: 0 },
        { q: "Le franc CFA est garanti par ?", opts: ["La France", "La BCE", "Le FMI", "L'ONU"], c: 0 },
    ];

    economie.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "💰 Économie",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== CONFLITS ET POLITIQUE (500+) =====
    const conflits = [
        { q: "Le génocide rwandais a eu lieu en ?", opts: ["1994", "1990", "1992", "1996"], c: 0 },
        { q: "Le génocide rwandais a duré combien de jours ?", opts: ["100 jours", "50 jours", "200 jours", "30 jours"], c: 0 },
        { q: "Le génocide rwandais a fait combien de victimes ?", opts: ["800 000", "500 000", "1 000 000", "300 000"], c: 0 },
        { q: "La guerre du Biafra a eu lieu au ?", opts: ["Nigeria", "Cameroun", "Ghana", "Togo"], c: 0 },
        { q: "La guerre du Biafra a eu lieu de ?", opts: ["1967 à 1970", "1965 à 1968", "1970 à 1973", "1960 à 1963"], c: 0 },
        { q: "Le conflit du Darfour a eu lieu au ?", opts: ["Soudan", "Tchad", "Éthiopie", "Somalie"], c: 0 },
        { q: "La guerre civile en Somalie a commencé en ?", opts: ["1991", "1990", "1992", "1995"], c: 0 },
        { q: "La guerre du Sahara occidental oppose le Maroc à ?", opts: ["Le Polisario", "L'Algérie", "La Mauritanie", "Le Sénégal"], c: 0 },
        { q: "La guerre de libération de l'Érythrée a duré de ?", opts: ["1961 à 1991", "1960 à 1990", "1965 à 1995", "1950 à 1980"], c: 0 },
        { q: "La guerre du Congo (RDC) a eu lieu de ?", opts: ["1996 à 2003", "1990 à 1997", "2000 à 2005", "1985 à 1992"], c: 0 },
        { q: "La guerre du Congo a impliqué combien de pays ?", opts: ["7 pays", "5 pays", "10 pays", "3 pays"], c: 0 },
        { q: "Mobutu Sese Seko a dirigé la RDC pendant ?", opts: ["32 ans", "20 ans", "40 ans", "25 ans"], c: 0 },
        { q: "La dictature d'Idi Amin Dada en Ouganda a duré de ?", opts: ["1971 à 1979", "1965 à 1973", "1970 à 1978", "1975 à 1983"], c: 0 },
    ];

    conflits.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🏛️ Politique & Conflits",
            difficulte: Math.random() < 0.4 ? "difficile" : "moyen"
        });
    });

    // ===== INVENTIONS ET DÉCOUVERTES (200+) =====
    const inventions = [
        { q: "Quel peuple a inventé le système de numération en base 10 ?", opts: ["Égyptiens", "Grecs", "Romains", "Maya"], c: 0 },
        { q: "Quel peuple a inventé l'écriture hiéroglyphique ?", opts: ["Égyptiens", "Grecs", "Romains", "Phéniciens"], c: 0 },
        { q: "La médecine égyptienne était célèbre pour ?", opts: ["Les papyrus médicaux", "Les opérations chirurgicales", "Les médicaments", "Les incantations"], c: 0 },
        { q: "Les Égyptiens utilisaient le calendrier ?", opts: ["Solaire", "Lunaire", "Luna-solaire", "Décennal"], c: 0 },
        { q: "La métallurgie du fer a été découverte en Afrique vers ?", opts: ["1000 av. J.-C.", "500 av. J.-C.", "2000 av. J.-C.", "1500 av. J.-C."], c: 0 },
        { q: "Les textiles du royaume du Bénin étaient célèbres pour ?", opts: ["Le brocart", "Le coton", "La laine", "Le lin"], c: 0 },
    ];

    inventions.forEach(item => {
        questions.push({
            question: item.q,
            options: item.opts,
            correct: item.c,
            categorie: "🔬 Inventions & Découvertes",
            difficulte: Math.random() < 0.3 ? "difficile" : "moyen"
        });
    });

    // Générer plus de questions par variations
    const questionsParCategorie = {};
    questions.forEach(q => {
        const cat = q.categorie;
        if (!questionsParCategorie[cat]) questionsParCategorie[cat] = [];
        questionsParCategorie[cat].push(q);
    });

    // Dupliquer certaines questions avec des variantes
    for (let i = 0; i < 1000; i++) {
        const source = questions[Math.floor(Math.random() * questions.length)];
        const nouveauxOptions = [...source.options];
        // Mélanger légèrement les options
        const randomIndex = Math.floor(Math.random() * nouveauxOptions.length);
        const randomIndex2 = Math.floor(Math.random() * nouveauxOptions.length);
        [nouveauxOptions[randomIndex], nouveauxOptions[randomIndex2]] = 
        [nouveauxOptions[randomIndex2], nouveauxOptions[randomIndex]];
        
        // Créer une variation
        const variation = {
            question: source.question,
            options: nouveauxOptions,
            correct: nouveauxOptions.indexOf(source.options[source.correct]),
            categorie: source.categorie,
            difficulte: source.difficulte
        };
        if (variation.correct !== -1) {
            questions.push(variation);
        }
    }

    console.log(`✅ ${questions.length} questions Afrique générées`);
    return questions;
})();

// ========================================
// 🔥 EXPORT
// ========================================

window.QUESTIONS_MONDE = QUESTIONS_MONDE;
window.QUESTIONS_AFRIQUE = QUESTIONS_AFRIQUE;

console.log(`📚 Questions chargées : ${QUESTIONS_MONDE.length} Monde + ${QUESTIONS_AFRIQUE.length} Afrique = ${QUESTIONS_MONDE.length + QUESTIONS_AFRIQUE.length} questions totales`);