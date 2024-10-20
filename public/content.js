/* global chrome */

function handleExpansion(node) {
  console.log("Adding event listener to node", node); // Debug: log node to which listener is added
    node.addEventListener('input', function(e) {
        const text = node.innerHTML;
        console.log("Input event triggered. Current text:", text); 

      chrome.storage.sync.get('shortcuts', function(data) {
          const shortcuts = data.shortcuts || {};
          console.log("Shortcuts loaded:", shortcuts);
          Object.keys(shortcuts).forEach((shortcut) => {
              if (text.includes(shortcut)) {  // Check if the current text includes the shortcut
                  let expandedText = shortcuts[shortcut];
                  const placeholders = expandedText.match(/\{[^}]+\}/g);
                  console.log("Processing shortcut:", shortcut, "with placeholders:", placeholders);

                  if (placeholders) {
                      injectModal(placeholders, (values) => {
                        console.log("Placeholder values provided:", values);
                          placeholders.forEach((placeholder) => {
                              expandedText = expandedText.replace(new RegExp(`\\${placeholder}`, 'g'), values[placeholder]);
                              console.log("Text after replacement:", expandedText);
                          });
                          updateElementText(node, text, shortcut, expandedText);
                      });
                  } else {
                      updateElementText(node, text, shortcut, expandedText);
                  }
              }
          });
      });
  });
}


function updateElementText(element, originalText, shortcut, newText) {
  if (element.tagName === "TEXTAREA" || element.tagName === "INPUT" || element.tagName === ".ck-editor__editable") {
    element.value = originalText.replace(shortcut, newText);
  } else if (element.isContentEditable) {
    element.innerHTML = originalText.replace(shortcut, newText);
  }
}

function injectStyles() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #expanderModal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      width: auto;
      max-width: 500px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    #expanderModal h2 {
      margin-top: 0;
      color: #333;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    #placeholderForm {
      display: flex;
      flex-direction: column;
    }
    #placeholderForm div {
      margin-bottom: 10px;
    }
    #placeholderForm label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    #placeholderForm input {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 14px;
    }
    #placeholderForm button {
      padding: 10px 20px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    #placeholderForm button:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);
}


function injectModal(placeholders, onComplete) {
  injectStyles();
  const modalHtml = `
    <div id="expanderModal">
      <h2>Fill in the details</h2>
      <form id="placeholderForm">
        ${placeholders.map(ph => `<div><label>${ph}</label><input type="text" name="${ph}" placeholder="Enter ${ph}"/></div>`).join('')}
        <button type="submit">Submit</button>
      </form>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.getElementById('placeholderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = {};
    formData.forEach((value, key) => {
      values[key] = value;
    });
    document.body.removeChild(document.getElementById('expanderModal'));
    onComplete(values);
  });
}


const observer = new MutationObserver((mutationsList) => {
  console.log("Mutation observed:", mutationsList); // Debug: log all mutations observed
  for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
              console.log("New node added:", node); // Debug: log each new node added
              if (node.nodeType === 1 && node.isContentEditable) {
                  handleExpansion(node);
              }
          });
      }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

document.querySelectorAll('[contenteditable="true"]').forEach(handleExpansion);
