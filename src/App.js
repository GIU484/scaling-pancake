/* global chrome */
import React, { useState, useEffect } from 'react';
import Form from './component/Form';
import SaveShortcuts from './component/SaveShortcuts';
import './styles/App.css';
import './styles/theme.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/emoji-picker.css';
import './styles/shortcuts.css';
import './styles/editor.css';

function App() {
  const [currentPage, setCurrentPage] = useState('create');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [shortcuts, setShortcuts] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
 
  
  useEffect(() => {
    chrome.storage.sync.get(['shortcuts', 'theme'], (data) => {
      if (data.shortcuts) {
        setShortcuts(data.shortcuts);
      }
      if (data.theme) {
        setCurrentTheme(data.theme);
      }
    });
  }, []);

  

  const changeTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  const saveShortcut = (shortcut, expansion) => {
    const updatedShortcuts = { ...shortcuts, [shortcut]: expansion };
    chrome.storage.sync.set({ shortcuts: updatedShortcuts }, () => {
      setShortcuts(updatedShortcuts);
      setStatusMessage('Shortcut saved!');
      setTimeout(() => setStatusMessage(''), 2000);
    });
  };

  const deleteShortcut = (shortcut) => {
    const updatedShortcuts = { ...shortcuts };
    delete updatedShortcuts[shortcut];
    chrome.storage.sync.set({ shortcuts: updatedShortcuts }, () => {
      setShortcuts(updatedShortcuts);
      setStatusMessage(`Shortcut '${shortcut}' deleted!`);
      setTimeout(() => setStatusMessage(''), 2000);
    });
  };

  return (
    <div className={`app-container ${currentTheme}-theme`}>
      <div className="title-container">
        <div className="theme-toggle">
          <button className={
            `theme-button 
            ${currentTheme === 'light' ? 'active' : ''}`} 
            onClick={() => changeTheme('light')}>
              ☀️
          </button>
          <button className={`theme-button ${currentTheme === 'dark' ? 'active' : ''}`} onClick={() => changeTheme('dark')}>🌙</button>
        </div>
        <h1 className="title">Text Management</h1>
        </div>
      <div className="navigation">
        <button onClick={() => setCurrentPage('create')} className={currentPage === 'create' ? 'active' : ''}>Create Shortcut</button>
        <button onClick={() => setCurrentPage('view')} className={currentPage === 'view' ? 'active' : ''}>View Shortcuts</button>
      </div>

      {currentPage === 'create' && <Form saveShortcut={saveShortcut} />}
      {currentPage === 'view' && <SaveShortcuts shortcuts={shortcuts} deleteShortcut={deleteShortcut} />}
      {statusMessage && <div className="status">{statusMessage}</div>}
      
    </div>
  );
}

export default App;
