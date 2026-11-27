import React from 'react';
import { createRoot } from 'react-dom/client';
import AdBlockerTestLab from '../AdBlockerTestLab.jsx';
// Fonts are served from this site (no request to Google Fonts), see docs/current-system.md.
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdBlockerTestLab />
  </React.StrictMode>,
);
