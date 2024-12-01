const express = require('express');
const fs = require('fs');
const path = require('path');
const Module = require('./vuln.js');

const app = express();
const port = 3000;

app.use('/wasm', express.static(path.join(__dirname, 'vuln.wasm')));
app.use('/js', express.static(path.join(__dirname, 'vuln.js')));


app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Do some funky string stuff</title></head>
      <body>
        <h1>Simple WASM Example</h1>
        <input type="text" id="msg" value="some random string"><br>
        <input type="radio" id="rev" name="method" checked="True">
        <label for="rev">Reverse it!</label><br>
        <input type="radio" id="swap" name="method">
        <label for="swap">Swap case!</label><br>
        <button onclick="run()">Go!</button>
        <div id="result"></div>
        <script>
          async function run() {
            if (document.getElementById('rev').checked) {
                var s = new URLSearchParams({msg: document.getElementById('msg').value, m: 0}).toString()
            } else {
                var s = new URLSearchParams({msg: document.getElementById('msg').value, m: 1}).toString()
            }
            const response = await fetch('/api/execute?' + s);
            const result = await response.text();
            document.getElementById('result').innerText = 'Result: ' + result;
          }
        </script>
      </body>
    </html>
  `);
});

app.get('/api/execute', async (req, res) => {
    try {
        const wasmModule = await require(path.join(__dirname, 'vuln.js'));
        const msg = decodeURIComponent(req.query.msg);
        const n = Module.lengthBytesUTF8(msg);
        const m = req.query.m; 
        const msgPtr = Module._malloc(n+1);
        Module.stringToUTF8(msg, msgPtr, n + 1);
        res.send(Module.UTF8ToString(Module._execute(msgPtr, n, m)));
        Module._free(msgPtr);
    } catch (err) {
        console.error('Error loading WASM module:', err);
        res.status(500).send('Error loading WASM module');
    }
    
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});