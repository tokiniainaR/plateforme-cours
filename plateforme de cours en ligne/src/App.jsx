import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SidebarProf from './components/SidebarProf';
import SidebarAdmin from './components/SidebarAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteProf from './components/ProtectedRouteProf';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import Accueil from './pages/Accueil';
import Cours from './pages/Cours';
import ExplorerCours from './pages/ExplorerCours';
import CourseDetail from './pages/CourseDetail';
import Examens from './pages/Examens';
import ExamContent from './pages/ExamContent';
import Formateur from './pages/Formateur';
import Login from './pages/Login';
import Modification from './pages/Modification';
import Profil from './pages/Profil';
import Registre from './pages/Registre';
import DashboardProf from './pages/DashboardProf';
import CoursProf from './pages/CoursProf';
import ExamensProf from './pages/ExamensProf';
import ProfilProf from './pages/ProfilProf';
import ModificationProf from './pages/ModificationProf';
import CoursDetailProf from './pages/CoursDetailProf';
import StudentProfile from './pages/StudentProfile';
import DashboardAdmin from './pages/DashboardAdmin';
import GestionCompteAdmin from './pages/GestionCompteAdmin';
import CoursAdmin from './pages/CoursAdmin';
import ExamensAdmin from './pages/ExamensAdmin';
import ExamensCopiesProf from './pages/ExamensCopiesProf';
import './styles/globalProf.css';
import './styles/globalAdmin.css';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Pages sans sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/registre" element={<Registre />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Pages étudiant avec sidebar protégées */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/accueil"
            element={
              <>
                <Sidebar />
                <Accueil />
              </>
            }
          />
          <Route
            path="/cours"
            element={
              <>
                <Sidebar />
                <Cours />
              </>
            }
          />
          <Route
            path="/explorer-cours"
            element={
              <>
                <Sidebar />
                <ExplorerCours />
              </>
            }
          />
          <Route
            path="/course-detail/:id"
            element={
              <>
                <Sidebar />
                <CourseDetail />
              </>
            }
          />
          <Route
            path="/examens"
            element={
              <>
                <Sidebar />
                <Examens />
              </>
            }
          />
          <Route
            path="/exam-content/:id"
            element={
              <>
                <Sidebar />
                <ExamContent />
              </>
            }
          />
          <Route
            path="/formateur"
            element={
              <>
                <Sidebar />
                <Formateur />
              </>
            }
          />
          <Route
            path="/modification"
            element={
              <>
                <Sidebar />
                <Modification />
              </>
            }
          />
          <Route
            path="/profil"
            element={
              <>
                <Sidebar />
                <Profil />
              </>
            }
          />
        </Route>

        {/* Pages formateur avec sidebar protégées */}
        <Route element={<ProtectedRouteProf />}>
          <Route
            path="/prof-accueil"
            element={
              <>
                <SidebarProf />
                <DashboardProf />
              </>
            }
          />
          <Route
            path="/prof-cours"
            element={
              <>
                <SidebarProf />
                <CoursProf />
              </>
            }
          />
          <Route
            path="/prof-cours-detail"
            element={
              <>
                <SidebarProf />
                <CoursDetailProf />
              </>
            }
          />
          <Route
            path="/prof-examens"
            element={
              <>
                <SidebarProf />
                <ExamensProf />
              </>
            }
          />
          <Route
            path="/prof-examens-copies"
            element={
              <>
                <SidebarProf />
                <ExamensCopiesProf />
              </>
            }
          />
          <Route
            path="/prof-profil"
            element={
              <>
                <SidebarProf />
                <ProfilProf />
              </>
            }
          />
          <Route
            path="/prof-modification"
            element={
              <>
                <SidebarProf />
                <ModificationProf />
              </>
            }
          />
          <Route
            path="/prof/student-profile"
            element={
              <>
                <SidebarProf />
                <StudentProfile />
              </>
            }
          />
        </Route> 

      
        {/* Pages administrateur avec sidebar protégées */}
        <Route element={<ProtectedRouteAdmin />}>
          <Route
            path="/admin-accueil"
            element={
              <>
                <SidebarAdmin />
                <DashboardAdmin />
              </>
            }
          />
          <Route
            path="/admin-comptes"
            element={
              <>
                <SidebarAdmin />
                <GestionCompteAdmin />
              </>
            }
          />
          <Route
            path="/admin-cours"
            element={
              <>
                <SidebarAdmin />
                <CoursAdmin />
              </>
            }
          />
          <Route
            path="/admin-examens"
            element={
              <>
                <SidebarAdmin />
                <ExamensAdmin />
              </>
            }
          />
          <Route
            path="/admin/student-profile"
            element={
              <>
                <SidebarAdmin />
                <StudentProfile />
              </>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;