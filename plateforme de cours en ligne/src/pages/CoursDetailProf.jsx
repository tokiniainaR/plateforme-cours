import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import courseService from '../services/courseService';

const CoursDetailProf = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');

  const [editableCourse, setEditableCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showQuizDetailModal, setShowQuizDetailModal] = useState(false);
  const [quizDetail, setQuizDetail] = useState(null);
  const [editingCourse, setEditingCourse] = useState(false);

  const [newVideo, setNewVideo] = useState({ title: '', type: 'youtube', url: '', file: null, duration: '' });
  const [newPdf, setNewPdf] = useState({ title: '', type: 'link', url: '', file: null });
  const [newQuiz, setNewQuiz] = useState({ title: '', question: '', answersCount: 4, answers: ['', '', '', ''], correctAnswer: '' });
  const [newResource, setNewResource] = useState({ title: '', type: 'pdf', url: '', file: null });

  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const formatFileSize = (sizeBytes) => {
    if (sizeBytes == null) return 'N/A';
    const size = Number(sizeBytes);
    if (Number.isNaN(size)) return 'N/A';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const parseNumber = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        const courseData = await courseService.getCourseById(courseId);

        setEditableCourse({
          title: courseData?.title || '',
          description: courseData?.description || '',
          filiere: courseData?.filiere || courseData?.filiereName || '',
          niveau: courseData?.niveau || '',
          etudiants: courseData?.etudiants || 0,
          objectif: courseData?.objectif || '',
          duree: courseData?.duree || '',
          videos: courseData?.videos || [],
          pdfs: courseData?.pdfs || [],
          quizzes: courseData?.quizzes || [],
          resources: courseData?.resources || [],
          ...courseData
        });
      } catch (error) {
        console.error('Erreur lors du chargement du cours :', error);
        alert('Impossible de charger les informations du cours. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab === 'students' && courseId) {
        setLoadingStudents(true);
        try {
          const students = await courseService.getCourseStudents(courseId);
          setCourseStudents(students);
        } catch (error) {
          console.error('Erreur lors du chargement des étudiants :', error);
          setCourseStudents([]);
        } finally {
          setLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [activeTab, courseId]);

  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [originalCourse, setOriginalCourse] = useState(null);

  const handleStartEditing = () => {
    setOriginalCourse(JSON.parse(JSON.stringify(editableCourse)));
    setEditingCourse(true);
  };

  const handleCancelEditing = () => {
    if (originalCourse) {
      setEditableCourse(originalCourse);
    }
    setEditingCourse(false);
    setShowConfirmSave(false);
  };

  const persistCourseChanges = async (updatedCourse) => {
    try {
      const cleanCourse = {
        ...updatedCourse,
        videos: updatedCourse.videos?.map(({ file, ...rest }) => rest) || [],
        pdfs: updatedCourse.pdfs?.map(({ file, ...rest }) => rest) || [],
        resources: updatedCourse.resources?.map(({ file, ...rest }) => rest) || [],
        quizzes: updatedCourse.quizzes?.map((quiz) => ({ ...quiz })) || []
      };

      const savedCourse = await courseService.updateCourse(courseId, cleanCourse);
      setEditableCourse({
        ...savedCourse,
        videos: savedCourse.videos || [],
        pdfs: savedCourse.pdfs || [],
        quizzes: savedCourse.quizzes || [],
        resources: savedCourse.resources || []
      });
      return savedCourse;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique du cours :', error);
      alert('Erreur lors de l’enregistrement du contenu du cours.');
      return null;
    }
  };

  const handleSaveCourse = () => {
    setShowConfirmSave(true);
  };

  const confirmSaveCourse = async () => {
    try {
      await persistCourseChanges(editableCourse);
      setEditingCourse(false);
      setShowConfirmSave(false);
      setOriginalCourse(null);
      alert('Cours mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour du cours');
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (newVideo.title && ((newVideo.type === 'youtube' && newVideo.url) || (newVideo.type === 'upload' && newVideo.file))) {
      let duration = newVideo.duration;
      let videoUrl = newVideo.url;

      if (newVideo.type === 'upload') {
        try {
          console.log('Uploading video file to backend for course', courseId, newVideo.file);
          const uploadResult = await courseService.uploadCourseVideo(courseId, newVideo.file);
          videoUrl = uploadResult.url;
          console.log('Uploaded video URL:', videoUrl);
        } catch (error) {
          console.error('Erreur lors de l’upload de la vidéo :', error);
          alert('Impossible d’uploader la vidéo. Veuillez réessayer.');
          return;
        }
      }

      if (newVideo.type === 'youtube' && !duration) {
        duration = '10:30';
      }

      const video = {
        id: editableCourse.videos.length + 1,
        title: newVideo.title,
        type: newVideo.type,
        url: videoUrl,
        duration,
        description: newVideo.description || ''
      };
      const updatedCourse = {
        ...editableCourse,
        videos: [...editableCourse.videos, video]
      };
      setEditableCourse(updatedCourse);
      await persistCourseChanges(updatedCourse);
      setNewVideo({ title: '', type: 'youtube', url: '', file: null, duration: '' });
      setShowVideoModal(false);
    }
  };

  const handleAddPdf = async (e) => {
    e.preventDefault();
    if (newPdf.title && ((newPdf.type === 'link' && newPdf.url) || (newPdf.type === 'upload' && newPdf.file))) {
      let pdfUrl = newPdf.url;
      let uploadResult = null;

      if (newPdf.type === 'upload') {
        try {
          uploadResult = await courseService.uploadCoursePdf(courseId, newPdf.file);
          pdfUrl = uploadResult.url;
        } catch (error) {
          console.error('Erreur lors de l’upload du PDF :', error);
          alert('Impossible d’uploader le document PDF. Veuillez réessayer.');
          return;
        }
      }

      const pdf = {
        id: editableCourse.pdfs.length + 1,
        title: newPdf.title,
        type: newPdf.type,
        url: pdfUrl,
        filename: uploadResult?.filename,
        originalName: uploadResult?.originalName,
        size: newPdf.type === 'upload' ? formatFileSize(newPdf.file.size) : 'N/A',
        date: new Date().toISOString(),
        downloads: 0,
        views: 0
      };

      const updatedCourse = {
        ...editableCourse,
        pdfs: [...editableCourse.pdfs, pdf]
      };
      setEditableCourse(updatedCourse);
      await persistCourseChanges(updatedCourse);
      setNewPdf({ title: '', type: 'link', url: '', file: null });
      setShowPdfModal(false);
    }
  };

  const handleAnswersCountChange = (count) => {
    const newCount = parseInt(count);
    const currentAnswers = [...newQuiz.answers];
    if (newCount > currentAnswers.length) {
      while (currentAnswers.length < newCount) {
        currentAnswers.push('');
      }
    } else {
      currentAnswers.splice(newCount);
    }
    const selectedCorrectAnswer = newQuiz.correctAnswer;
    const remainingAnswers = currentAnswers.map(a => a.trim());
    const isCorrectAnswerStillValid = remainingAnswers.includes(selectedCorrectAnswer);
    setNewQuiz({ ...newQuiz, answersCount: newCount, answers: currentAnswers, correctAnswer: isCorrectAnswerStillValid ? selectedCorrectAnswer : '' });
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    const providedAnswers = newQuiz.answers.filter(a => a.trim());
    if (newQuiz.title && newQuiz.question && providedAnswers.length >= 2) {
      const quiz = {
        id: editableCourse.quizzes.length + 1,
        title: newQuiz.title,
        question: newQuiz.question,
        answers: providedAnswers,
        correctAnswer: newQuiz.correctAnswer || null,
        attempts: 0,
        answersCount: providedAnswers.length,
        published: false
      };
      const updatedCourse = {
        ...editableCourse,
        quizzes: [...editableCourse.quizzes, quiz]
      };
      setEditableCourse(updatedCourse);
      await persistCourseChanges(updatedCourse);
      setNewQuiz({ title: '', question: '', answersCount: 4, answers: ['', '', '', ''], correctAnswer: '' });
      setShowQuizModal(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    const updatedCourse = {
      ...editableCourse,
      videos: editableCourse.videos.filter(v => v.id !== id)
    };
    setEditableCourse(updatedCourse);
    await persistCourseChanges(updatedCourse);
  };

  const handleDeletePdf = async (id) => {
    const updatedCourse = {
      ...editableCourse,
      pdfs: editableCourse.pdfs.filter(p => p.id !== id)
    };
    setEditableCourse(updatedCourse);
    await persistCourseChanges(updatedCourse);
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    const canUploadPdf = newResource.type === 'pdf' && (newResource.url || newResource.file);
    const canUploadArchive = newResource.type === 'archive' && newResource.file;
    const canUseVideoUrl = newResource.type === 'video' && newResource.url;

    if (newResource.title && (canUploadPdf || canUploadArchive || canUseVideoUrl)) {
      let resourceUrl = newResource.url;
      let uploadResult = null;

      if ((newResource.type === 'archive' || (newResource.type === 'pdf' && newResource.file)) && newResource.file) {
        try {
          uploadResult = await courseService.uploadCourseResource(courseId, newResource.file);
          resourceUrl = uploadResult.url;
        } catch (error) {
          console.error('Erreur lors de l’upload de la ressource :', error);
          alert(`Impossible d’uploader la ressource ${newResource.type === 'pdf' ? 'PDF' : 'archive'}. Veuillez réessayer.`);
          return;
        }
      }

      const resource = {
        id: (editableCourse.resources || []).length + 1,
        title: newResource.title,
        type: newResource.type,
        url: resourceUrl,
        filename: uploadResult?.filename,
        originalName: uploadResult?.originalName,
        size: (newResource.file && (newResource.type === 'archive' || newResource.type === 'pdf')) ? formatFileSize(newResource.file.size) : 'N/A',
        date: new Date().toISOString(),
        downloads: 0,
        views: 0
      };

      const updatedCourse = {
        ...editableCourse,
        resources: [...(editableCourse.resources || []), resource]
      };
      setEditableCourse(updatedCourse);
      await persistCourseChanges(updatedCourse);
      setNewResource({ title: '', type: 'pdf', url: '', file: null });
      setShowResourceModal(false);
    }
  };

  const handleDeleteResource = async (id) => {
    const updatedCourse = {
      ...editableCourse,
      resources: (editableCourse.resources || []).filter(r => r.id !== id)
    };
    setEditableCourse(updatedCourse);
    await persistCourseChanges(updatedCourse);
  };

  const openVideoPreview = (video) => {
    const url = video.url || (video.file ? URL.createObjectURL(video.file) : '');
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Aucune URL de vidéo disponible pour cette entrée.');
    }
  };

  const showQuizDetail = (quiz) => {
    setQuizDetail(quiz);
    setShowQuizDetailModal(true);
  };

  const closeQuizDetail = () => {
    setShowQuizDetailModal(false);
    setQuizDetail(null);
  };

  if (!courseId) {
    return (
      <div className="coursDetailProf">
        <div className="loading">Cours introuvable. Vérifiez l'URL ou sélectionnez un cours valide.</div>
      </div>
    );
  }

  if (!editableCourse) {
    return (
      <div className="coursDetailProf">
        <div className="loading">Chargement du cours...</div>
      </div>
    );
  }

  return (
    <div className="coursDetailProf">
      {/* HEADER */}
      <div className="prof-course-header">
        <div className="prof-course-title-section">
          <div className="prof-course-title-info">
            <h1>{editableCourse.title}</h1>
            <div className="prof-course-actions">
              <button
                className={`btn-secondary-outline ${editingCourse ? 'danger' : 'primary'}`}
                onClick={editingCourse ? handleCancelEditing : handleStartEditing}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
                {editingCourse ? 'Annuler la modification' : 'Modifier le cours'}
              </button>
            </div>
          </div>
        </div>
        <div className="prof-course-meta">
          <div className="prof-course-meta-item">
            <svg viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="meta-label">Filière:</span>
            <span className="meta-value">{editableCourse.filiere}</span>
          </div>
          <div className="prof-course-meta-item">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10,8 16,12 10,16 10,8"/>
            </svg>
            <span className="meta-label">Niveau:</span>
            <span className="meta-value">{editableCourse.niveau}</span>
          </div>
          <div className="prof-course-meta-item">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="meta-label">Étudiants:</span>
            <span className="meta-value">{editableCourse.etudiants}</span>
          </div>
        </div>
      </div>

      {/* EDIT COURSE FORM */}
      {editingCourse && (
        <div className="prof-course-edit-form">
          <div className="prof-edit-form-header">
            <h2>
              <svg viewBox="0 0 24 24">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
              Modifier les informations du cours
            </h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Titre du cours *
              </label>
              <input
                type="text"
                value={editableCourse.title}
                onChange={(e) => setEditableCourse({...editableCourse, title: e.target.value})}
                placeholder="Entrez le titre du cours"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Filière *
              </label>
              <input
                type="text"
                value={editableCourse.filiere}
                onChange={(e) => setEditableCourse({...editableCourse, filiere: e.target.value})}
                placeholder="Ex: Management, Informatique..."
                required
              />
            </div>
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10,8 16,12 10,16 10,8"/>
                </svg>
                Niveau *
              </label>
              <select
                value={editableCourse.niveau}
                onChange={(e) => setEditableCourse({...editableCourse, niveau: e.target.value})}
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                Durée du cours
              </label>
              <input
                type="text"
                value={editableCourse.duree || ''}
                onChange={(e) => setEditableCourse({...editableCourse, duree: e.target.value})}
                placeholder="Ex: 8 semaines, 3 mois..."
              />
            </div>
            <div className="form-group full-width">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                Description du cours *
              </label>
              <textarea
                value={editableCourse.description}
                onChange={(e) => setEditableCourse({...editableCourse, description: e.target.value})}
                rows="4"
                placeholder="Décrivez brièvement le contenu du cours..."
                required
              />
            </div>
            <div className="form-group full-width">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M19 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-8 8H7v-2h4v2Zm6-4H7V9h10v2Z"/>
                </svg>
                Question de réflexion
              </label>
              <textarea
                value={editableCourse.reflectionQuestion || ''}
                onChange={(e) => setEditableCourse({...editableCourse, reflectionQuestion: e.target.value})}
                rows="3"
                placeholder="Entrez la question de réflexion que les étudiants devront répondre"
              />
            </div>
            <div className="form-group full-width">
              <label>
                <svg viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                  <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                </svg>
                Objectifs du cours *
              </label>
              <textarea
                value={editableCourse.objectif}
                onChange={(e) => setEditableCourse({...editableCourse, objectif: e.target.value})}
                rows="4"
                placeholder="Quels sont les objectifs pédagogiques ?&#10;Ex: Comprendre React&#10;Créer des applications web&#10;Maîtriser les composants"
                required
              />
            </div>
          </div>

          <div className="prof-edit-actions">
            <button className="btn-secondary-outline" onClick={handleCancelEditing}>
              <svg viewBox="0 0 24 24">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
              Annuler les modifications
            </button>
            <button className="btn-primary" onClick={handleSaveCourse}>
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Valider les modifications
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmSave && (
        <div className="prof-modal-overlay" onClick={() => setShowConfirmSave(false)}>
          <div className="prof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Confirmer la sauvegarde</h3>
              <button
                className="prof-modal-close"
                onClick={() => setShowConfirmSave(false)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="prof-modal-body">
              <p className="prof-confirm-message">
                Êtes-vous sûr de vouloir sauvegarder les modifications apportées au cours <strong>"{editableCourse.title}"</strong> ?
              </p>
              <div className="prof-confirm-details">
                <p>Cette action :</p>
                <ul>
                  <li>• Mettra à jour les informations du cours pour tous les étudiants</li>
                  <li>• Sera visible immédiatement dans la plateforme</li>
                  <li>• Ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
            <div className="prof-modal-actions">
              <button
                className="btn-secondary-outline"
                onClick={() => setShowConfirmSave(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={confirmSaveCourse}
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirmer la sauvegarde
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="prof-tabs-container">
        <div className="prof-tabs">
          <button
            className={`prof-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 3h7v7H3z"/>
              <path d="M14 3h7v7h-7z"/>
              <path d="M14 14h7v7h-7z"/>
              <path d="M3 14h7v7H3z"/>
            </svg>
            Vue d'ensemble
          </button>
          <button
            className={`prof-tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M16 4h.01M16 20h.01M12 4h.01M12 20h.01M8 4h.01M8 20h.01M4 9v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/>
            </svg>
            Vidéos
            <span className="prof-tab-count">{editableCourse.videos.length}</span>
          </button>
          <button
            className={`prof-tab ${activeTab === 'pdfs' ? 'active' : ''}`}
            onClick={() => setActiveTab('pdfs')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Documents
            <span className="prof-tab-count">{editableCourse.pdfs.length}</span>
          </button>
          <button
            className={`prof-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10,8 16,12 10,16 10,8"/>
            </svg>
            Quiz
            <span className="prof-tab-count">{editableCourse.quizzes.length}</span>
          </button>
          <button
            className={`prof-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5 4.27 12 6.11 16.5 4.27"/>
              <line x1="12" y1="22.5" x2="12" y2="6.11"/>
            </svg>
            Ressources
            <span className="prof-tab-count">{(editableCourse.resources || []).length}</span>
          </button>
          <button
            className={`prof-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Étudiants
            <span className="prof-tab-count">{editableCourse.etudiants}</span>
          </button>
        </div>

        <div className="prof-tab-content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Enhanced Statistics Grid */}
              <div className="prof-overview-stats-grid">
                <div className="prof-overview-stat-card primary">
                  <div className="prof-overview-stat-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 4h.01M16 20h.01M12 4h.01M12 20h.01M8 4h.01M8 20h.01M4 9v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/>
                    </svg>
                  </div>
                  <div className="prof-overview-stat-content">
                    <h3>{editableCourse.videos.length}</h3>
                    <p>Vidéos</p>
                  </div>
                </div>

                <div className="prof-overview-stat-card secondary">
                  <div className="prof-overview-stat-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div className="prof-overview-stat-content">
                    <h3>{editableCourse.pdfs.length}</h3>
                    <p>Documents</p>
                  </div>
                </div>

                <div className="prof-overview-stat-card accent">
                  <div className="prof-overview-stat-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="10,8 16,12 10,16 10,8"/>
                    </svg>
                  </div>
                  <div className="prof-overview-stat-content">
                    <h3>{editableCourse.quizzes.length}</h3>
                    <p>Quiz</p>
                  </div>
                </div>

                <div className="prof-overview-stat-card success">
                  <div className="prof-overview-stat-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="prof-overview-stat-content">
                    <h3>{editableCourse.etudiants}</h3>
                    <p>Étudiants</p>
                  </div>
                </div>
              </div>

              {/* Course Progress Overview */}
              <div className="prof-overview-progress-section">
                <div className="prof-content-section">
                  <div className="prof-section-header">
                    <h3>Progression du cours</h3>
                    <div className="prof-progress-summary">
                      <span className="prof-progress-percentage">78%</span>
                      <span className="prof-progress-label">Terminé</span>
                    </div>
                  </div>

                  <div className="prof-progress-bar">
                    <div className="prof-progress-fill" style={{ width: '78%' }}></div>
                  </div>

                  <div className="prof-progress-details">
                    <div className="prof-progress-item">
                      <span className="prof-progress-label">Contenu créé</span>
                      <span className="prof-progress-value">78%</span>
                    </div>
                    <div className="prof-progress-item">
                      <span className="prof-progress-label">Étudiants actifs</span>
                      <span className="prof-progress-value">85%</span>
                    </div>
                    <div className="prof-progress-item">
                      <span className="prof-progress-label">Taux de complétion moyen</span>
                      <span className="prof-progress-value">67%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Information Cards */}
              <div className="prof-overview-info-grid">
                <div className="prof-info-card">
                  <div className="prof-info-card-header">
                    <div className="prof-info-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <h4>Description du cours</h4>
                  </div>
                  <p className="prof-info-description">{editableCourse.description}</p>
                </div>

                <div className="prof-info-card">
                  <div className="prof-info-card-header">
                    <div className="prof-info-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      </svg>
                    </div>
                    <h4>Objectifs pédagogiques</h4>
                  </div>
                  <div className="prof-objectives-list">
                    {(editableCourse.objectif || '').split('\n').map((objectif, index) => (
                      objectif.trim() && (
                        <div key={index} className="prof-objective-item">
                          <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>{objectif.trim()}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div className="prof-content-section">
              <div className="prof-content-header">
                <div className="prof-content-header-info">
                  <h3>Vidéos du cours</h3>
                  <div className="prof-videos-stats">
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10,8 16,12 10,16 10,8"/>
                      </svg>
                      {editableCourse.videos.length} vidéos
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      {editableCourse.videos.reduce((total, video) => {
                        const duration = video.duration || '00:00';
                        const [minutes, seconds] = duration.split(':').map(Number);
                        return total + (minutes * 60) + (seconds || 0);
                      }, 0)} min total
                    </span>
                  </div>
                </div>
                <div className="prof-content-actions">
                  <button className="btn-secondary-outline" onClick={() => {}}>
                    <svg viewBox="0 0 24 24">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filtrer
                  </button>
                  <button className="btn-primary" onClick={() => setShowVideoModal(true)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Ajouter une vidéo
                  </button>
                </div>
              </div>

              <div className="prof-videos-grid">
                {editableCourse.videos.length === 0 ? (
                  <div className="prof-empty-state">
                    <div className="prof-empty-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10,8 16,12 10,16 10,8"/>
                      </svg>
                    </div>
                    <h4>Aucune vidéo disponible</h4>
                    <p>Commencez par ajouter votre première vidéo de cours</p>
                  </div>
                ) : (
                  editableCourse.videos.map(video => (
                    <div key={video.id} className="prof-video-card">
                      <div className="prof-video-thumbnail">
                        <div className="prof-video-play-overlay">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="10,8 16,12 10,16 10,8"/>
                          </svg>
                        </div>
                        <div className="prof-video-duration">{video.duration}</div>
                        <div className="prof-video-type-badge">
                          {video.type === 'youtube' ? 'YouTube' : 'Upload'}
                        </div>
                      </div>

                      <div className="prof-video-content">
                        <h4 className="prof-video-title">{video.title}</h4>
                        <div className="prof-video-meta">
                          <span className="prof-video-views">
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {video.views ?? 0} vues
                          </span>
                          <span className="prof-video-date">
                            Ajouté {formatDate(video.date)}
                          </span>
                        </div>
                        <p className="prof-video-description">
                          {video.description || 'Vidéo pédagogique pour accompagner le cours.'}
                        </p>
                      </div>

                      <div className="prof-video-actions">
                        <button className="prof-video-action-btn" title="Ouvrir la vidéo" onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}>
                          <svg viewBox="0 0 24 24">
                            <path d="M4 4l16 8-16 8z"/>
                          </svg>
                        </button>
                        <button className="prof-video-action-btn" title="Modifier">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                          </svg>
                        </button>
                        <button
                          className="prof-video-action-btn danger"
                          onClick={() => handleDeleteVideo(video.id)}
                          title="Supprimer"
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
                  ))
                )}
              </div>
            </div>
          )}

          {/* PDFs TAB */}
          {activeTab === 'pdfs' && (
            <div className="prof-content-section">
              <div className="prof-content-header">
                <div className="prof-content-header-info">
                  <h3>Documents du cours</h3>
                  <div className="prof-documents-stats">
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      {editableCourse.pdfs.length} documents
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      {editableCourse.pdfs.reduce((total, pdf) => total + parseNumber(pdf.size), 0).toFixed(1)} MB total
                    </span>
                  </div>
                </div>
                <div className="prof-content-actions">
                  <button className="btn-secondary-outline" onClick={() => {}}>
                    <svg viewBox="0 0 24 24">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filtrer
                  </button>
                  <button className="btn-primary" onClick={() => setShowPdfModal(true)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Ajouter un document
                  </button>
                </div>
              </div>

              <div className="prof-documents-grid">
                {editableCourse.pdfs.length === 0 ? (
                  <div className="prof-empty-state">
                    <div className="prof-empty-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <h4>Aucun document disponible</h4>
                    <p>Ajoutez vos premiers documents PDF pour enrichir votre cours</p>
                  </div>
                ) : (
                  editableCourse.pdfs.map(pdf => (
                    <div key={pdf.id} className="prof-document-card">
                      <div className="prof-document-header">
                        <div className="prof-document-icon">
                          <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                          </svg>
                        </div>
                        <div className="prof-document-type-badge">
                          PDF
                        </div>
                      </div>

                      <div className="prof-document-content">
                        <h4 className="prof-document-title">{pdf.title}</h4>
                        <div className="prof-document-meta">
                          <span className="prof-document-size">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            {pdf.size || 'N/A'}
                          </span>
                          <span className="prof-document-pages">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <line x1="10" y1="9" x2="8" y2="9"/>
                            </svg>
                            {pdf.pages ?? 'N/A'} pages
                          </span>
                        </div>
                        <div className="prof-document-stats">
                          <span className="prof-stat">
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {pdf.views ?? 0} vues
                          </span>
                          <span className="prof-stat">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            {pdf.downloads ?? 0} téléchargements
                          </span>
                        </div>
                        <p className="prof-document-description">
                          {pdf.description || 'Document pédagogique pour accompagner le cours.'}
                        </p>
                      </div>

                      <div className="prof-document-footer">
                        <div className="prof-document-date">
                          Ajouté {formatDate(pdf.date)}
                        </div>
                        <div className="prof-document-actions">
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={pdf.filename || pdf.title}
                            className="prof-document-action-btn"
                            title="Télécharger"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </a>
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="prof-document-action-btn"
                            title="Ouvrir dans le navigateur"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </a>
                          <button className="prof-document-action-btn" title="Modifier">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                          </button>
                          <button
                            className="prof-document-action-btn danger"
                            onClick={() => handleDeletePdf(pdf.id)}
                            title="Supprimer"
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
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="prof-content-section">
              <div className="prof-content-header">
                <div className="prof-content-header-info">
                  <h3>Quiz d'évaluation</h3>
                  <div className="prof-quizzes-stats">
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10,8 16,12 10,16 10,8"/>
                      </svg>
                      {editableCourse.quizzes.length} quiz
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5"/>
                        <path d="M19 11V9a2 2 0 0 0-2-2h-2.5"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                      {editableCourse.quizzes.reduce((total, quiz) => total + (quiz.attempts || 0), 0)} tentatives total
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                      {editableCourse.quizzes.length > 0 ? Math.round(editableCourse.quizzes.reduce((total, quiz) => total + (quiz.averageScore || 75), 0) / editableCourse.quizzes.length) : 0}% score moyen
                    </span>
                  </div>
                </div>
                <div className="prof-content-actions">
                  <button className="btn-secondary-outline" onClick={() => {}}>
                    <svg viewBox="0 0 24 24">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filtrer
                  </button>
                  <button className="btn-primary" onClick={() => setShowQuizModal(true)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Créer un quiz
                  </button>
                </div>
              </div>

              <div className="prof-quizzes-grid">
                {editableCourse.quizzes.length === 0 ? (
                  <div className="prof-empty-state">
                    <div className="prof-empty-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10,8 16,12 10,16 10,8"/>
                      </svg>
                    </div>
                    <h4>Aucun quiz disponible</h4>
                    <p>Créez votre premier quiz d'évaluation pour tester les connaissances de vos étudiants</p>
                  </div>
                ) : (
                  editableCourse.quizzes.map(quiz => (
                    <div key={quiz.id} className="prof-quiz-card">
                      <div className="prof-quiz-header">
                        <div className="prof-quiz-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="10,8 16,12 10,16 10,8"/>
                          </svg>
                        </div>
                        <div className="prof-quiz-status">
                          <span className={`prof-quiz-status-badge ${quiz.published ? 'published' : 'draft'}`}>
                            {quiz.published ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                      </div>

                      <div className="prof-quiz-content">
                        <h4 className="prof-quiz-title">{quiz.title}</h4>
                        <p className="prof-quiz-question">{quiz.question}</p>

                        <div className="prof-quiz-stats">
                          <div className="prof-quiz-stat">
                            <span className="prof-stat-label">Réponses</span>
                            <span className="prof-stat-value">{quiz.answers?.length || quiz.answersCount || 0}</span>
                          </div>
                          <div className="prof-quiz-stat">
                            <span className="prof-stat-label">Tentatives</span>
                            <span className="prof-stat-value">{quiz.attempts || 0}</span>
                          </div>
                          <div className="prof-quiz-stat">
                            <span className="prof-stat-label">Score moyen</span>
                            <span className="prof-stat-value">{quiz.averageScore || Math.floor(Math.random() * 30) + 70}%</span>
                          </div>
                          <div className="prof-quiz-stat">
                            <span className="prof-stat-label">Taux réussite</span>
                            <span className="prof-stat-value">{quiz.successRate || Math.floor(Math.random() * 40) + 60}%</span>
                          </div>
                        </div>

                        <div className="prof-quiz-answers-preview">
                          <h5>Réponses possibles ({quiz.answers?.length || 4}) :</h5>
                          <div className="prof-quiz-answers-list">
                            {quiz.answers?.slice(0, 3).map((answer, index) => (
                              <div key={index} className="prof-quiz-answer-item">
                                <span className="prof-answer-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="prof-answer-text">{answer}</span>
                              </div>
                            ))}
                            {(quiz.answers?.length || 4) > 3 && (
                              <div className="prof-quiz-answer-item more">
                                <span>+{(quiz.answers?.length || 4) - 3} autres...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {quiz.correctAnswer && (
                          <div className="prof-quiz-correct-answer">
                            <strong>Réponse correcte :</strong> {quiz.correctAnswer}
                          </div>
                        )}
                      </div>

                      <div className="prof-quiz-footer">
                        <div className="prof-quiz-date">
                          Créé {quiz.date || 'il y a 1 semaine'}
                        </div>
                        <div className="prof-quiz-actions">
                          <button className="prof-quiz-action-btn" title="Voir le quiz" onClick={() => showQuizDetail(quiz)}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button className="prof-quiz-action-btn" title="Modifier">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                          </button>
                          <button className="prof-quiz-action-btn danger" title="Supprimer">
                            <svg viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="prof-content-section">
              <div className="prof-content-header">
                <div className="prof-content-header-info">
                  <h3>Étudiants inscrits</h3>
                  <div className="prof-students-stats">
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {editableCourse.etudiants} étudiants
                    </span>
                  </div>
                </div>
                <div className="prof-content-actions">
                </div>
              </div>

              {/* Students Table */}
              <div className="prof-students-table-container">
                <table className="prof-students-table">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Filière</th>
                      <th>Niveau</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                          Chargement des étudiants...
                        </td>
                      </tr>
                    ) : courseStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                          Aucun étudiant inscrit à ce cours.
                        </td>
                      </tr>
                    ) : (
                      courseStudents.map((student) => (
                        <tr key={student.id}>
                          <td data-label="Étudiant">
                            <div className="prof-student-info">
                              <div className="prof-student-avatar">
                                {student.prenom.charAt(0).toUpperCase()}{student.nom.charAt(0).toUpperCase()}
                              </div>
                              <div className="prof-student-details">
                                <span className="prof-student-name">{student.prenom} {student.nom}</span>
                                <span className="prof-student-email">{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td data-label="Filière">{student.filiere || 'Non spécifié'}</td>
                          <td data-label="Niveau">{student.niveau || 'Non spécifié'}</td>
                          <td data-label="Actions">
                            <div className="prof-student-actions">
                              <button className="btn-icon warning" title="Suspendre">
                                <svg viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4" y1="12" x2="20" y2="12"/>
                                </svg>
                              </button>
                              <button className="btn-icon info" title="Envoyer un message">
                                <svg viewBox="0 0 24 24">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                              </button>
                              <Link to={`/prof/student-profile?id=${student.id}&source=prof`} className="btn-icon" title="Voir le profil">
                                <svg viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              </Link>
                              <button className="btn-icon danger" title="Supprimer du cours">
                                <svg viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="prof-content-section">
              <div className="prof-content-header">
                <div className="prof-content-header-info">
                  <h3>Ressources supplémentaires</h3>
                  <div className="prof-resources-stats">
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      {(editableCourse.resources || []).filter(r => r.type === 'pdf').length} PDF
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {(editableCourse.resources || []).filter(r => r.type === 'archive').length} Archives
                    </span>
                    <span className="prof-stat-item">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10,8 16,12 10,16 10,8"/>
                      </svg>
                      {(editableCourse.resources || []).filter(r => r.type === 'video').length} Vidéos
                    </span>
                  </div>
                </div>
                <div className="prof-content-actions">
                  <button className="btn-secondary-outline" onClick={() => {}}>
                    <svg viewBox="0 0 24 24">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filtrer
                  </button>
                  <button className="btn-primary" onClick={() => setShowResourceModal(true)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Ajouter une ressource
                  </button>
                </div>
              </div>

              <div className="prof-resources-grid">
                {(editableCourse.resources || []).length === 0 ? (
                  <div className="prof-empty-state">
                    <div className="prof-empty-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <h4>Aucune ressource disponible</h4>
                    <p>Ajoutez des documents, archives ou vidéos pour enrichir votre cours</p>
                  </div>
                ) : (
                  (editableCourse.resources || []).map(resource => (
                    <div key={resource.id} className="prof-resource-card">
                      <div className="prof-resource-header">
                        <div className="prof-resource-icon">
                          {resource.type === 'pdf' && (
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                          )}
                          {resource.type === 'archive' && (
                            <svg viewBox="0 0 24 24">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                              <polyline points="7.5 4.27 16.5 9.78"/>
                              <polyline points="7.5 19.73 16.5 14.22"/>
                              <polyline points="12 9.78 12 19.73"/>
                            </svg>
                          )}
                          {resource.type === 'video' && (
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <polygon points="10,8 16,12 10,16 10,8"/>
                            </svg>
                          )}
                        </div>
                        <div className="prof-resource-actions">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="prof-resource-action-btn"
                            title="Ouvrir dans le navigateur"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </a>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" download={resource.filename || resource.title} className="prof-resource-action-btn" title="Télécharger">
                            <svg viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </a>
                          <button className="prof-resource-action-btn danger" onClick={() => handleDeleteResource(resource.id)} title="Supprimer">
                            <svg viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="prof-resource-content">
                        <h4 className="prof-resource-title">{resource.title}</h4>
                        <div className="prof-resource-meta">
                          <span className={`prof-resource-type ${resource.type}`}>
                            {resource.type === 'pdf' && '📄 Document PDF'}
                            {resource.type === 'archive' && '📦 Archive ZIP'}
                            {resource.type === 'video' && '🎥 Vidéo'}
                          </span>
                          <span className="prof-resource-size">
                            {resource.size || 'N/A'}
                          </span>
                        </div>
                        <div className="prof-resource-description">
                          {resource.description || 'Ressource pédagogique pour accompagner le cours.'}
                        </div>
                      </div>

                      <div className="prof-resource-footer">
                        <div className="prof-resource-stats">
                          <span className="prof-stat">
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {resource.views ?? 0} vues
                          </span>
                          <span className="prof-stat">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            {resource.downloads ?? 0} téléchargements
                          </span>
                        </div>
                        <div className="prof-resource-date">
                          Ajouté {formatDate(resource.date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="prof-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Ajouter une vidéo</h3>
              <button className="prof-modal-close" onClick={() => setShowVideoModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="prof-modal-body">
              <div className="form-group">
                <label>Titre de la vidéo *</label>
                <input
                  type="text"
                  placeholder="ex. Introduction au chapitre 1"
                  value={newVideo.title}
                  onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type de vidéo *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="videoType"
                      value="youtube"
                      checked={newVideo.type === 'youtube'}
                      onChange={e => setNewVideo({...newVideo, type: e.target.value, file: null})}
                    />
                    <span>Lien YouTube</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="videoType"
                      value="upload"
                      checked={newVideo.type === 'upload'}
                      onChange={e => setNewVideo({...newVideo, type: e.target.value, url: ''})}
                    />
                    <span>Uploader ma vidéo</span>
                  </label>
                </div>
              </div>

              {newVideo.type === 'youtube' ? (
                <div className="form-group">
                  <label>URL YouTube *</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newVideo.url}
                    onChange={e => setNewVideo({...newVideo, url: e.target.value})}
                    required
                  />
                  <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                    La durée sera automatiquement détectée depuis YouTube
                  </small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Fichier vidéo *</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setNewVideo({...newVideo, file: e.target.files[0]})}
                    required
                  />
                  <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                    Formats acceptés: MP4, AVI, MOV (max 500MB)
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Durée (optionnel - sera détectée automatiquement)</label>
                <input
                  type="text"
                  placeholder="15:30"
                  value={newVideo.duration}
                  onChange={e => setNewVideo({...newVideo, duration: e.target.value})}
                />
              </div>

              <div className="prof-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowVideoModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Ajouter la vidéo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF MODAL */}
      {showPdfModal && (
        <div className="prof-modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Ajouter un document PDF</h3>
              <button className="prof-modal-close" onClick={() => setShowPdfModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddPdf} className="prof-modal-body">
              <div className="form-group">
                <label>Titre du document *</label>
                <input
                  type="text"
                  placeholder="ex. Guide complet du chapitre"
                  value={newPdf.title}
                  onChange={e => setNewPdf({...newPdf, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type de document *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="pdfType"
                      value="link"
                      checked={newPdf.type === 'link'}
                      onChange={e => setNewPdf({...newPdf, type: e.target.value, file: null})}
                    />
                    <span>Lien externe</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="pdfType"
                      value="upload"
                      checked={newPdf.type === 'upload'}
                      onChange={e => setNewPdf({...newPdf, type: e.target.value, url: ''})}
                    />
                    <span>Uploader mon PDF</span>
                  </label>
                </div>
              </div>

              {newPdf.type === 'link' ? (
                <div className="form-group">
                  <label>URL du document *</label>
                  <input
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={newPdf.url}
                    onChange={e => setNewPdf({...newPdf, url: e.target.value})}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Fichier PDF *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setNewPdf({...newPdf, file: e.target.files[0]})}
                    required
                  />
                  <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                    Format accepté: PDF (max 50MB)
                  </small>
                </div>
              )}

              <div className="prof-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPdfModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Ajouter le document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuizModal && (
        <div className="prof-modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Créer un nouveau quiz</h3>
              <button className="prof-modal-close" onClick={() => setShowQuizModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddQuiz} className="prof-modal-body">
              <div className="form-group">
                <label>Titre du quiz *</label>
                <input
                  type="text"
                  placeholder="ex. Quiz chapitre 1"
                  value={newQuiz.title}
                  onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Question *</label>
                <textarea
                  placeholder="Entrez votre question ici..."
                  value={newQuiz.question}
                  onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre de réponses possibles</label>
                <select
                  value={newQuiz.answersCount}
                  onChange={e => handleAnswersCountChange(e.target.value)}
                >
                  <option value="2">2 réponses</option>
                  <option value="3">3 réponses</option>
                  <option value="4">4 réponses</option>
                  <option value="5">5 réponses</option>
                  <option value="6">6 réponses</option>
                </select>
                <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                  Ou entrez manuellement le nombre: 
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newQuiz.answersCount}
                    onChange={e => handleAnswersCountChange(e.target.value)}
                    style={{ width: '60px', marginLeft: '8px', padding: '4px' }}
                  />
                </small>
              </div>

              <div className="form-group">
                <label>Réponses possibles *</label>
                {newQuiz.answers.map((answer, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Réponse ${index + 1}`}
                      value={answer}
                      onChange={e => {
                        const newAnswers = [...newQuiz.answers];
                        newAnswers[index] = e.target.value;
                        setNewQuiz({...newQuiz, answers: newAnswers});
                      }}
                      required
                    />
                  </div>
                ))}
                <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                  Au moins 2 réponses sont requises
                </small>
              </div>

              <div className="form-group">
                <label>Réponse correcte</label>
                <select
                  value={newQuiz.correctAnswer}
                  onChange={e => setNewQuiz({...newQuiz, correctAnswer: e.target.value})}
                >
                  <option value="">Aucune sélectionnée</option>
                  {newQuiz.answers.map((answer, index) => (
                    <option key={index} value={answer.trim()}>
                      {answer.trim() ? `Réponse ${index + 1} - ${answer}` : `Réponse ${index + 1}`}
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--gray)', fontSize: '12px' }}>
                  Choisissez la réponse correcte parmi les propositions.
                </small>
              </div>

              <div className="prof-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowQuizModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer le quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE MODAL */}
      {showResourceModal && (
        <div className="prof-modal-overlay" onClick={() => setShowResourceModal(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Ajouter une ressource</h3>
              <button className="prof-modal-close" onClick={() => setShowResourceModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddResource} className="prof-modal-body">
              <div className="form-group">
                <label>Titre de la ressource *</label>
                <input
                  type="text"
                  placeholder="ex. Guide pratique du management"
                  value={newResource.title}
                  onChange={e => setNewResource({...newResource, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type de ressource *</label>
                <select
                  value={newResource.type}
                  onChange={e => setNewResource({...newResource, type: e.target.value, url: '', file: null})}
                >
                  <option value="pdf">Document PDF</option>
                  <option value="archive">Archive (ZIP)</option>
                  <option value="video">Vidéo</option>
                </select>
              </div>

              {newResource.type === 'pdf' && (
                <>
                  <div className="form-group">
                    <label>Fichier PDF ou lien *</label>
                    <input
                      type="url"
                      placeholder="https://exemple.com/document.pdf"
                      value={newResource.url}
                      onChange={e => setNewResource({...newResource, url: e.target.value})}
                    />
                    <span style={{ color: 'var(--gray)', fontSize: '12px' }}>
                      Vous pouvez soit fournir un lien externe, soit uploader un fichier PDF.
                    </span>
                  </div>
                  <div className="form-group">
                    <label>Uploader un PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => setNewResource({...newResource, file: e.target.files[0]})}
                    />
                  </div>
                </>
              )}

              {newResource.type === 'archive' && (
                <div className="form-group">
                  <label>Fichier ZIP / RAR / 7Z *</label>
                  <input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={e => setNewResource({...newResource, file: e.target.files[0]})}
                    required
                  />
                </div>
              )}

              {newResource.type === 'video' && (
                <div className="form-group">
                  <label>Lien de la vidéo *</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newResource.url}
                    onChange={e => setNewResource({...newResource, url: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="prof-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowResourceModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Ajouter la ressource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuizDetailModal && quizDetail && (
        <div className="prof-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeQuizDetail()}>
          <div className="prof-modal">
            <div className="prof-modal-header">
              <h3>Détails du quiz</h3>
              <button className="prof-modal-close" onClick={closeQuizDetail}>✕</button>
            </div>
            <div className="prof-modal-body">
              <div className="prof-quiz-detail">
                <h4>{quizDetail.title}</h4>
                <p><strong>Question :</strong> {quizDetail.question}</p>
                <div className="prof-quiz-detail-answers">
                  {quizDetail.answers?.map((answer, index) => (
                    <div key={index} className="prof-quiz-answer-item">
                      <span className="prof-answer-letter">{String.fromCharCode(65 + index)}</span>
                      <span>{answer}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', color: 'var(--gray)' }}>
                  {quizDetail.correctAnswer ? `Réponse correcte : ${quizDetail.correctAnswer}` : 'Aucune réponse correcte définie.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursDetailProf;