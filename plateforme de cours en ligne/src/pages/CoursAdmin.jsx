import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import filiereService from '../services/filiereService';
import matiereService from '../services/matiereService';

// Composant pour ajouter une matière
const AddMatiereForm = ({ filiereId, onAdd }) => {
  const [matiereName, setMatiereName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matiereName.trim()) return;
    
    setIsAdding(true);
    try {
      await onAdd(matiereName);
      setMatiereName('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-matiere-inline">
      <input
        type="text"
        value={matiereName}
        onChange={(e) => setMatiereName(e.target.value)}
        placeholder="Nom de la nouvelle matière"
        disabled={isAdding}
      />
      <button 
        type="submit" 
        className="btn-xs btn-success"
        disabled={isAdding || !matiereName.trim()}
      >
        {isAdding ? '...' : '+'}
      </button>
    </form>
  );
};

const CoursAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État pour la gestion des filières et matières
  const [filieres, setFilieres] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [matiereFilter, setMatiereFilter] = useState('all');
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  
  // État pour la création de filières
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFiliereModal, setShowFiliereModal] = useState(false);
  const [filiereForm, setFiliereForm] = useState({
    name: '',
    matieres: [{ name: '' }]
  });
  const [creatingFiliere, setCreatingFiliere] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchFilieresAndMatieres();
    // Vérifier si l'utilisateur est admin
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'admin');
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminService.getAllCoursesAdmin();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilieresAndMatieres = async () => {
    setLoadingFilieres(true);
    try {
      const [filieresData, matieresData] = await Promise.all([
        filiereService.getAllFilieres(),
        matiereService.getAllMatieres()
      ]);
      setFilieres(filieresData);
      setMatieres(matieresData);
    } catch (error) {
      console.error('Failed to fetch filieres and matieres:', error);
    } finally {
      setLoadingFilieres(false);
    }
  };

  // Fonctions pour la gestion des filières
  const handleOpenFiliereModal = () => {
    setFiliereForm({ name: '', matieres: [{ name: '' }] });
    setShowFiliereModal(true);
  };

  const handleCloseFiliereModal = () => {
    setShowFiliereModal(false);
    setFiliereForm({ name: '', matieres: [{ name: '' }] });
  };

  const handleFiliereChange = (e) => {
    setFiliereForm({ ...filiereForm, name: e.target.value });
  };

  const handleMatiereChange = (index, value) => {
    const newMatieres = [...filiereForm.matieres];
    newMatieres[index].name = value;
    setFiliereForm({ ...filiereForm, matieres: newMatieres });
  };

  const addMatiere = () => {
    setFiliereForm({
      ...filiereForm,
      matieres: [...filiereForm.matieres, { name: '' }]
    });
  };

  const removeMatiere = (index) => {
    if (filiereForm.matieres.length > 1) {
      const newMatieres = filiereForm.matieres.filter((_, i) => i !== index);
      setFiliereForm({ ...filiereForm, matieres: newMatieres });
    }
  };

  const handleCreateFiliere = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!filiereForm.name.trim()) {
      alert('Le nom de la filière est requis.');
      return;
    }
    
    const validMatieres = filiereForm.matieres.filter(m => m.name.trim());
    if (validMatieres.length === 0) {
      alert('Au moins une matière est requise.');
      return;
    }

    setCreatingFiliere(true);
    try {
      // Créer la filière
      const filiereData = {
        name: filiereForm.name.trim(),
        matieres: validMatieres.map(m => ({ name: m.name.trim() }))
      };
      
      await filiereService.createFiliere(filiereData);
      
      alert('Filière créée avec succès !');
      handleCloseFiliereModal();
      // Rafraîchir les listes
      fetchCourses();
      fetchFilieresAndMatieres();
    } catch (error) {
      console.error('Erreur lors de la création de la filière:', error);
      alert('Erreur lors de la création de la filière.');
    } finally {
      setCreatingFiliere(false);
    }
  };

  // Fonctions pour gérer les matières dans les filières existantes
  const handleAddMatiereToFiliere = async (filiereId, matiereName) => {
    if (!matiereName.trim()) {
      alert('Le nom de la matière est requis.');
      return;
    }

    try {
      await matiereService.createMatiere({
        name: matiereName.trim(),
        filiere_id: filiereId
      });
      
      alert('Matière ajoutée avec succès !');
      fetchFilieresAndMatieres();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la matière:', error);
      alert('Erreur lors de l\'ajout de la matière.');
    }
  };

  const handleDeleteMatiere = async (matiereId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    
    try {
      await matiereService.deleteMatiere(matiereId);
      alert('Matière supprimée avec succès !');
      fetchFilieresAndMatieres();
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      alert('Erreur lors de la suppression de la matière.');
    }
  };

  const handleDeleteFiliere = async (filiereId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette filière ? Toutes les matières associées seront supprimées.')) return;
    
    try {
      await filiereService.deleteFiliere(filiereId);
      alert('Filière supprimée avec succès !');
      fetchFilieresAndMatieres();
      fetchCourses(); // Rafraîchir les cours aussi
    } catch (error) {
      console.error('Erreur lors de la suppression de la filière:', error);
      alert('Erreur lors de la suppression de la filière.');
    }
  };

  const courseFilieres = Array.from(new Set(courses.map(c => c.filiere).filter(Boolean)));
  const matieresList = Array.from(new Set(matieres.map(m => m.name).filter(Boolean)));
  
  const filteredCourses = courses.filter(course => {
    const matchMatiere = matiereFilter === 'all' || course.matiere === matiereFilter;
    return matchMatiere;
  });

  const handleApprove = async (id) => {
    try {
      await adminService.approveCourse(id);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve course:', error);
      alert('Erreur lors de l\'approbation du cours.');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectCourse(id);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject course:', error);
      alert('Erreur lors du rejet du cours.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      await adminService.deleteCourseAdmin(id);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Erreur lors de la suppression du cours.');
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'approved': return { text: 'Approuvé', class: 'status-approved' };
      case 'pending': return { text: 'En attente', class: 'status-pending' };
      case 'rejected': return { text: 'Rejeté', class: 'status-rejected' };
      default: return { text: statut, class: 'status-unknown' };
    }
  };

  if (loading) {
    return (
      <div className="main-content coursAdmin">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des cours…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content coursAdmin">
      <div className="page-header">
        <h1>Gestion des Cours</h1>
        <p>Approuvez, vérifiez, modifiez ou supprimez les cours.</p>
      </div>

      {/* Bouton de création de filière - visible uniquement pour l'admin */}
      {isAdmin && (
        <div className="admin-actions">
          <button className="btn-primary" onClick={handleOpenFiliereModal}>
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Créer une filière
          </button>
        </div>
      )}

      {/* Section de gestion des filières et matières */}
      {isAdmin && (
        <div className="filieres-section">
          <div className="section-header">
            <h2>Gestion des Filières et Matières</h2>
            <p>Visualisez et gérez les filières existantes et leurs matières associées.</p>
          </div>

          {loadingFilieres ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <p>Chargement des filières…</p>
            </div>
          ) : (
            <div className="filieres-grid">
              {filieres.map(filiere => {
                const filiereMatieres = matieres.filter(m => m.filiereId === filiere.id);
                return (
                  <div key={filiere.id} className="filiere-card">
                    <div className="filiere-header">
                      <div className="filiere-info">
                        <h3>{filiere.name}</h3>
                        <span className="matieres-count">{filiereMatieres.length} matière(s)</span>
                      </div>
                      <div className="filiere-actions">
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleDeleteFiliere(filiere.id)}
                          title="Supprimer la filière"
                        >
                          <svg viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="matieres-list">
                      {filiereMatieres.map(matiere => (
                        <div key={matiere.id} className="matiere-item">
                          <div className="matiere-info">
                            <span className="matiere-name">{matiere.name}</span>
                            <button 
                              className="matiere-link"
                              onClick={() => setMatiereFilter(matiere.name)}
                              title="Voir les cours de cette matière"
                            >
                              Voir les cours
                            </button>
                          </div>
                          <button 
                            className="btn-icon danger small" 
                            onClick={() => handleDeleteMatiere(matiere.id)}
                            title="Supprimer la matière"
                          >
                            <svg viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {/* Formulaire pour ajouter une nouvelle matière */}
                      <div className="add-matiere-form">
                        <AddMatiereForm 
                          filiereId={filiere.id} 
                          onAdd={(matiereName) => handleAddMatiereToFiliere(filiere.id, matiereName)} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Indicateur de filtre actif */}
      {matiereFilter !== 'all' && (
        <div className="filter-indicator">
          <span>Filtré par matière : <strong>{matiereFilter}</strong></span>
          <button 
            className="btn-xs btn-secondary" 
            onClick={() => setMatiereFilter('all')}
            title="Voir tous les cours"
          >
            Voir tous les cours
          </button>
        </div>
      )}

      <div className="admin-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Formateur</th>
              <th>Filière</th>
              <th>Étudiants</th>
              <th>Statut</th>
              <th>Date création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => {
              const statusBadge = getStatusBadge(course.statut);
              return (
                <tr key={course.id}>
                  <td><strong>{course.title}</strong></td>
                  <td>{course.formateurName}</td>
                  <td>{course.filiereName || course.filiere || '-'}</td>
                  <td>{course.etudiants}</td>
                  <td><span className={`status-badge ${statusBadge.class}`}>{statusBadge.text}</span></td>
                  <td>{new Date(course.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="table-actions">
                    {course.statut === 'pending' && (
                      <>
                        <button className="btn-xs btn-success" onClick={() => handleApprove(course.id)}>Approuver</button>
                        <button className="btn-xs btn-warning" onClick={() => handleReject(course.id)}>Rejeter</button>
                      </>
                    )}
                    <button className="btn-xs btn-danger" onClick={() => handleDelete(course.id)}>Supprimer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Version mobile avec cartes */}
        <div className="mobile-cards" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <p>Aucun cours trouvé</p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div key={course.id} className="admin-card">
                <div className="card-header">
                  <div className="card-title">
                    <strong>{course.title}</strong>
                    <span className={`status-badge ${course.statut.toLowerCase().replace(' ', '-')}`}>
                      {course.statut}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-field">
                    <span className="field-label">Formateur:</span>
                    <span className="field-value">{course.formateurName}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Étudiants:</span>
                    <span className="field-value">{course.etudiants}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Création:</span>
                    <span className="field-value">{new Date(course.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  {course.statut === 'pending' && (
                    <>
                      <button className="btn-xs btn-success" onClick={() => handleApprove(course.id)}>Approuver</button>
                      <button className="btn-xs btn-warning" onClick={() => handleReject(course.id)}>Rejeter</button>
                    </>
                  )}
                  <button className="btn-xs btn-danger" onClick={() => handleDelete(course.id)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de création de filière */}
      {showFiliereModal && (
        <div className="modal-overlay" onClick={handleCloseFiliereModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer une filière</h2>
              <button className="modal-close" onClick={handleCloseFiliereModal}>×</button>
            </div>
            
            <form onSubmit={handleCreateFiliere} className="modal-body">
              <div className="form-group">
                <label htmlFor="filiere-name">Nom de la filière *</label>
                <input
                  id="filiere-name"
                  type="text"
                  value={filiereForm.name}
                  onChange={handleFiliereChange}
                  placeholder="Ex: Informatique, Mathématiques..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Matières *</label>
                <div className="matieres-list">
                  {filiereForm.matieres.map((matiere, index) => (
                    <div key={index} className="matiere-item">
                      <input
                        type="text"
                        value={matiere.name}
                        onChange={(e) => handleMatiereChange(index, e.target.value)}
                        placeholder={`Matière ${index + 1}`}
                        required
                      />
                      {filiereForm.matieres.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeMatiere(index)}
                          title="Supprimer cette matière"
                        >
                          <svg viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-secondary-outline add-matiere-btn"
                  onClick={addMatiere}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Ajouter une matière
                </button>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseFiliereModal}
                  disabled={creatingFiliere}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creatingFiliere}
                >
                  {creatingFiliere ? 'Création...' : 'Créer la filière'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursAdmin;
