import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminService from '../services/adminService';
import userService from '../services/userService';
import Avatar from '../components/Avatar';
import '../styles/studentProfile.css';

const StudentProfile = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const source = searchParams.get('source');

  const [account, setAccount] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const staticAccounts = [
    {
      id: 1,
      nom: 'Toky Raharison',
      email: 'toky@email.com',
      role: 'Étudiant',
      statut: 'Actif',
      dateInscription: '2024-01-15',
      cours: ['Comptabilité Avancée', 'Marketing Digital'],
      filiere: 'Finance',
      progression: '78%',
      ssn: '123-45-6789',
      naissance: '1998-08-05',
      adresse: '12 rue de l\'École, Antananarivo',
    },
    {
      id: 2,
      nom: 'Jean Rakoto',
      email: 'jean@email.com',
      role: 'Formateur',
      statut: 'Actif',
      dateInscription: '2024-01-10',
      cours: ['Leadership et Management'],
      filiere: 'Management',
      progression: 'N/A',
      ssn: '987-65-4321',
      naissance: '1985-02-12',
      adresse: '45 avenue des Sciences, Antananarivo',
    },
    {
      id: 3,
      nom: 'Marie Dupont',
      email: 'marie@email.com',
      role: 'Étudiant',
      statut: 'Bloqué',
      dateInscription: '2024-02-01',
      cours: ['Gestion de Projet', 'Programmation Python'],
      filiere: 'Informatique',
      progression: '65%',
      ssn: '555-44-3333',
      naissance: '2000-04-21',
      adresse: '2 place des Arts, Antananarivo',
    },
  ];

  const normalizeAccount = (raw) => ({
    id: raw.id ?? raw.userId ?? raw.user_id ?? null,
    nom: raw.nom ?? raw.lastName ?? raw.name ?? '',
    prenom: raw.prenom ?? raw.firstName ?? '',
    email: raw.email ?? '',
    role: raw.role ?? raw.userRole ?? '',
    etat: raw.etat ?? raw.status ?? raw.statut ?? '',
    filiere: raw.filiere ?? raw.department ?? '',
    coursesCount: raw.coursesCount ?? 0,
    dateInscription: raw.dateInscription ?? raw.created_at ?? raw.createdAt ?? raw.signupDate ?? '',
    cours: Array.isArray(raw.cours) ? raw.cours : Array.isArray(raw.courses) ? raw.courses : [],
    progression: raw.progression ?? raw.progress ?? 'N/A',
    ssn: raw.ssn ?? raw.socialSecurity ?? raw.social ?? 'N/A',
    naissance: raw.naissance ?? raw.birthdate ?? raw.birthDate ?? '',
    adresse: raw.adresse ?? raw.address ?? '',
    photoProfil: raw.photoProfil ?? raw.avatar ?? ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setAccount(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      try {
        let fetched = null;

        if (source === 'admin') {
          const response = await adminService.getAccountById(id);
          fetched = response?.data ?? response;
        } else if (source === 'prof') {
          const response = await userService.getUserById(id);
          fetched = response?.data ?? response;
        }

        if (!fetched) {
          fetched = staticAccounts.find((acc) => String(acc.id) === String(id));
        }

        setAccount(fetched ? normalizeAccount(fetched) : null);
      } catch (error) {
        console.error('Failed to load profile for ID', id, error);
        const found = staticAccounts.find((acc) => String(acc.id) === String(id));
        setAccount(found ? normalizeAccount(found) : null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [id, source]);

  const memberSince = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });

  if (!id) {
    return (
      <div className="main-content student-profile">
        <div className="profile-error">
          <div className="error-visual">
            <div className="error-circle"></div>
          </div>
          <h2>Profil introuvable</h2>
          <p>Identifiant de profil manquant dans l&apos;URL.</p>
          <p className="error-hint">Utilisez une URL du type <code>/student-profile?id=1</code></p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="main-content student-profile">
        <div className="profile-error">
          <div className="error-visual">
            <div className="search-circle"></div>
          </div>
          <h2>Profil introuvable</h2>
          <p>Aucun compte trouvé pour l&apos;identifiant <strong>&quot;{id}&quot;</strong>.</p>
          <Link
            to={source === 'admin' ? '/admin-comptes' : '/prof-cours-detail'}
            className="btn-error-back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const isStudent = ['étudiant', 'student'].includes((account.role || '').toLowerCase());
  const isInstructor = ['formateur', 'instructor'].includes((account.role || '').toLowerCase());
  const isActif = ['actif', 'active'].includes((account.etat || '').toLowerCase());

  return (
    <div className="main-content student-profile">
      {/* Navigation */}
      <div className="profile-header">
        <div className="profile-nav">
          <Link
            to={source === 'admin' ? '/admin-comptes' : '/prof-cours-detail'}
            className="nav-back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour
          </Link>
          <span className="nav-context">
            {source === 'admin' ? 'Administration' : 'Espace formateur'}
          </span>
        </div>
        <h1 className="profile-title">Profil utilisateur</h1>
      </div>

      {/* Carte principale */}
      <div className="profile-main-card">

        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-large">
            <Avatar prenom={account.prenom} nom={account.nom} size="xlarge" />
          </div>

          <div className="profile-identity">
            <h2 className="profile-name">{account.nom}</h2>

            <div className="profile-badges">
              {/* Badge rôle */}
              <span className="badge-role">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isStudent ? (
                    <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  ) : (
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  )}
                </svg>
                {account.role}
              </span>

              {/* Badge statut */}
              <span className={`badge-status ${isActif ? 'actif' : 'bloque'}`}>
                {account.statut}
              </span>

              {/* Badge filière */}
              {account.filiere && (
                <span className="badge-filiere-hero">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  </svg>
                  {account.filiere}
                </span>
              )}
            </div>

            <p className="profile-id">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Membre depuis {memberSince(account.dateInscription)}
            </p>

            {isInstructor && (
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{account.coursesCount}</span>
                  <span className="stat-label">Cours créés</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grille d'informations */}
        <div className="profile-grid">

          {/* Informations générales */}
          <div className="profile-section fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="section-header">
              <div className="section-accent general-accent"></div>
              <div className="section-icon general-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Informations générales</h3>
            </div>
            <div className="section-content">
              <div className="info-row">
                <div className="info-label-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Email</span>
                </div>
                <span className="info-value">{account.email}</span>
              </div>

              <div className="info-row">
                <div className="info-label-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Date d&apos;inscription</span>
                </div>
                <span className="info-value">
                  {new Date(account.dateInscription).toLocaleDateString('fr-FR')}
                </span>
              </div>

            </div>
          </div>

          {/* Formation et progression */}
          <div className="profile-section fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <div className="section-accent education-accent"></div>
              <div className="section-icon education-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h3>Formation</h3>
            </div>
            <div className="section-content">
              <div className="info-row">
                <div className="info-label-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <span>Filière</span>
                </div>
                <span className="info-value">{account.filiere || 'Non renseigné'}</span>
              </div>
              {isInstructor && (
                <div className="info-row">
                  <div className="info-label-with-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    </svg>
                    <span>Matière enseignée</span>
                  </div>
                  <span className="info-value">{account.matiere || 'Non renseignée'}</span>
                </div>
              )}

              <div className="info-row">
                <div className="info-label-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  </svg>
                  <span>Cours {isStudent ? 'suivis' : 'enseignés'}</span>
                </div>
                <div className="courses-list">
                  {account.cours.map((cours, index) => (
                    <span key={index} className="course-tag">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {cours}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informations confidentielles (Admin uniquement) */}
          {source === 'admin' && (
            <div className="profile-section admin-section fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="section-header">
                <div className="section-accent admin-accent"></div>
                <div className="section-icon admin-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3>Informations confidentielles</h3>
              </div>
              <div className="section-content">
                  <div className="info-row">
                  <div className="info-label-with-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Date de naissance</span>
                  </div>
                  <span className="info-value">
                    {new Date(account.naissance).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="info-row">
                  <div className="info-label-with-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Adresse</span>
                  </div>
                  <span className="info-value">{account.adresse}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <Link
            to={source === 'admin' ? '/admin-comptes' : '/prof-cours-detail'}
            className="btn-secondary-outline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
