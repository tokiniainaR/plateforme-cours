import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import examService from '../services/examService';

const ExamensCopiesProf = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('id');

  const [exam, setExam] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;

      try {
        setIsLoading(true);
        const [examData, submissionsData] = await Promise.all([
          examService.getExamById(examId),
          examService.getStudentSubmissions(examId)
        ]);

        setExam(examData);
        setSubmissions(submissionsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(sub => sub.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.student_name || '';
          bVal = b.student_name || '';
          break;
        case 'date':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'grade':
          aVal = a.grade || 0;
          bVal = b.grade || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, filter, searchTerm, sortBy, sortOrder]);

  const handleGradeSubmission = async (submissionId, grade) => {
    try {
      await examService.gradeSubmission(submissionId, grade);
      // Update the submission in the list
      setSubmissions(submissions.map(sub =>
        sub.id === submissionId ? { ...sub, grade: grade, status: 'graded' } : sub
      ));
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, grade: grade, status: 'graded' });
      }
    } catch (error) {
      console.error('Erreur lors de la notation:', error);
      alert('Erreur lors de la notation de la copie.');
    }
  };

  if (isLoading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des copies d'examen…</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="main-content">
        <div className="not-found">
          <h2>Examen introuvable</h2>
          <p>Nous n'avons pas trouvé cet examen. <Link to="/examens-prof">Retour aux examens</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content exam-copies-page">
      <Link to="/examens-prof" className="back-btn">
        &larr; Retour aux examens
      </Link>

      <div className="page-header">
        <h1>Copies - {exam.title}</h1>
        <p>Cours : {exam.course_title}</p>
      </div>

      {/* SUBJECT DOCUMENTS SECTION */}
      <div className="exam-subject-section">
        <div className="subject-card">
          <div className="subject-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <div className="subject-content">
            <h3>Sujet de l'examen</h3>
            <div className="exam-content-display">
              {exam.content ? (
                <div className="exam-content-text">
                  {exam.content.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                  ))}
                </div>
              ) : null}
              
              {exam.files && exam.files.length > 0 ? (
                <div className="exam-files-section">
                  <h4>Fichiers joints :</h4>
                  <div className="exam-files-list">
                    {JSON.parse(exam.files).map((filePath, index) => {
                      const fileName = filePath.split('/').pop();
                      return (
                        <div key={index} className="file-download-card">
                          <div className="file-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="file-info">
                            <span className="file-name">{fileName}</span>
                          </div>
                          <a 
                            href={`http://localhost:5000${filePath}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="download-btn"
                          >
                            Télécharger
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              
              {!exam.content && (!exam.files || exam.files.length === 0) && (
                <p className="no-content">Aucun contenu défini pour cet examen</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="exam-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <p>{submissions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Non notées</h3>
          <p>{submissions.filter(s => s.status === 'pending').length}</p>
        </div>
        <div className="stat-card">
          <h3>Notées</h3>
          <p>{submissions.filter(s => s.status === 'graded').length}</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filtrer par statut :</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Toutes les copies</option>
            <option value="pending">Non notées</option>
            <option value="graded">Notées</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rechercher :</label>
          <input
            type="text"
            placeholder="Nom de l'étudiant..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Trier par :</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Nom</option>
            <option value="date">Date</option>
            <option value="grade">Note</option>
          </select>
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="submissions-list">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className={`submission-card ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
            onClick={() => setSelectedSubmission(submission)}
          >
            <div className="submission-header">
              <h3>{submission.student_name}</h3>
              <span className={`status-badge ${submission.status}`}>
                {submission.status === 'pending' ? 'À noter' : 'Notée'}
              </span>
            </div>
            <div className="submission-meta">
              <p>Soumis le : {new Date(submission.created_at).toLocaleDateString('fr-FR')}</p>
              {submission.grade && <p>Note : {submission.grade}/20</p>}
            </div>
          </div>
        ))}
      </div>

      {selectedSubmission && (
        <div className="submission-details">
          <div className="submission-details-header">
            <div>
              <h2>Copie de {selectedSubmission.student_name}</h2>
              <p className="submission-date">Soumis le : {new Date(selectedSubmission.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <span className={`status-badge ${selectedSubmission.status}`}>
              {selectedSubmission.status === 'pending' ? 'À noter' : 'Notée'}
            </span>
          </div>

          <div className="submission-files-section">
            <h3>Fichier de réponse</h3>
            {selectedSubmission.file_path ? (
              <div className="file-download-card">
                <div className="file-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <div className="file-info">
                  <p className="file-name">{selectedSubmission.file_path.split('/').pop()}</p>
                  <p className="file-size">Document PDF</p>
                </div>
                <a href={selectedSubmission.file_path} download className="btn-primary" title="Télécharger le fichier">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Télécharger
                </a>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray)', backgroundColor: 'var(--light)', borderRadius: 'var(--radius)' }}>
                <p>Aucun fichier de réponse soumis</p>
              </div>
            )}
          </div>

          <div className="grading-section">
            <h3>Notation</h3>
            <div className="grade-input">
              <label>Note (/20) :</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={selectedSubmission.grade || ''}
                onChange={e => setSelectedSubmission({
                  ...selectedSubmission,
                  grade: parseFloat(e.target.value)
                })}
              />
              <button
                className="btn-primary"
                onClick={() => handleGradeSubmission(selectedSubmission.id, selectedSubmission.grade)}
              >
                Enregistrer la note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamensCopiesProf;