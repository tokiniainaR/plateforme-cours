import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import examService from '../services/examService';

const Examens = () => {
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const examsData = await examService.getStudentExams();
        setAllExams(examsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error);
        setAllExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getExamsByStatus = () => {
    if (filterStatus === 'all') return allExams;
    // Déterminer le statut basé sur les dates
    return allExams.filter(e => {
      const now = new Date();
      // Convertir le format MySQL "YYYY-MM-DD HH:MM:SS" en format ISO avec Z (UTC)
      const startString = typeof e.start_date === 'string' ? e.start_date.replace(' ', 'T') + 'Z' : e.start_date;
      const endString = typeof e.end_date === 'string' ? e.end_date.replace(' ', 'T') + 'Z' : e.end_date;
      const startDate = new Date(startString);
      const endDate = new Date(endString);
      
      let status;
      if (now < startDate) status = 'non-commencé';
      else if (now > endDate) status = 'terminé';
      else status = 'en-cours';
      
      return filterStatus === 'all' || status === filterStatus;
    });
  };

  const getStatusBadgeBg = (statut) => {
    switch(statut) {
      case 'en-cours': return '#FEF3C7';
      case 'non-commencé': return '#EFF6FF';
      case 'terminé': return '#ECFDF5';
      default: return '#F3E8FF';
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'en-cours': return '#D97706';
      case 'non-commencé': return '#3B82F6';
      case 'terminé': return '#10B981';
      default: return '#7C3AED';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut) {
      case 'en-cours': return 'En cours';
      case 'non-commencé': return 'Non commencé';
      case 'terminé': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Dépassée';
    if (daysLeft === 0) return 'Aujourd\'hui';
    if (daysLeft === 1) return 'Demain';
    return `${daysLeft} jours`;
  };

  const getExamStatus = (startDate, endDate) => {
    const now = new Date();
    // Convertir le format MySQL "YYYY-MM-DD HH:MM:SS" en format ISO avec Z (UTC)
    const startString = typeof startDate === 'string' ? startDate.replace(' ', 'T') + 'Z' : startDate;
    const endString = typeof endDate === 'string' ? endDate.replace(' ', 'T') + 'Z' : endDate;
    const start = new Date(startString);
    const end = new Date(endString);
    
    if (now < start) return 'non-commencé';
    if (now > end) return 'terminé';
    return 'en-cours';
  };

  const filteredExams = getExamsByStatus();
  const ongoingCount = allExams.filter(e => getExamStatus(e.start_date, e.end_date) === 'en-cours').length;
  const notStartedCount = allExams.filter(e => getExamStatus(e.start_date, e.end_date) === 'non-commencé').length;
  const completedCount = allExams.filter(e => getExamStatus(e.start_date, e.end_date) === 'terminé').length;

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des examens…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Mes Examens</h1>
        <p>Consultez vos examens à venir et vos résultats.</p>
      </div>

      {/* STATS */}
      <div className="grid-2">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#D97706' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#D97706' }}>{ongoingCount}</h2>
            <p>En cours</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#10B981' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#10B981' }}>{completedCount}</h2>
            <p>Terminés</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="exams-filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Tous ({allExams.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'en-cours' ? 'active' : ''}`}
          onClick={() => setFilterStatus('en-cours')}
        >
          En cours ({ongoingCount})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'terminé' ? 'active' : ''}`}
          onClick={() => setFilterStatus('terminé')}
        >
          Terminés ({completedCount})
        </button>
      </div>

      {/* EXAMS LIST */}
      <div className="exams-list">
        {filteredExams.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 15h6" />
            </svg>
            <p>Aucun examen pour cette catégorie.</p>
          </div>
        ) : (
          filteredExams.map(exam => {
            const examStatus = getExamStatus(exam.start_date, exam.end_date);
            return (
            <div key={exam.id} className="exam-card">
              <div className="exam-card-left">
                <div className="exam-status-badge" style={{ backgroundColor: getStatusBadgeBg(examStatus) }}>
                  <span style={{ color: getStatusColor(examStatus) }}>{'●'}</span>
                  <span style={{ color: getStatusColor(examStatus) }}>{getStatusLabel(examStatus)}</span>
                </div>
              </div>

              <div className="exam-card-content">
                <div className="exam-card-header">
                  <h3>{exam.title}</h3>
                  {exam.grade !== null && (
                    <div className="exam-note">
                      <span className="note-label">Votre note:</span>
                      <strong style={{ color: exam.grade >= 60 ? '#10B981' : '#EF4444' }}>{exam.grade}%</strong>
                    </div>
                  )}
                </div>
                
                <div className="exam-card-info">
                  <div className="exam-info-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 19a2 2 0 0 1 2-2h14" />
                      <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
                    </svg>
                    <span><strong>Cours:</strong> {exam.course_title}</span>
                  </div>
                  
                  <div className="exam-info-item">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span><strong>Durée:</strong> {exam.duration}</span>
                  </div>
                </div>
              </div>

              <div className="exam-card-action">
                <Link 
                  to={`/exam-content/${exam.id}`}
                  className="btn-exam"
                >
                  {examStatus === 'terminé' ? 'Voir les résultats' : 'Accéder'}
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Examens;
