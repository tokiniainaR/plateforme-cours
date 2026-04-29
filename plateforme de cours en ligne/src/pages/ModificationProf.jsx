import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ModificationProf = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    telephone: '',
    ville: '',
    adresse: '',
    filiere: '',
    niveau: '',
    dateDebutMetier: '',
    email: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const userResult = await authService.getCurrentUser();
        const currentUser = userResult?.user || userResult;

        if (currentUser) {
          setFormData({
            fullName: `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim(),
            telephone: currentUser.telephone || '',
            ville: currentUser.ville || '',
            adresse: currentUser.adresse || '',
            filiere: currentUser.filiere || '',
            niveau: currentUser.niveau || '',
            dateDebutMetier: currentUser.date_debut_metier ? currentUser.date_debut_metier.slice(0, 10) : '',
            email: currentUser.email || ''
          });
        }
      } catch (err) {
        console.error('Impossible de charger le profil :', err);
        setError(err.message || 'Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const nameParts = formData.fullName.trim().split(/\s+/);
    const prenom = nameParts.shift() || '';
    const nom = nameParts.join(' ') || prenom;

    try {
      const updatedUser = await authService.updateProfile({
        nom,
        prenom,
        telephone: formData.telephone,
        ville: formData.ville,
        adresse: formData.adresse,
        filiere: formData.filiere,
        niveau: formData.niveau,
        date_debut_metier: formData.dateDebutMetier || null
      });

      if (updatedUser) {
        const refreshed = await authService.getCurrentUser();
        const currentUser = refreshed?.user || refreshed;
        if (currentUser) {
          setFormData({
            fullName: `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim(),
            telephone: currentUser.telephone || '',
            ville: currentUser.ville || '',
            adresse: currentUser.adresse || '',
            filiere: currentUser.filiere || '',
            niveau: currentUser.niveau || '',
            dateDebutMetier: currentUser.date_debut_metier ? currentUser.date_debut_metier.slice(0, 10) : '',
            email: currentUser.email || ''
          });
        }
      }

      alert('Profil mis à jour avec succès !');
      navigate('/prof-profil');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil :', err);
      setError(err.message || 'Impossible de sauvegarder les modifications.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content profilProf">
        <div className="loading">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="main-content profilProf">
      <Link to="/prof-profil" className="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour au profil
      </Link>

      <div className="edit-card">
        <div className="edit-card-header">
          <h2>Modifier votre profil</h2>
          <p>Mettez à jour vos informations personnelles et professionnelles.</p>
        </div>

        <div className="edit-card-body">
          <form onSubmit={handleSave}>
            {error && <div className="form-error">{error}</div>}

            <div className="form-section-title">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
              </svg>
              Informations personnelles
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  placeholder="Votre ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                />
              </div>
              <div className="form-group full">
                <label>Adresse</label>
                <textarea
                  placeholder="Votre adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-section-title">
              <svg viewBox="0 0 24 24">
                <path d="M9 7h6v3H9z" />
                <path d="M12 1L3 5v14l9 4 9-4V5z" />
              </svg>
              Informations professionnelles
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Filière</label>
                <input
                  type="text"
                  placeholder="Votre filière"
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Niveau</label>
                <input
                  type="text"
                  placeholder="Votre niveau"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date de début du métier</label>
                <input
                  type="date"
                  value={formData.dateDebutMetier}
                  onChange={(e) => setFormData({ ...formData, dateDebutMetier: e.target.value })}
                />
              </div>
              <div className="form-group full">
                <label>Spécialité</label>
                <input
                  type="text"
                  placeholder="Domaine d'expertise"
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section-title">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Adresse email</label>
                <input type="email" value={formData.email} disabled />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  placeholder="+261..."
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <Link to="/prof-profil" className="btn-secondary">
                Annuler
              </Link>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModificationProf;
