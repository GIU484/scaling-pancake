/* global chrome */

chrome.commands.onCommand.addListener((command) => {
  if (command === "expand_shortcut") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: expandTextInActiveInput
      });
    });
  }
});

function expandTextInActiveInput() {
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT" || activeElement.isContentEditable)) {
    const text = activeElement.value || activeElement.innerHTML;

    chrome.storage.sync.get("shortcuts", (data) => {
      const shortcuts = data.shortcuts || {};
      Object.keys(shortcuts).forEach((key) => {
        if (text.includes(key)) {  
          let expandedText = shortcuts[key];
          const placeholders = expandedText.match(/\{[^}]+\}/g); 

          if (placeholders) {
            placeholders.forEach((placeholder) => {
              const userValue = prompt(`Enter value for ${placeholder}:`); 
              if (userValue !== null) {
                expandedText = expandedText.replace(placeholder, userValue);
              }
            });
          }

          // Replace the shortcut with the expanded text
          if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT" || activeElement.isContentEditable) {
            activeElement.value = text.replace(key, expandedText);
          } else if (activeElement.isContentEditable) {
            activeElement.innerHTML = text.replace(key, expandedText);
          }
        }
      });
    });
  }
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("shortcuts", (data) => {
    if (!data.shortcuts) {
      chrome.storage.sync.set({
        shortcuts: {
          "@sig": "Best regards, {First Name} {Last Name}",
          "@date": new Date().toLocaleDateString()
        }
      });
    }
  });
});
