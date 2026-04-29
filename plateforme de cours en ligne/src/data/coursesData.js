export const formateurs = {
  "jean-rakoto": { 
    id: "jean-rakoto", 
    nom: "Jean Rakoto", 
    specialite: "Gestion & Management",
    avatar: "https://i.pravatar.cc/200?u=jean-rakoto",
    bio: "Expert en gestion de projet avec plus de 10 ans d'expérience dans les secteurs public et privé. Certifié PMP et formateur agréé, il a accompagné des dizaines d'organisations dans leur transformation managériale.",
    email: "jean.rakoto@platetude.mg",
    etudiants: 450, 
    cours: 5, 
    note: 4.8, 
    experience: "10 ans",
    coursDonnes: [
      { title: "Gestion de Projet", niveau: "Intermédiaire", duree: "4h", etudiants: 150 },
      { title: "Management d'Équipe", niveau: "Avancé", duree: "3h", etudiants: 180 }
    ]
  },
  "marie-andriam": { 
    id: "marie-andriam", 
    nom: "Marie Andriam",
    specialite: "Finance & Comptabilité",
    avatar: "https://i.pravatar.cc/200?u=marie-andriam",
    bio: "Comptable certifiée avec 8 ans d'expérience en cabinet d'audit international. Formatrice passionnée, elle simplifie les concepts financiers complexes pour les rendre accessibles à tous.",
    email: "marie.andriam@platetude.mg",
    etudiants: 320, 
    cours: 4, 
    note: 4.9, 
    experience: "8 ans",
    coursDonnes: [
      { title: "Comptabilité Avancée", niveau: "Intermédiaire", duree: "3h30", etudiants: 120 },
      { title: "Finance d'Entreprise", niveau: "Avancé", duree: "4h", etudiants: 95 }
    ]
  },
  "eric-ranaivo": { 
    id: "eric-ranaivo", 
    nom: "Eric Ranaivo",
    specialite: "Marketing Digital",
    avatar: "https://i.pravatar.cc/200?u=eric-ranaivo",
    bio: "Spécialiste en marketing digital et stratégie de contenu. A accompagné plus de 50 entreprises dans leur transformation digitale avec des résultats mesurables.",
    email: "eric.ranaivo@platetude.mg",
    etudiants: 600, 
    cours: 6, 
    note: 4.7, 
    experience: "7 ans",
    coursDonnes: [
      { title: "Marketing Digital", niveau: "Débutant", duree: "2h15", etudiants: 200 },
      { title: "Stratégie Réseaux Sociaux", niveau: "Intermédiaire", duree: "3h", etudiants: 160 }
    ]
  },
  "pierre-andria": { 
    id: "pierre-andria", 
    nom: "Pierre Andriamanana",
    specialite: "Informatique & Python",
    avatar: "https://i.pravatar.cc/200?u=pierre-andria",
    bio: "Développeur full-stack passionné par l'enseignement. Spécialiste Python et IA, il rend la programmation accessible aux débutants comme aux experts.",
    email: "pierre.andria@platetude.mg",
    etudiants: 540, 
    cours: 8, 
    note: 4.6, 
    experience: "9 ans",
    coursDonnes: [
      { title: "Programmation Python", niveau: "Débutant", duree: "3h", etudiants: 180 },
      { title: "Machine Learning", niveau: "Avancé", duree: "6h", etudiants: 70 }
    ]
  },
  "sophie-rako": { 
    id: "sophie-rako", 
    nom: "Sophie Rakotondrabe",
    specialite: "UX/UI Design",
    avatar: "https://i.pravatar.cc/200?u=sophie-rako",
    bio: "Designer UX/UI primée, spécialisée dans la création d'expériences numériques centrées sur l'utilisateur. Travaille avec les meilleures startups et entreprises de Madagascar.",
    email: "sophie.rako@platetude.mg",
    etudiants: 280, 
    cours: 3, 
    note: 4.9, 
    experience: "6 ans",
    coursDonnes: [
      { title: "Design UX/UI", niveau: "Intermédiaire", duree: "5h", etudiants: 90 },
      { title: "Figma Avancé", niveau: "Avancé", duree: "4h", etudiants: 60 }
    ]
  },
  "louis-raza": { 
    id: "louis-raza", 
    nom: "Louis Razafindrabe",
    specialite: "Finance Personnelle",
    avatar: "https://i.pravatar.cc/200?u=louis-raza",
    bio: "Conseiller financier certifié, passionné par l'éducation financière. Aide les particuliers à mieux gérer leur budget, épargner et investir intelligemment.",
    email: "louis.raza@platetude.mg",
    etudiants: 390, 
    cours: 4, 
    note: 4.7, 
    experience: "5 ans",
    coursDonnes: [
      { title: "Finance Personnelle", niveau: "Débutant", duree: "2h45", etudiants: 140 },
      { title: "Investissement pour Débutants", niveau: "Débutant", duree: "2h", etudiants: 110 }
    ]
  }
};

