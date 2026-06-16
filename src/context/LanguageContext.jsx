import React, { createContext, useState, useContext, useEffect } from 'react';

// Diccionario de traducciones básico
const translations = {
  en: {
    'brand': 'Nexbit',
    'nav.product': 'Dashboard',
    'nav.management': 'Management',
    'nav.useCases': 'Store',
    'nav.resources': 'Resources',
    'nav.adminProfile': 'Admin Profile',
    'nav.myAccount': 'My Account',
    'nav.signOut': 'Sign Out',
    'nav.login': 'Log In',
    'hero.title.1': 'Experience liftoff with',
    'hero.title.2': 'the next-generation',
    'hero.title.span': 'storefront',
    'hero.subtitle.auth': 'Welcome back, {name}. Explore the tools designed to optimize your workflow in this new agent-first era.',
    'hero.subtitle.guest': 'Discover how our platform unifies shopping, logistics, and management in an incredibly fast and clean experience.',
    'hero.btn.manage': 'Manage Orders',
    'hero.btn.users': 'Users Control',
    'hero.btn.catalog': 'Explore Catalog',
    'hero.btn.myOrders': 'My Orders',
    'hero.btn.start': 'Get Started',
    'hero.btn.explore': 'Explore Store',
    'feature.1.title': 'Professional Inventory',
    'feature.1.desc': 'Total real-time stock control with smart alerts and detailed tracking.',
    'feature.2.title': 'Agent-First Logistics',
    'feature.2.desc': 'Automated driver assignment and millimeter-precise delivery tracking.',
    'feature.3.title': 'Lightning Fast Core',
    'feature.3.desc': 'Experience ultra-fast loading times powered by our next-generation engine.'
  },
  es: {
    'brand': 'Nexbit',
    'nav.product': 'Dashboard',
    'nav.management': 'Administrar',
    'nav.useCases': 'Tienda',
    'nav.resources': 'Recursos',
    'nav.adminProfile': 'Perfil Admin',
    'nav.myAccount': 'Mi Cuenta',
    'nav.signOut': 'Salir',
    'nav.login': 'Entrar',
    'hero.title.1': 'Experimenta el poder de',
    'hero.title.2': 'la nueva generación de',
    'hero.title.span': 'comercio',
    'hero.subtitle.auth': 'Bienvenido de nuevo, {name}. Explora herramientas diseñadas para optimizar tu flujo en esta nueva era agent-first.',
    'hero.subtitle.guest': 'Descubre cómo nuestra plataforma unifica compras, logística y administración en una experiencia increíblemente limpia.',
    'hero.btn.manage': 'Gestionar Pedidos',
    'hero.btn.users': 'Control de Usuario',
    'hero.btn.catalog': 'Explorar Catálogo',
    'hero.btn.myOrders': 'Mis Pedidos',
    'hero.btn.start': 'Empezar ahora',
    'hero.btn.explore': 'Explorar Tienda',
    'feature.1.title': 'Inventario Profesional',
    'feature.1.desc': 'Control total de stock en tiempo real con alertas y seguimiento detallado.',
    'feature.2.title': 'Logística Inteligente',
    'feature.2.desc': 'Asignación automatizada de repartidores y rastreo de entregas milimétrico.',
    'feature.3.title': 'Motor Ultrarrápido',
    'feature.3.desc': 'Experimenta tiempos de carga ultrarrápidos impulsados por nuestro nuevo motor.',
    'status.PENDIENTE': 'Pendiente de pago',
    'status.CONFIRMADO': 'Confirmado',
    'status.EN_REVISION': 'En revisión',
    'status.APROBADO': 'Aprobado',
    'status.RECHAZADO': 'Rechazado',
    'status.ASIGNADO': 'Asignado',
    'status.EN_CAMINO': 'En camino',
    'status.ENTREGADO': 'Entregado',
    'status.CANCELADO': 'Cancelado',
    'status.DISPONIBLE': 'Disponible',
    'status.EN_REPARTO': 'En reparto'
  },
  en: {
    'status.PENDIENTE': 'Pending payment',
    'status.CONFIRMADO': 'Confirmed',
    'status.EN_REVISION': 'Under review',
    'status.APROBADO': 'Approved',
    'status.RECHAZADO': 'Rejected',
    'status.ASIGNADO': 'Assigned',
    'status.EN_CAMINO': 'On the way',
    'status.ENTREGADO': 'Delivered',
    'status.CANCELADO': 'Cancelled',
    'status.DISPONIBLE': 'Available',
    'status.EN_REPARTO': 'In delivery'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nexbitt_lang') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('nexbitt_lang', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    
    // Remplazar parámetros ej: {name}
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    
    return text;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
