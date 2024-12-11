# Buffer Overflow -> XSS

This webextension is meant to be a benign extension that does a simple CSS injection into pages to apply 'Dark Mode'. However, a buffer overflow vulnerability allows for arbitrary injection of HTMl elements into the DOM, which can be leveraged to cause a cross-site scripting (XSS) attack.

## Vulnerability

WASM:
```c
EM_JS(void, modify_page, (char* style, char* thanks, char* credits), {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = decodeURIComponent(UTF8ToString(style)); //Buffer overflow can overwrite innerHTML content, but style tags don't support child nodes
    const thanksElement = document.createElement('p');
    thanksElement.innerHTML = decodeURIComponent(UTF8ToString(thanks));  //Buffer overflow can overwrite innerHTML content
    const creditElement = document.createElement('p');
    creditElement.innerText = decodeURIComponent(UTF8ToString(credits)); //Uses innerText, can't inject HTMl content here
    document.head.appendChild(styleElement);
    document.body.appendChild(thanksElement);
    document.body.appendChild(creditElement);
});

EMSCRIPTEN_KEEPALIVE
void generate_content(float size, char* url) {
    char style[256];
    char thanks[] = "Thank you for using DarkMode! Your support means a lot to us. If you can, consider donating at https://www.very-fake-site.com";
    char credits[256];
    ...
    sprintf(style, fmt, size);
    sprintf(credits, "Page '%s' has been changed to dark mode, courtesy of DarkMode.", url); //No bounds checking, buffer overflow
    modify_page(style, thanks, credits); 
}
```

Extension popup's script:
```javascript
document.getElementById('apply-dark-mode').addEventListener('click', function() {
    const fontSize = document.getElementById('font-size').value;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        console.log(tabs[0].url);
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: applyDarkMode,
            args: [fontSize, tabs[0].url] //Takes directly from unsafe data sink, the URL
        });
    });
});
  
function applyDarkMode(fontSize, url) {
    ...
    Module._generate_content(fontSize, urlPtr); //Call insecure function with untrusted content
    ...
}
```

The extension's popup page executes `generate_content` with unsanitized data from the URL. Furthermore, `generate_content` has a buffer overflow vulnerability through the usage of `sprintf`. The URL can be arbitrarily long, which can result in overflowing the `credits` buffer and overwriting the `thanks` and `style` buffers, which were intended by the developer to only contain trusted data. Thus, while the `credits` buffer is injected into the DOM via `innerText`, `thanks` and `style` are used to set the `innerHTML` of new nodes. Without the buffer overflow vulnerability, this would prevent XSS from the URL, but by overwriting `thanks`, arbitrary HTMl can be injected.

An attacker, either a malicious website or a phisher, could induce the victim to visit a site with a buffer overflow and XSS payload in the URL, such as in the GET parameters. If the user invoked the Dark Mode extension, a malicious script could be executed in the context of the victim's session and browser, potentially resulting in credential exfiltration or other malicious behavior.

## Run
This will work on most simple pages, though the extension is not robust enough to handle all websites. Add the extension to chrome via chrome://extensions/, then 'Load unpacked'.

Then visit, for example, https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html.

Use the browser extension to activate Dark Mode. Examine what occurs.

The following exploit should work. Visit the following URL, which is the same site but with a malicious GET parameter:

https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html?AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3Cimg%20src=%27x%27%20onerror=%22alert(%27injection%27);%22%3E

An alert message will appear.
