import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import courseService from '../services/courseService';
import authService from '../services/authService';
import questionService from '../services/questionService';
import AvatarFromName from '../components/AvatarFromName';

const CourseDetail = () => {
  const { id } = useParams();
  const courseId = parseInt(id, 10);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  if (!courseId || isNaN(courseId)) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Cours introuvable</h1>
          <p>L'identifiant du cours est invalide. Vérifiez l'URL.</p>
          <Link to="/cours" className="btn btn-primary">Retour aux cours</Link>
        </div>
      </div>
    );
  }

  const getCourseLevels = (niveau) => {
    if (!niveau) return [];
    if (Array.isArray(niveau)) return niveau.map((n) => String(n).trim()).filter(Boolean);
    return String(niveau).split(',').map((level) => level.trim()).filter(Boolean);
  };

  const courseSupportsLevel = (course, niveau) => {
    const levels = getCourseLevels(course?.niveau);
    const target = String(niveau || '').toLowerCase();
    return levels.some((level) => String(level).toLowerCase() === target);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, currentUser] = await Promise.all([
          courseService.getCourseById(courseId),
          authService.getCurrentUser().catch(() => null)
        ]);

        if (!courseData) {
          setAccessError('Cours introuvable.');
          setCourse(null);
          setUser(currentUser?.user || currentUser || null);
          return;
        }

        setCourse(courseData);
        setUser(currentUser?.user || currentUser || null);

        if (currentUser && currentUser.user && currentUser.user.role === 'student') {
          const userData = currentUser.user;
          if (
            String(courseData.filiere).toLowerCase() !== String(userData.filiere).toLowerCase() ||
            !courseSupportsLevel(courseData, userData.niveau)
          ) {
            setAccessError('Ce cours n’est pas accessible pour votre filière ou votre niveau.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        setAccessError('Erreur lors du chargement du cours.');
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);


  const isYouTubeUrl = (url) => typeof url === 'string' && /(youtu\.be|youtube\.com)/i.test(url);
  const getYoutubeEmbedUrl = (url) => {
    if (!url || !isYouTubeUrl(url)) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    const videoId = match ? match[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const safeVideos = Array.isArray(course?.videos) ? course.videos : [];
  const safePdfs = Array.isArray(course?.pdfs) ? course.pdfs : [];
  const safeQuizzes = Array.isArray(course?.quizzes) ? course.quizzes : [];
  const safeResources = Array.isArray(course?.resources) ? course.resources : [];
  const safeEtudiants = Number.isFinite(course?.etudiants) ? course.etudiants : 0;
  const reflectionQuestion = course?.reflectionQuestion || 'Citez les trois principaux outils ou méthodes de gestion de projet que vous connaissez.';

  const courseChapters = useMemo(() => {
    if (safeVideos.length) {
      return [
        {
          id: 1,
          title: 'Vidéos du cours',
          lessons: safeVideos.map((video, index) => ({
            id: video.id || `video-${index + 1}`,
            title: video.title || `Vidéo ${index + 1}`,
            duration: video.duration || '00:00',
            type: video.type || (isYouTubeUrl(video.url) ? 'youtube' : 'video'),
            src: isYouTubeUrl(video.url)
              ? getYoutubeEmbedUrl(video.url)
              : (video.url || video.src || ''),
            completed: video.completed || false
          }))
        }
      ];
    }

    return [];
  }, [safeVideos]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [videoModal, setVideoModal] = useState({ show: false, src: '' });

  useEffect(() => {
    if (safeVideos.length) {
      const firstVideo = safeVideos[0];
      const type = firstVideo.type || (isYouTubeUrl(firstVideo.url) ? 'youtube' : 'video');
      const firstSrc = type === 'youtube'
        ? getYoutubeEmbedUrl(firstVideo.url)
        : (firstVideo.url || firstVideo.src || '');

      if (!firstSrc) {
        setSelectedVideo(null);
        return;
      }

      console.log('Loaded course video source:', firstSrc);

      setSelectedVideo({
        id: firstVideo.id || 'video-1',
        title: firstVideo.title || course?.title || 'Vidéo',
        duration: firstVideo.duration || '00:00',
        type,
        src: firstSrc,
        completed: firstVideo.completed || false
      });
    } else {
      setSelectedVideo(null);
    }
  }, [safeVideos, course]);

  const currentQuiz = safeQuizzes[activeQuizIndex] || safeQuizzes[0] || null;
  const quizQuestion = currentQuiz?.question || 'Aucun quiz enregistré pour ce cours.';
  const quizOptions = currentQuiz?.answers || [];
  const correctAnswer = currentQuiz?.correctAnswer || currentQuiz?.answers?.[0] || '';
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canShowControls, setCanShowControls] = useState(typeof window !== 'undefined' ? window.innerWidth > 520 : true);
  const videoRef = useRef(null);
  const [qaList, setQaList] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [reflection, setReflection] = useState('');
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [selectedVideo]);

  useEffect(() => {
    const onResize = () => setCanShowControls(window.innerWidth > 520);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  const handleAnswer = (btn, choice) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    
    const correct = correctAnswer;
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(b => b.disabled = true);
    
    const quizResult = document.getElementById('quiz-result');
    if (choice === correct) {
      btn.classList.add('correct');
      quizResult.innerHTML = '<span style="color:#059669;">✓ Correct ! Le diagramme de Gantt est l\'outil de référence pour la planification.</span>';
    } else {
      btn.classList.add('wrong');
      allBtns.forEach(b => { if (b.textContent.includes('Gantt')) b.classList.add('correct'); });
      quizResult.innerHTML = '<span style="color:#DC2626;">✗ Pas tout à fait. La bonne réponse est le Diagramme de Gantt.</span>';
    }
  };

  const submitReflection = () => {
    if (!reflection.trim()) {
      alert('Écrivez votre réponse.');
      return;
    }
    setReflectionSubmitted(true);
  };

  const addQuestion = async () => {
    if (!newQuestion.trim()) {
      alert('Écrivez votre question.');
      return;
    }

    try {
      await questionService.createQuestion({
        course_id: courseId,
        content: newQuestion
      });
      alert('Votre question a été envoyée au formateur.');
      setNewQuestion('');
      // Optionally refresh questions or show success message
    } catch (err) {
      console.error('Error creating question:', err);
      alert('Erreur lors de l\'envoi de la question. Veuillez réessayer.');
    }
  };

  const openVideo = (video) => {
    if (!video || (typeof video === 'object' && !(video.url || video.src))) {
      console.warn('Aucune vidéo valide à ouvrir.', video);
      return;
    }

    const selected = {
      ...video,
      type: video.type || (isYouTubeUrl(video.url) ? 'youtube' : 'video'),
      src: video.type === 'youtube'
        ? getYoutubeEmbedUrl(video.url)
        : (video.url || video.src || '')
    };

    if (!selected.src) {
      console.warn('Aucun URL de vidéo valide trouvé pour la vidéo sélectionnée.', selected);
      return;
    }

    console.log('Selected course video source:', selected.src);

    if (window.innerWidth <= 520) {
      setVideoModal({ show: true, src: selected.src });
      setSelectedVideo(selected);
      return;
    }

    setSelectedVideo(selected);
    setVideoModal({ show: false, src: '' });
    setIsPlaying(false);
    setProgress(0);
  };

  const closeVideo = () => {
    setVideoModal({ show: false, src: '' });
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    setProgress(pct * 100);
  };

  const toggleChapter = (id) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1>Chargement du cours…</h1>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1>Accès refusé</h1>
          <p>{accessError}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Ce cours est introuvable</h1>
          <p>{accessError || 'Le cours demandé n’a pas pu être chargé. Vérifiez l’URL ou revenez à la liste des cours.'}</p>
          <Link to="/cours" className="btn btn-primary">Retour aux cours</Link>
        </div>
      </div>
    );
  }

  const formateur = {
    nom: course.formateurName || 'Formateur',
    specialite: course.filiere || course.matiere || '',
    avatar: `https://i.pravatar.cc/60?u=${course.formateurId || 'instructor'}`
  };


  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement du cours…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Cours introuvable.</p>
          <Link to="/cours" className="btn btn-primary">Retour aux cours</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Link to="/cours" className="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour aux cours
      </Link>

      <div className="course-layout" style={{ display: 'grid' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <div className="course-header-card">
            <div className="course-header-left">
              <h1 id="course-detail-title">{course.title}</h1>
              <p id="course-detail-desc">{course.description}</p>
              <div className="course-meta-chips">
                <span className="meta-chip">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span id="course-detail-duration">{course.duree}</span> de contenu
                </span>
                <span className="meta-chip">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <span id="course-detail-videos">{course.videos?.length || 0}</span> vidéos
                </span>
                <span className="meta-chip">
                  <svg viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span id="course-detail-students">{safeEtudiants}</span> étudiants
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary"
                  style={{ 
                    padding: '10px 20px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Description & Objectifs
                </button>
              </div>
            </div>
            <Link to={`/formateur?id=${course.formateurId}`} className="course-header-right" style={{ textDecoration: 'none' }}>
              <span style={{color: '#FFFFFF' }}> Formateur</span>
              <div style={{ margin: '8px auto', display: 'block' }}>
                <AvatarFromName name={formateur.nom} size="medium" />
              </div>
              <strong id="course-trainer-name" style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{formateur.nom}</strong>
            </Link>
          </div>
        </div>

        <div className="course-layout card" style={{ gridColumn: '1/-1' }}>
          <div className="left-panel">
            <div className="course-video-main-card">
              <div className="video-frame">
                {selectedVideo ? (
                  selectedVideo.type === 'youtube' ? (
                    <iframe
                      title={selectedVideo?.title || 'Vidéo YouTube'}
                      src={selectedVideo?.src}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', borderRadius: '16px', border: 'none' }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      key={selectedVideo?.src ?? 'default'}
                      src={selectedVideo?.src || ''}
                      controls={canShowControls}
                      style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }}
                      onClick={togglePlayPause}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  )
                ) : (
                  <div className="empty-course-video" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Aucune vidéo disponible</div>
                    <p style={{ maxWidth: '320px', textAlign: 'center' }}>Le formateur n'a pas encore ajouté de vidéo à ce cours. Revenez plus tard ou contactez le formateur pour plus d'informations.</p>
                  </div>
                )}
                {selectedVideo?.type !== 'youtube' && selectedVideo && (
                  <>
                    <button className="video-playback-button" onClick={togglePlayPause} style={{ display: isPlaying ? 'none' : 'flex' }}>
                      {isPlaying ? (
                        <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21"/></svg>
                      )}
                    </button>
                    <div className="video-progress-bar" onClick={handleProgressClick}>
                      <div className="video-progress-filled" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                )}
              </div>

              <div className="video-meta-card">
                <div className="lesson-now-header">
                  <span className="lesson-now-badge">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21"/></svg>
                    Leçon en cours
                  </span>
                  {selectedVideo?.duration && (
                    <span className="lesson-now-duration">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {selectedVideo.duration}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.3 }}>
                  {selectedVideo?.title || course.title}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--gray)', lineHeight: 1.6, margin: 0 }}>
                  {course.description}
                </p>
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                <div className="video-meta-row">
                  <div className="instructor-chip">
                    <AvatarFromName name={formateur.nom} size="small" />
                    <div>
                      <strong>{formateur.nom}</strong>
                      <span>{formateur.specialite}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="outline-header">Contenu du cours</div>
            <div className="outline-scroll">
              {courseChapters.length > 0 ? (
                courseChapters.map((chapter) => {
                  const open = expandedChapters[chapter.id];
                  const completedCount = chapter.lessons.filter(l => l.completed).length;
                  return (
                    <div key={chapter.id} className="chapter-item">
                    <button className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                      <div className="chapter-header-info">
                        <span className="chapter-num">{chapter.id}</span>
                        <div>
                          <strong>{chapter.title}</strong>
                          <small>{completedCount}/{chapter.lessons.length} vidéo{chapter.lessons.length > 1 ? 's' : ''}</small>
                        </div>
                      </div>
                      <span className={`arrow ${open ? 'open' : ''}`}>›</span>
                    </button>
                    {open && (
                      <div className="lesson-rows">
                        {chapter.lessons.map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            className={`lesson-row ${selectedVideo?.id === lesson.id ? 'active' : ''}`}
                            onClick={() => openVideo(lesson)}
                          >
                            <div className="lesson-status-icon">
                              {lesson.completed ? (
                                <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', stroke: '#10B981', fill: 'none', strokeWidth: 2.5 }}>
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M8 12l3 3 5-5"/>
                                </svg>
                              ) : (
                                <span className="lesson-num-circle">{idx + 1}</span>
                              )}
                            </div>
                            <div className="lesson-text">
                              <strong>{lesson.title}</strong>
                            </div>
                            <span className="lesson-dur">{lesson.duration}</span>
                            <span className="lesson-chev">›</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
              ) : (
                <div className="course-empty-content" style={{ padding: '24px', color: 'var(--gray)' }}>
                  <h4>Aucun contenu de vidéo n'a encore été ajouté à ce cours.</h4>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LEFT COLUMN */}
        <div>
          <div className="card">
            <div className="card-title">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Documents PDF
            </div>
            <div className="download-list">
              {safePdfs.length > 0 ? (
                safePdfs.map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf.url || '#'}
                    download={pdf.url?.endsWith('.pdf')}
                    className="download-item"
                  >
                    <div className="download-item-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="download-item-info">
                      <strong>{pdf.title || `Document ${index + 1}`}</strong>
                      <span>{pdf.description || 'Document de cours'}</span>
                    </div>
                    <span className="download-item-btn">Télécharger</span>
                  </a>
                ))
              ) : (
                <div className="download-empty">Aucun document disponible pour ce cours.</div>
              )}
            </div>
          </div>

          <div className="card" id="quiz">
            <div className="card-title">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Quiz rapide
            </div>
            {safeQuizzes.length > 1 && (
              <div className="quiz-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {safeQuizzes.map((quiz, idx) => (
                  <button
                    key={quiz.id || idx}
                    type="button"
                    className={`quiz-tab ${activeQuizIndex === idx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveQuizIndex(idx);
                      setQuizAnswered(false);
                    }}
                    style={{ padding: '8px 12px', border: activeQuizIndex === idx ? '1px solid var(--primary)' : '1px solid var(--border)', borderRadius: '999px', background: activeQuizIndex === idx ? 'var(--primary)' : 'transparent', color: activeQuizIndex === idx ? '#fff' : 'inherit', cursor: 'pointer' }}
                  >
                    {quiz.title || `Quiz ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
            <p className="quiz-question">{quizQuestion}</p>
            <div className="quiz-options">
              {quizOptions.map((answer, index) => (
                <button
                  key={index}
                  className="quiz-option"
                  onClick={(e) => handleAnswer(e.currentTarget, answer)}
                  disabled={quizAnswered}
                >
                  {answer}
                </button>
              ))}
            </div>
            <div id="quiz-result">{!currentQuiz && <span style={{ color: 'var(--gray)' }}>Aucun quiz enregistré pour ce cours.</span>}</div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="card" id="resources">
            <div className="card-title">
              <svg viewBox="0 0 24 24">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              Ressources
            </div>
            <ul className="resource-list">
              {safeResources.length > 0 ? (
                safeResources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url || '#'} download={resource.type === 'pdf' || resource.url?.endsWith('.pdf')}>
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {resource.title || `Ressource ${index + 1}`} — {resource.type === 'pdf' ? 'Télécharger' : resource.type === 'video' ? 'Voir' : 'Télécharger'}
                    </a>
                  </li>
                ))
              ) : (
                <li>Aucune ressource disponible pour ce cours.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL VIDEO */}
      {videoModal.show && (
        <div className="modal" style={{ display: 'flex' }} onClick={(e) => e.target === e.currentTarget && closeVideo()}>
          <div className="modal-content">
            <button className="close-modal" onClick={closeVideo}>✕</button>
            <video id="modalVideo" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}>
              <source src={videoModal.src} type="video/mp4" />
            </video>
          </div>
        </div>
      )}

      {/* MODAL DESCRIPTION ET OBJECTIFS */}
      {showModal && (
        <div 
          className="modal" 
          style={{ 
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            alignItems: 'center',
            justifyContent: 'center'
          }} 
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div 
            className="modal-content course-modal"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}
          >
            <button 
              className="close-modal" 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              marginBottom: '20px', 
              color: '#1e293b',
              borderBottom: '3px solid #3b82f6',
              paddingBottom: '12px'
            }}>
              Description et Objectifs du Cours
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Description du cours
              </h3>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#475569',
                margin: 0
              }}>
                {course.description || 'Aucune description disponible pour ce cours.'}
              </p>
            </div>
            
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Objectifs pédagogiques
              </h3>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#475569',
                margin: 0
              }}>
                {course.objectif || 'Aucun objectif pédagogique défini pour ce cours.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;