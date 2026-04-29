import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';

const GestionCompteAdmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [filiereFilter, setFiliereFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAccounts = async () => {
    try {
      console.log('Fetching admin accounts from backend...');
      const data = await adminService.getAllAccounts('all');
      console.log('Admin accounts response:', data);
      setAccounts(Array.isArray(data) ? data : data?.accounts || data?.data || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filieres = Array.from(new Set(accounts.map(acc => acc.filiere).filter(Boolean)));

  const filteredAccounts = accounts.filter(acc => {
    const matchStatus = statusFilter === 'all' || (statusFilter === 'blocked' ? ['blocked', 'suspended'].includes(acc.etat) : acc.etat === statusFilter);
    const matchRole = roleFilter === 'all' || (acc.role || '').toLowerCase() === roleFilter;
    const matchFiliere = filiereFilter === 'all' || acc.filiere === filiereFilter;
    const matchSearch = (acc.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (acc.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (acc.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isNotAdmin = acc.role !== 'admin'; // Exclude admin accounts
    return matchStatus && matchRole && matchFiliere && matchSearch && isNotAdmin;
  });

  const handleUnblock = async (id) => {
    try {
      await adminService.unblockAccount(id);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Failed to unblock account:', error);
      alert('Erreur lors du déblocage du compte.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) return;
    
    try {
      await adminService.deleteAccount(id);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Erreur lors de la suppression du compte.');
    }
  };

  const getStatusBadge = (etat) => {
    switch (etat) {
      case 'active': return { text: 'Actif', class: 'status-active' };
      case 'suspended': return { text: 'Suspendu', class: 'status-suspended' };
      case 'blocked': return { text: 'Bloqué', class: 'status-blocked' };
      default: return { text: 'Inconnu', class: 'status-unknown' };
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'student': return 'Étudiant';
      case 'instructor': return 'Formateur';
      case 'admin': return 'Administrateur';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="main-content gestionCompteAdmin">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des comptes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content gestionCompteAdmin">
      <div className="page-header">
        <h1>Gestion des Comptes</h1>
        <p>Gérez, modifiez, suspendez ou supprimez les comptes utilisateurs.</p>
      </div>

      <div className="admin-filters">
        <input 
          type="text" 
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filter-group">
          <label htmlFor="filiere-filter">Filière :</label>
          <select
            id="filiere-filter"
            value={filiereFilter}
            onChange={e => setFiliereFilter(e.target.value)}
            className="course-filter-select"
          >
            <option value="all">Toutes</option>
            {filieres.map((filiere) => (
              <option key={filiere} value={filiere}>{filiere}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-header">
        <div className="acct-filter-section">
          <span className="filter-label">Statut:</span>
          <div className="filter-buttons">
            <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
              Tous ({accounts.length})
            </button>
            <button className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>
              Actifs ({accounts.filter(a => a.etat === 'active').length})
            </button>
            <button className={`filter-btn ${statusFilter === 'blocked' ? 'active' : ''}`} onClick={() => setStatusFilter('blocked')}>
              Bloqués ({accounts.filter(a => ['blocked', 'suspended'].includes(a.etat)).length})
            </button>
          </div>
        </div>
        <div className="acct-filter-section">
          <span className="filter-label">Rôle:</span>
          <div className="filter-buttons">
            <button className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>
              Tous
            </button>
            <button className={`filter-btn ${roleFilter === 'student' ? 'active' : ''}`} onClick={() => setRoleFilter('student')}>
              Étudiants ({accounts.filter(a => a.role === 'student').length})
            </button>
            <button className={`filter-btn ${roleFilter === 'instructor' ? 'active' : ''}`} onClick={() => setRoleFilter('instructor')}>
              Formateurs ({accounts.filter(a => a.role === 'instructor').length})
            </button>
          </div>
        </div>
      </div>

      <div className="admin-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Filière</th>
              <th>Date inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(account => {
              const statusColor = account.etat === 'active' ? '#22c55e' : '#ef4444';
              return (
                <tr key={account.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        marginRight: '8px',
                        backgroundColor: statusColor,
                        verticalAlign: 'middle'
                      }}
                    />
                    <strong>{account.prenom} {account.nom}</strong>
                  </td>
                  <td>{account.email}</td>
                  <td><span className="role-badge">{getRoleText(account.role)}</span></td>
                  <td>{account.filiere || '-'}</td>
                  <td>{new Date(account.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="table-actions">
                    <Link to={`/admin/student-profile?id=${account.id}&source=admin`} className="btn-xs btn-info" title="Voir le profil">
                      Voir profil
                    </Link>
                    {account.etat === 'blocked' ? (
                      <button className="btn-xs btn-success" onClick={() => handleUnblock(account.id)}>Débloquer</button>
                    ) : account.etat === 'suspended' ? (
                      <button className="btn-xs btn-warning" onClick={() => handleUnblock(account.id)}>Activer</button>
                    ) : null}
                    <button className="btn-xs btn-danger" onClick={() => handleDelete(account.id)}>Supprimer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Version mobile avec cartes */}
        <div className="mobile-cards" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {filteredAccounts.length === 0 ? (
            <div className="empty-state">
              <p>Aucun compte trouvé</p>
            </div>
          ) : (
            filteredAccounts.map(account => {
              return (
                <div key={account.id} className="admin-card">
                  <div className="card-header">
                    <div className="card-title">
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          marginRight: '8px',
                          backgroundColor: account.etat === 'active' ? '#22c55e' : '#ef4444',
                          verticalAlign: 'middle'
                        }}
                      />
                      <strong>{account.prenom} {account.nom}</strong>
                      <span className="role-badge">{getRoleText(account.role)}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-field">
                      <span className="field-label">Email:</span>
                      <span className="field-value">{account.email}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Filière:</span>
                      <span className="field-value">{account.filiere || '-'}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Inscription:</span>
                      <span className="field-value">{new Date(account.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <Link to={`/admin/student-profile?id=${account.id}&source=admin`} className="btn-xs btn-info" title="Voir le profil">
                      Voir profil
                    </Link>
                    {account.etat === 'blocked' ? (
                      <button className="btn-xs btn-success" onClick={() => handleUnblock(account.id)}>Débloquer</button>
                    ) : account.etat === 'suspended' ? (
                      <button className="btn-xs btn-warning" onClick={() => handleUnblock(account.id)}>Activer</button>
                    ) : null}
                    <button className="btn-xs btn-danger" onClick={() => handleDelete(account.id)}>Supprimer</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionCompteAdmin;
