
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const translations = {
  en: {
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'meal.add': 'Add to Cart',
    'meal.customize': 'Customize',
    'filter.dietary': 'Dietary Options',
    'filter.sort': 'Sort By',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    // Add more translations as needed
  },
  es: {
    'nav.home': 'Inicio',
    'nav.menu': 'Menú',
    'nav.orders': 'Pedidos',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': '¡Éxito!',
    'meal.add': 'Añadir al Carrito',
    'meal.customize': 'Personalizar',
    'filter.dietary': 'Opciones Dietéticas',
    'filter.sort': 'Ordenar Por',
    'cart.empty': 'Tu carrito está vacío',
    'cart.checkout': 'Pagar',
    // Add more translations as needed
  },
  // Add more languages as needed
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.en;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
