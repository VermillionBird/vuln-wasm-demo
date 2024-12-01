document.getElementById('apply-dark-mode').addEventListener('click', function() {
    const fontSize = document.getElementById('font-size').value;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        console.log(tabs[0].url);
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: applyDarkMode,
            args: [fontSize, tabs[0].url]
        });
    });
});
  
  
  // Function to apply dark mode in the current tab
  
  function applyDarkMode(fontSize, url) {
    const urlPtr = Module._malloc(Module.lengthBytesUTF8(url) + 1);  // Allocate memory
    Module.stringToUTF8(url, urlPtr, Module.lengthBytesUTF8(url) + 1);  // Copy string to memory
    Module._generate_content(fontSize, urlPtr);
    Module._free(urlPtr);
  }