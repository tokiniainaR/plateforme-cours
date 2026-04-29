import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import filiereService from '../services/filiereService';
import matiereService from '../services/matiereService';
import '../styles/login.css';

const Registre = () => {
  const [accountType, setAccountType] = useState(null); // null, 'student', 'instructor'
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    naissance: '',
    sexe: '',
    filiere: '',
    filiereId: '',
    matiere_id: '',
    niveau: '',
    role: '',
    telephone: '',
    email: '',
    ville: '',
    adresse: '',
    password: ''
  });
  const [filieres, setFilieres] = useState([
    { id: 'informatique', name: 'Informatique' },
    { id: 'gestion', name: 'Gestion' },
    { id: 'divers', name: 'Divers' }
  ]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [filieresData, matieresData] = await Promise.all([
          filiereService.getAllFilieres(),
          matiereService.getAvailableMatieres()
        ]);
        setFilieres(filieresData);
        setMatieres(matieresData);
      } catch (error) {
        console.error('Impossible de charger les filières ou matières :', error);
      }
    };

    loadData();
  }, []);

  const updateSteps = (step) => {
    const s1n = document.getElementById('step1-num');
    const s2n = document.getElementById('step2-num');
    const s1l = document.getElementById('step1-label');
    const s2l = document.getElementById('step2-label');
    const sep = document.getElementById('sep');
    
    if (step === 2) {
      s1n?.classList.remove('active');
      s1n?.classList.add('done');
      if (s1n) s1n.textContent = '✓';
      s2n?.classList.add('active');
      s1l?.classList.remove('active');
      s1l?.classList.add('done');
      s2l?.classList.add('active');
      sep?.classList.add('done');
    } else {
      s1n?.classList.add('active');
      s1n?.classList.remove('done');
      if (s1n) s1n.textContent = '1';
      s2n?.classList.remove('active');
      s1l?.classList.add('active');
      s1l?.classList.remove('done');
      s2l?.classList.remove('active');
      sep?.classList.remove('done');
    }
  };

  const handleChange = (e) => {
    if (e.target.id === 'filiere') {
      const selectedFiliere = filieres.find((f) => f.name === e.target.value);
      setFormData({
        ...formData,
        filiere: e.target.value,
        filiereId: selectedFiliere ? selectedFiliere.id : '',
        matiere_id: ''
      });
      return;
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const selectAccountType = (type) => {
    setAccountType(type);
    setFormData(prev => ({ ...prev, role: type }));
    setCurrentStep(1);
    setTimeout(() => updateSteps(1), 0);
  };

  const nextStep = () => {
    const { nom, prenom, naissance, sexe, filiere, niveau, matiere_id } = formData;
    if (!nom || !prenom || !naissance || !sexe || !filiere || (accountType === 'student' && !niveau)) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (accountType === 'instructor' && !matiere_id) {
      alert('Veuillez sélectionner une matière pour votre profil de formateur.');
      return;
    }

    setCurrentStep(2);
    setTimeout(() => updateSteps(2), 0);
  };

  const prevStep = () => {
    setCurrentStep(1);
    setTimeout(() => updateSteps(1), 0);
  };

  const handleRegister = async () => {
    const { telephone, email, ville, adresse, password, nom, prenom, filiere, filiereId, matiere_id, niveau, role, naissance } = formData;
    if (!telephone || !email || !ville || !adresse || !password || !nom || !prenom || !role) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const userData = { 
        nom, 
        prenom, 
        naissance, 
        role, 
        filiere, 
        filiere_id: filiereId || undefined,
        matiere_id: matiere_id || undefined,
        niveau: role === 'instructor' ? undefined : niveau,
        telephone, 
        email, 
        ville, 
        adresse, 
        password
      };
      console.log('Register payload:', userData);
      const response = await authService.register(userData);
      const existingSession = localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('authToken');
      const currentRole = localStorage.getItem('userRole');

      if (!existingSession) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', response.user.role);
      }

      alert('Inscription réussie ! Bienvenue sur Platetude.');
      const navigateRole = existingSession ? currentRole : response.user.role;
      switch (navigateRole) {
        case 'admin':
          navigate('/admin-accueil');
          break;
        case 'instructor':
          navigate('/prof-profil');
          break;
        case 'student':
        default:
          navigate('/profil');
          break;
      }
    } catch (error) {
      alert(error.message || 'Impossible de s\'inscrire.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2d90b4f6 0%, #000000 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="container-register-container">
        {/* Écran de sélection du type de compte */}
        {!accountType ? (
          <>
            <div className="form-header">
              <div className="logo">
                <div className="logo-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <span className="logo-text">Platetude</span>
            </div>
            <h2>Créer un compte</h2>
            <p>Sélectionnez le type de compte que vous souhaitez créer</p>

            <div style={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
              marginTop: '40px'
            }}>
              <button
                onClick={() => selectAccountType('student')}
                style={{
                  padding: '20px',
                  border: '2px solid #2d90b4',
                  borderRadius: '8px',
                  background: 'rgba(45, 144, 180, 0.1)',
                  color: 'blue',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#2d90b4';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(45, 144, 180, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div>Je suis Étudiant</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Apprendre des cours en ligne</div>
                </div>
              </button>

              <button
                onClick={() => selectAccountType('instructor')}
                style={{
                  padding: '20px',
                  border: '2px solid #2d90b4',
                  borderRadius: '8px',
                  background: 'rgba(45, 144, 180, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#2d90b4';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(45, 144, 180, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div>Je suis Formateur</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Créer et partager des cours</div>
                </div>
              </button>
            </div>

            <div className="login-link" style={{ marginTop: '30px' }}>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </div>
          </>
        ) : (
          <>
            {/* FORMULAIRE ÉTUDIANT */}
            {accountType === 'student' && (
              <>
                <div className="form-header">
                  <div className="logo">
                    <div className="logo-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <span className="logo-text">Platetude</span>
                </div>
                <h2>Créer un compte étudiant</h2>

                <div className="steps">
                  <div className="step">
                    <div className="step-num active" id="step1-num">1</div>
                    <span className="step-label active" id="step1-label">Profil</span>
                  </div>
                  <div className="step-sep" id="sep"></div>
                  <div className="step">
                    <div className="step-num" id="step2-num">2</div>
                    <span className="step-label" id="step2-label">Coordonnées</span>
                  </div>
                </div>

                <div className="form-slider" id="slider" style={{ transform: currentStep === 2 ? 'translateX(-50%)' : 'translateX(0)' }}>
                  <div className="form-step">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom</label>
                        <input type="text" id="nom" placeholder="Rakoto" value={formData.nom} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Prénom</label>
                        <input type="text" id="prenom" placeholder="Jean" value={formData.prenom} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date de naissance</label>
                      <input type="date" id="naissance" value={formData.naissance} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sexe</label>
                        <select id="sexe" value={formData.sexe} onChange={handleChange}>
                          <option value="">Sélectionner</option>
                          <option>Homme</option>
                          <option>Femme</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Filière d'intérêt</label>
                        <select id="filiere" value={formData.filiere} onChange={handleChange}>
                          <option value="">Sélectionner</option>
                          {filieres.map((filiereItem) => (
                            <option key={filiereItem.id} value={filiereItem.name}>{filiereItem.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Niveau</label>
                      <select id="niveau" value={formData.niveau} onChange={handleChange}>
                        <option value="">Sélectionner</option>
                        <option>Débutant</option>
                        <option>Intermédiaire</option>
                        <option>Avancé</option>
                      </select>
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={() => setAccountType(null)}>← Changer</button>
                      <button className="btn btn-primary" onClick={nextStep}>Suivant →</button>
                    </div>
                  </div>

                  <div className="form-step">
                    <div className="form-group">
                      <label>Numéro de téléphone</label>
                      <input type="tel" id="telephone" placeholder="+261 34 00 000 00" value={formData.telephone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Adresse email</label>
                      <input type="email" id="email" placeholder="vous@email.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ville</label>
                        <input type="text" id="ville" placeholder="Antananarivo" value={formData.ville} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Adresse</label>
                        <input type="text" id="adresse" placeholder="Rue, quartier…" value={formData.adresse} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Mot de passe</label>
                      <input type="password" id="password" placeholder="Minimum 8 caractères" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>← Retour</button>
                      <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="login-link">Déjà un compte ? <Link to="/login">Se connecter</Link></div>
              </>
            )}

            {/* FORMULAIRE FORMATEUR */}
            {accountType === 'instructor' && (
              <>
                <div className="form-header">
                  <div className="logo">
                    <div className="logo-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <span className="logo-text">Platetude</span>
                </div>
                <h2>Créer un compte formateur</h2>


                <div className="steps">
                  <div className="step">
                    <div className="step-num active" id="step1-num">1</div>
                    <span className="step-label active" id="step1-label">Infos & Spécialités</span>
                  </div>
                  <div className="step-sep" id="sep"></div>
                  <div className="step">
                    <div className="step-num" id="step2-num">2</div>
                    <span className="step-label" id="step2-label">Coordonnées</span>
                  </div>
                </div>

                <div className="form-slider" id="slider" style={{ transform: currentStep === 2 ? 'translateX(-50%)' : 'translateX(0)' }}>
                  <div className="form-step">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom</label>
                        <input type="text" id="nom" placeholder="Dupont" value={formData.nom} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Prénom</label>
                        <input type="text" id="prenom" placeholder="Alice" value={formData.prenom} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date de naissance</label>
                      <input type="date" id="naissance" value={formData.naissance} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sexe</label>
                        <select id="sexe" value={formData.sexe} onChange={handleChange}>
                          <option value="">Sélectionner</option>
                          <option>Homme</option>
                          <option>Femme</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Filière</label>
                        <select id="filiere" value={formData.filiere} onChange={handleChange}>
                          <option value="">Sélectionner</option>
                          {filieres.map((filiereItem) => (
                            <option key={filiereItem.id} value={filiereItem.name}>{filiereItem.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Choisissez votre matière</label>
                        <select
                          id="matiere_id"
                          value={formData.matiere_id}
                          onChange={handleChange}
                          disabled={!formData.filiereId}
                        >
                          <option value="">Sélectionner</option>
                          {matieres
                            .filter((matiere) => String(matiere.filiereId) === String(formData.filiereId))
                            .map((matiere) => (
                              <option key={matiere.id} value={matiere.id}>{matiere.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-note">
                      <small>Un formateur enseigne cette matière sur tous les niveaux, le niveau n'est donc pas demandé ici.</small>
                    </div>
                    

                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={() => setAccountType(null)}>← Changer</button>
                      <button className="btn btn-primary" onClick={nextStep}>Suivant →</button>
                    </div>
                  </div>

                  <div className="form-step">
                    <div className="form-group">
                      <label>Numéro de téléphone</label>
                      <input type="tel" id="telephone" placeholder="+261 34 00 000 00" value={formData.telephone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Adresse email professionnelle</label>
                      <input type="email" id="email" placeholder="vous@email.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ville</label>
                        <input type="text" id="ville" placeholder="Antananarivo" value={formData.ville} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Adresse</label>
                        <input type="text" id="adresse" placeholder="Bureau ou établissement…" value={formData.adresse} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Mot de passe</label>
                      <input type="password" id="password" placeholder="Minimum 8 caractères" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>← Retour</button>
                      <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                        {loading ? 'Inscription en cours...' : 'Devenir formateur'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="login-link">Déjà un compte ? <Link to="/login">Se connecter</Link></div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Registre;
