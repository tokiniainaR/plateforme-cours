import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import examService from '../services/examService';

const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const ExamContent = () => {
  const { id } = useParams();
  const examId = parseInt(id, 10);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(exam?.durationMinutes ? exam.durationMinutes * 60 : 0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState({});
  const [fileAnswers, setFileAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(exam?.statut === 'en-cours');

  if (!examId || isNaN(examId)) {
    return (
      <div className="main-content exam-content-page">
        <p>Examen introuvable.</p>
        <Link to="/examens" className="back-btn exam-content-back">Retour aux examens</Link>
      </div>
    );
  }

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const [examData, questionsData] = await Promise.all([
          examService.getExamById(examId),
          examService.getExamQuestions(examId)
        ]);
        
        setExam(examData);
        setQuestions(questionsData || []);
        
        // Calculate duration in minutes and convert to seconds
        const durationMinutes = examData?.duration ? parseInt(examData.duration.split(' ')[0]) : 30;
        setTimeLeft(durationMinutes * 60);
        
        // Check if exam is currently active
        const now = new Date();
        const startDate = examData?.start_date ? new Date(examData.start_date) : null;
        const endDate = examData?.end_date ? new Date(examData.end_date) : null;
        
        const isActive = startDate && endDate && now >= startDate && now <= endDate;
        setStarted(isActive);
        
      } catch (error) {
        console.error('Erreur lors du chargement de l\'examen:', error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  useEffect(() => {
    let timer = null;
    if (started && timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [started, timeLeft, submitted]);

  const handleSubmit = async () => {
    if (submitted) return;
    
    try {
      // Prepare answers in the format expected by backend
      const formattedAnswers = {};
      questions.forEach((question, index) => {
        const questionKey = `q${index + 1}`;
        if (answers[questionKey]) {
          formattedAnswers[question.id] = answers[questionKey];
        } else if (freeText[questionKey]) {
          formattedAnswers[question.id] = freeText[questionKey];
        }
      });
      
      await examService.submitExam(examId, Object.values(formattedAnswers));
      setSubmitted(true);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission de l\'examen.');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement de l'examen…</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="main-content">
        <div className="not-found">
          <h2>Examen introuvable</h2>
          <p>Nous n’avons pas trouvé cet examen. <Link to="/examens">Retour aux examens</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content exam-content-page">
      <Link to="/examens" className="back-btn exam-content-back">
        &larr; Retour aux examens
      </Link>

      <div className="exam-overview-card">
        <div>
          <h1>{exam.title}</h1>
          <p className="exam-overview-meta">Cours : {exam.course_title || 'N/A'} / Durée : {exam.duration}</p>
          <p className="exam-overview-meta">État : {started ? 'En cours' : 'Non commencé'}</p>
          {started && timeLeft > 0 && (
            <p className="exam-timer">Temps restant : {formatSeconds(timeLeft)}</p>
          )}
        </div>
      </div>

      {!started ? (
        <div className="exam-section-card" style={{ border: '1px solid #93C5FD', background: '#EFF6FF' }}>
          <h3>Examen non démarré</h3>
          <p>Vous pouvez démarrer l'examen quand vous êtes prêt.</p>
          <button
            className="exam-submit-btn"
            onClick={() => setStarted(true)}
          >
            Démarrer l'examen
          </button>
        </div>
      ) : null}

      {started && (
        <>
          <div className="exam-content-list">
            {questions.map((question, index) => {
              const questionKey = `q${index + 1}`;
              const selectedAnswer = answers[questionKey];
              
              return (
                <article key={question.id} className="exam-section-card">
                  <h3>Question {index + 1}</h3>
                  <p className="exam-question-text"><strong>{question.question_text}</strong></p>
                  
                  {question.question_type === 'multiple-choice' && question.options && question.options.length > 0 && (
                    <ul className="exam-question-options">
                      {question.options.map((opt, oidx) => {
                        const isSelected = selectedAnswer === opt;
                        const optionClass = `exam-option ${isSelected ? 'selected' : ''}`;
                        return (
                          <li key={oidx} className={optionClass}>
                            <button
                              type="button"
                              onClick={() => {
                                if (submitted) return;
                                setAnswers(prev => ({ ...prev, [questionKey]: opt }));
                              }}
                              className="exam-option-btn"
                            >
                              {opt}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  
                  {(question.question_type === 'short-answer' || question.question_type === 'essay') && (
                    <textarea
                      className="exam-textarea"
                      value={freeText[questionKey] || ''}
                      onChange={e => setFreeText(prev => ({ ...prev, [questionKey]: e.target.value }))}
                      placeholder="Tapez votre réponse ici..."
                      disabled={submitted}
                    />
                  )}
                  
                  {submitted && (
                    <p className="exam-feedback">Réponse enregistrée. En attente de correction par le formateur.</p>
                  )}
                </article>
              );
            })}
          </div>

          {!submitted && (
            <div className="exam-submit-section">
              <button
                className="exam-submit-btn"
                onClick={handleSubmit}
              >
                Soumettre l'examen
              </button>
            </div>
          )}

          {submitted && (
            <div className="exam-section-card" style={{ border: '1px solid #10B981', background: '#ECFDF5' }}>
              <h3>Examen soumis</h3>
              <p>Votre examen a été soumis avec succès. Vous recevrez votre note une fois corrigé par le formateur.</p>
              <Link to="/examens" className="exam-submit-btn">
                Retour aux examens
              </Link>
            </div>
          )}

          <button className="floating-timer">
            {submitted || timeLeft === 0 ? 'Examen terminé' : `Temps restant: ${formatSeconds(timeLeft)}`}
          </button>
        </>
      )}
    </div>
  );
};

export default ExamContent;
