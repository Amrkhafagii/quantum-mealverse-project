import React, { useEffect } from 'react';
import { useAppInitialization } from './hooks/useAppInitialization';

function App() {
  // Initialize core services early
  useAppInitialization();
  
  // Rest of your App component
  return (
    <div className="app">
      {/* Your app content */}
      <h1>Quantum Mealverse</h1>
    </div>
  );
}

export default App;
