import { useState } from 'react';

const ModerationAdmin = () => {
  const [reports, setReports] = useState([
    { id: 1, type: 'Contenu inapproprié', auteur: 'Toky Raharison', cible: 'Commentaire', dateSignalement: '2024-02-10', statut: 'En attente' },
    { id: 2, type: 'Spam', auteur: 'Jean Rakoto', cible: 'Message privé', dateSignalement: '2024-02-09', statut: 'Résolu' },
    { id: 3, type: 'Harcèlement', auteur: 'Marie Dupont', cible: 'Forum de discussion', dateSignalement: '2024-02-08', statut: 'En attente' },
    { id: 4, type: 'Plagiat', auteur: 'Sophie Lefevre', cible: 'Devoir soumis', dateSignalement: '2024-02-07', statut: 'Résolu' }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.statut === filter);

  const handleResolve = (id) => {
    setReports(reports.map(r => r.id === id ? { ...r, statut: 'Résolu' } : r));
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <div className="main-content moderationAdmin">
      <div className="page-header">
        <h1>Modération</h1>
        <p>Consultez les signalements et gérez les contenus inappropriés.</p>
      </div>

      <div className="admin-table-header">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Tous ({reports.length})
          </button>
          <button className={`filter-btn ${filter === 'En attente' ? 'active' : ''}`} onClick={() => setFilter('En attente')}>
            En attente ({reports.filter(r => r.statut === 'En attente').length})
          </button>
          <button className={`filter-btn ${filter === 'Résolu' ? 'active' : ''}`} onClick={() => setFilter('Résolu')}>
            Résolus ({reports.filter(r => r.statut === 'Résolu').length})
          </button>
        </div>
      </div>

      <div className="admin-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Auteur du signalement</th>
              <th>Cible</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td><strong>{report.type}</strong></td>
                <td>{report.auteur}</td>
                <td>{report.cible}</td>
                <td>{report.dateSignalement}</td>
                <td><span className={`status-badge ${report.statut.toLowerCase()}`}>{report.statut}</span></td>
                <td className="table-actions">
                  {report.statut === 'En attente' && (
                    <button className="btn-xs btn-success" onClick={() => handleResolve(report.id)}>Résoudre</button>
                  )}
                  <button className="btn-xs btn-danger" onClick={() => handleDelete(report.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Version mobile avec cartes */}
        <div className="mobile-cards" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <p>Aucun signalement trouvé</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report.id} className="admin-card">
                <div className="card-header">
                  <div className="card-title">
                    <strong>{report.type}</strong>
                    <span className={`status-badge ${report.statut.toLowerCase()}`}>
                      {report.statut}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-field">
                    <span className="field-label">Auteur:</span>
                    <span className="field-value">{report.auteur}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Cible:</span>
                    <span className="field-value">{report.cible}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Date:</span>
                    <span className="field-value">{report.dateSignalement}</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  {report.statut === 'En attente' && (
                    <button className="btn-xs btn-success" onClick={() => handleResolve(report.id)}>Résoudre</button>
                  )}
                  <button className="btn-xs btn-danger" onClick={() => handleDelete(report.id)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationAdmin;
