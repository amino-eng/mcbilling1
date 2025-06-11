import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BiSearch, BiUserCircle, BiLogOut } from "react-icons/bi";
import { logout, getCurrentUser } from "../utils/auth";
import img from "../img/WhatsApp Image 2025-06-09 at 10.05.37.jpeg"
const Navbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  // État pour la langue (par défaut : anglais)
  const [language, setLanguage] = useState("en");
  
  // Load user data from localStorage
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Objet de traductions
  const translations = {
    en: {
      searchPlaceholder: "Search...",
      profile: "My Profile",
      logout: "Log Out",
      username: "root",
    },
    fr: {
      searchPlaceholder: "Rechercher...",
      profile: "Mon Profil",
      logout: "Se Déconnecter",
      username: "root",
    },
  };

  // Fonction pour basculer la langue
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "fr" : "en"));
  };

  // Récupérer les traductions en fonction de la langue actuelle
  const t = translations[language];
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-light bg-light shadow-sm px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
      <h4 className="mb-5 text-center text-primary fw-bold">
        <i className="bi bi-grid-fill me-2"></i> MCBILLING
      </h4>

        {/* Bouton de traduction */}
        <button
          className="btn btn-light me-3 rounded-pill"
          onClick={toggleLanguage}
          style={{ border: "1px solid #ddd", padding: "8px 16px" }}
        >
          {language === "en" ? "FR" : "EN"}
        </button>
        
        {/* User Profile */}
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle d-flex align-items-center rounded-pill"
            type="button"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ border: "1px solid #ddd", padding: "8px 16px" }}
          >
            <img
              src={img}
             
              className="rounded-circle me-2"
              style={{ width: "60px", height: "60px" }}
            />
            <span className="fw-medium">{userData?.username || t.username}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
            <li>
              <Link className="dropdown-item d-flex align-items-center" to="/profile">
                <BiUserCircle className="me-2" size={18} />
                {t.profile}
              </Link>
            </li>
            <li>
              <button 
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={handleLogout}
              >
                <BiLogOut className="me-2" size={18} />
                {t.logout}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;