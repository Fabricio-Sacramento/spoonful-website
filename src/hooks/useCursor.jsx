// src/hooks/useCursor.js
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Context privado
const CursorContext = createContext();

// Provider (componente)
export const CursorProvider = ({ children }) => {
  const [cursorType, setCursorType] = useState('default');
  const [cursorText, setCursorText] = useState('');

  return (
    <CursorContext.Provider value={{ cursorType, setCursorType, cursorText, setCursorText }}>
      {children}
    </CursorContext.Provider>
  );
};

CursorProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook (função)
export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within CursorProvider');
  }
  return context;
};