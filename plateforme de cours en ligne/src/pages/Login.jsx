import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', response.user.role);
      alert('Connexion réussie !');
      
      // Redirection basée sur le rôle
      switch (response.user.role) {
        case 'admin':
          navigate('/admin-accueil');
          break;
        case 'instructor':
          navigate('/prof-accueil');
          break;
        case 'student':
        default:
          navigate('/accueil');
          break;
      }
    } catch (error) {
      alert(error.message || 'Impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #2d90b4f6 0%, #000000 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="container">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="logo-text">Platetude</span>
        </div>

        <h2>Bon retour</h2>
        <p className="subtitle">Connectez-vous pour continuer votre apprentissage</p>

        <div className="form-group">
          <div className={`floating-input-container ${email || emailFocused ? 'active' : ''}`}>
            <input
              type="email"
              id="email"
              className="floating-input-field"
              value={email}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email" className="floating-input-label">
              Email
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className={`floating-input-container ${password || passwordFocused ? 'active' : ''}`}>
            <input
              type="password"
              id="password"
              className="floating-input-field"
              value={password}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password" className="floating-input-label">
              Mot de passe
            </label>
          </div>
        </div>

        <Link to="#" className="forgot">Mot de passe oublié ?</Link>

        <button className="login-btn" onClick={handleLogin}>Se connecter</button>

        <div className="divider">ou</div>

        <p className="register-link">Pas encore de compte ? <Link to="/registre">S'inscrire gratuitement</Link></p>
      </div>
    </div>
  );
};

export default Login;