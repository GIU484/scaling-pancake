/* global chrome */
import React, { useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const SaveShortcuts = ({ shortcuts, deleteShortcut }) => {
  const [expandedShortcut, setExpandedShortcut] = useState(null);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const editorRef = useRef(null);

  const filteredShortcuts = Object.entries(shortcuts).filter(([trigger]) =>
    trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleView = (trigger) => {
    if (expandedShortcut === trigger) {
      setExpandedShortcut(null);
    } else {
      setExpandedShortcut(trigger);
    }
  };

  const startEditing = (trigger, content) => {
    const sanitizedId = trigger.replace(/[^a-zA-Z0-9-_]/g, '');
    if (editorRef.current && editingShortcut !== trigger) {
      editorRef.current = null;
    }

    setEditingShortcut(trigger);

    setTimeout(() => {
      if (!editorRef.current) {
        editorRef.current = new Quill(`#editor-${sanitizedId}`, {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
            ],
          },
        });
      }
      editorRef.current.root.innerHTML = content;
    }, 100);
  };

  const saveEdit = (trigger) => {
    if (editorRef.current) {
      const updatedContent = editorRef.current.root.innerHTML;
      const updatedShortcuts = { ...shortcuts, [trigger]: updatedContent };

      chrome.storage.sync.set({ shortcuts: updatedShortcuts }, () => {
        setEditingShortcut(null);
      });
    }
  };

  const cancelEdit = () => {
    setEditingShortcut(null);
  };

  return (
    <div className="shortcuts-list">
      <input
        type="text"
        placeholder="Search shortcuts..."
        className="search-bar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <ul>
        {filteredShortcuts.map(([trigger, expansion]) => (
          <li key={trigger} className="shortcut-item">
            <div className="shortcut-header">
              <strong>{trigger}</strong>
              <div className="shortcut-buttons">
                {expandedShortcut === trigger ? (
                  <button onClick={() => toggleView(trigger)}>Close</button>
                ) : (
                  <button onClick={() => toggleView(trigger)}>View</button>
                )}
                {editingShortcut !== trigger && (
                  <button onClick={() => startEditing(trigger, expansion)}>Edit</button>
                )}
                <button onClick={() => deleteShortcut(trigger)}>Delete</button>
              </div>
            </div>

            {expandedShortcut === trigger && editingShortcut !== trigger && (
              <div className="shortcut-content" dangerouslySetInnerHTML={{ __html: expansion }}></div>
            )}

            {editingShortcut === trigger && (
              <div className="editing-area">
                <div id={`editor-${trigger.replace(/[^a-zA-Z0-9-_]/g, '')}`} style={{ height: '150px' }}></div>
                <div className="edit-buttons">
                  <button onClick={() => saveEdit(trigger)} className="save-button">Save</button>
                  <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SaveShortcuts;
