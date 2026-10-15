import React from 'react';
import { createRoot } from 'react-dom/client';
import AdBlockerTestLab from '../AdBlockerTestLab.jsx';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdBlockerTestLab />
  </React.StrictMode>,
);