export const allCourses = [
  { id: 1, title: "Comptabilité Avancée", filiere: "Gestion", niveau: "Intermédiaire", description: "Approfondissez vos connaissances en comptabilité générale et analytique.", duree: "3h30", videos: 12, etudiants: 120, formateurId: "marie-andriam" },
  { id: 2, title: "Marketing Digital", filiere: "Gestion", niveau: "Débutant", description: "Introduction aux techniques modernes de marketing en ligne.", duree: "2h15", videos: 8, etudiants: 200, formateurId: "eric-ranaivo" },
  { id: 3, title: "Gestion de Projet", filiere: "Gestion", niveau: "Intermédiaire", description: "Méthodes et outils pour gérer efficacement un projet professionnel.", duree: "4h", videos: 15, etudiants: 150, formateurId: "jean-rakoto" },
  { id: 4, title: "Programmation Python", filiere: "Informatique", niveau: "Débutant", description: "Les bases solides de Python pour bien démarrer en programmation.", duree: "3h", videos: 10, etudiants: 180, formateurId: "pierre-andria" },
  { id: 5, title: "Design UX/UI", filiere: "Informatique", niveau: "Intermédiaire", description: "Créer des interfaces modernes centrées sur l'expérience utilisateur.", duree: "5h", videos: 20, etudiants: 90, formateurId: "sophie-rako" },
  { id: 6, title: "Finance Personnelle", filiere: "Gestion", niveau: "Débutant", description: "Gérez intelligemment votre budget et vos investissements personnels.", duree: "2h45", videos: 7, etudiants: 140, formateurId: "louis-raza" }
];

export const userProfile = { filiere: "Gestion", niveau: "Intermédiaire" };

export const allExams = [
  {
    id: 1,
    title: "Quiz Gestion de Projet",
    cours: "Management de Projet",
    courseId: 3,
    dateLimite: "2024-12-15",
    statut: "en-cours",
    questions: 10,
    duree: "30 min",
    durationMinutes: 30,
    note: null,
    content: [
      { type: 'text', title: 'Instructions', details: 'Répondez à toutes les questions en 30 minutes. Chaque question vaut 10 points.' },
      { type: 'question', question: 'Quelle méthode permet de structurer un projet ?', options: ['Agile', 'V-Model', 'Waterfall', 'Scrum'], answer: 'Scrum' },
      { type: 'question', question: 'Quel document définit le périmètre du projet ?', options: ['Charte', 'SOW', 'Backlog', 'Plan QA'], answer: 'Charte' },
      { type: 'free', question: 'Expliquez en quelques phrases comment vous définiriez le rôle d’un chef de projet dans une équipe. (Réponse libre)' },
      { type: 'upload', question: 'Téléversez votre document de synthèse (PDF ou DOCX).', sujet: 'Sujet d’examen', sujetLink: 'LM124.PDF' },
      { type: 'resource', title: 'PDF de référence', link: 'LM124.PDF' }
    ]
  },
  {
    id: 2,
    title: "Examen Final Marketing Digital",
    cours: "Marketing Digital",
    courseId: 2,
    dateLimite: "2024-12-20",
    statut: "non-commencé",
    questions: 20,
    duree: "60 min",
    durationMinutes: 60,
    note: null,
    content: [
      { type: 'text', title: 'Instructions', details: 'Le temps imparti est de 60 minutes. Pas de ressources externes autorisées.' },
      { type: 'question', question: 'Quelle métrique mesure l’efficacité de la conversion ?', options: ['CTR', 'CPA', 'ROI', 'CPC'], answer: 'CPA' },
      { type: 'question', question: 'Quel canal a le meilleur taux d’engagement ?', options: ['Email', 'Display', 'Search', 'Social'], answer: 'Email' },
      { type: 'resource', title: 'Guide du marketing digital', link: 'TIP.PDF' }
    ]
  },
  {
    id: 3,
    title: "Test Comptabilité",
    cours: "Comptabilité Avancée",
    dateLimite: "2024-11-30",
    statut: "termine",
    questions: 15,
    duree: "45 min",
    note: 85
  }
];