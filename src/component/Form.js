import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import EmojiPicker from 'emoji-picker-react';



const Form = ({ saveShortcut }) => {
  const [shortcut, setShortcut] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false); // Track if editor is ready
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, false] }],
      [{ align: [] }],
      ['link'],
      ['emoji'], 
    ];
  
    const editor = new Quill(quillRef.current, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            emoji: function () {
              setShowEmojiPicker((prev) => !prev); // Toggle emoji picker
            },
          },
        },
        clipboard: {
          matchVisual: false,
        },
      },
      formats: ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'header', 'align', 'link', 'emoji'],
    });

    const toolbar = editor.getModule('toolbar');
    const emojiButton = toolbar.container.querySelector('.ql-emoji');

  
    if (emojiButton) {
      emojiButton.innerHTML = '😊'; 
    }

    editorRef.current = editor;
    setIsEditorReady(true);
  }, []);

  
  // Function to insert a placeholder
  const insertPlaceholder = (placeholder) => {
    if (!isEditorReady || !editorRef.current) {
      console.error('Editor is not ready or undefined.');
      return;
    }
  
    const editor = editorRef.current;
    let range = editor.getSelection(true); // Get current selection or cursor position
  
    if (range) {
      // Insert the placeholder at the cursor position
      editor.insertText(range.index, placeholder);
      editor.setSelection(range.index + placeholder.length);
    } else {
      // If no selection, insert at the end
      const length = editor.getLength();
      editor.insertText(length, placeholder);
      editor.setSelection(length + placeholder.length);
    }
  
    editor.focus(); 
  };

  // Function to handle emoji insertion
  const onEmojiClick = (emojiObject, event) => {
    console.log(emojiObject); // Check emoji object structure
  
    if (!isEditorReady || !editorRef.current) {
      console.error('Editor is not ready or undefined.');
      return;
    }
  
    const editor = editorRef.current;
    let range = editor.getSelection();
  
    if (!range) {
      const length = editor.getLength() || 0;
      range = { index: length - 1 };
      editor.setSelection(range.index);
    }
  
    const cursorPosition = range.index;
  
    // Make sure you're accessing the correct property from emojiObject
    if (emojiObject && emojiObject.emoji) {
      editor.insertText(cursorPosition, emojiObject.emoji); 
      editor.setSelection(cursorPosition + emojiObject.emoji.length);
      editor.focus();
      setShowEmojiPicker(false);
    } else {
      console.error('Emoji object is not structured as expected', emojiObject);
    }
  };
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditorReady || !editorRef.current) {
      console.error('Editor is not ready or undefined.');
      return;
    }

    if (shortcut) {
      const editorContent = editorRef.current.root.innerHTML;
      saveShortcut(shortcut, editorContent);
      setShortcut('');
      editorRef.current.setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-shortcut-form">
      <label>Template trigger*</label>
      <input
        type="text"
        value={shortcut}
        onChange={(e) => setShortcut(e.target.value)}
        placeholder="e.g., -thx"
        className="input-field"
        required
      />

      <label>Enter Macro</label>
      <div className="editor-container">
        <div>
        <div className="emoji-container">
          {/* Render the emoji picker */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={onEmojiClick}/>
              </div>
              )}
            </div>
          </div>
        <div 
          ref={quillRef} 
          style={{ height: '200px' }} 
        />
        
        {/* Placeholder Dropdown */}

        {showDropdown && (
          <div className="placeholder-dropdown" onClick={(e) => e.stopPropagation()}>
            <ul>
              <li onClick={(e) => insertPlaceholder('{First Name}', e)}>First Name</li>
              <li onClick={(e) => insertPlaceholder('{Last Name}', e)}>Last Name</li>
              <li onClick={(e) => insertPlaceholder('{Job Title}', e)}>Job Title</li>
              <li onClick={(e) => insertPlaceholder('{Location}', e)}>Location</li>
              <li onClick={(e) => insertPlaceholder('{Refund Amount}', e)}>Refund</li>
              <li onClick={(e) => insertPlaceholder('{Credit Amount}', e)}>Credit</li>
            </ul>
          </div>
        )}
        <div className="editor-toolbar">

            <button type="button" onClick={() => setShowDropdown(!showDropdown)} className="add-placeholder-button">
              Add Placeholder
            </button>
          </div>
      </div>

      <div className="form-buttons">
        <button type="submit" className="save-button">Save</button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setShortcut(''); // Clear the shortcut input
            if (editorRef.current) {
              editorRef.current.setText(''); // Clear the Quill editor content
            }
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Form;