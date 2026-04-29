import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Modification = () => {
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profil mis à jour avec succès !');
    navigate('/profil');
  };

  return (
    <div className="main-content">
      <Link to="/profil" className="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour au profil
      </Link>

      <div className="edit-card">
        <div className="edit-card-header">
          <h2>Modifier votre profil</h2>
          <p>Mettez à jour vos informations personnelles et vos préférences.</p>
        </div>

        <div className="edit-card-body">
          <form onSubmit={handleSave}>
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
                <input type="text" defaultValue="Toky Raharison" placeholder="Votre nom" />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input type="text" defaultValue="Antsiranana" placeholder="Votre ville" />
              </div>
              <div className="form-group full">
                <label>Bio</label>
                <textarea placeholder="Parlez de vous…" defaultValue="Passionné par le développement web et le design moderne."></textarea>
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
                <input type="email" defaultValue="toky@email.com" placeholder="votre@email.com" />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" placeholder="+261 34 00 000 00" />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="tel" placeholder="+261 34 00 000 00" />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input type="text" placeholder="Rue, quartier…" />
              </div>
            </div>

            <div className="form-section-title">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Sécurité
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="button-group">
              <Link to="/profil" className="btn btn-cancel">Annuler</Link>
              <button type="submit" className="btn btn-save">Enregistrer les modifications</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modification;