import React from 'react';
import ReactDOM from 'react-dom/client';

function DemoApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Demo Micro-App</h1>
      <p>This is a standalone micro-app with its own entry point and HTML template.</p>
      <p>The Django template variables in the HTML (like the page title) are injected server-side before this JS runs.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('demo-root'));
root.render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
);
