#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <emscripten.h>

typedef struct str_struct {
    char msg[64];
    uint16_t msg_len;
    void (*change)(char *);
} str_t;

void reverse(char* s) {
    int i = 0;
    int j = strlen(s) - 1;
    char temp;
    while (i < j) {
        temp = s[i];
        s[i] = s[j];
        s[j] = temp;
        i++;
        j--;
    }
}

void toggleChars(char* S)
{
    while (*S) {
        if (isalpha(*S)) {
            *S ^= (1 << 5);
        }
        ++S;
    }
}

void setMethod(str_t *s, int m) {
    if (m == 0){
        s->change = &reverse;
    } else {
        s->change = &toggleChars;
    }
}

char* trigger(str_t *s) {
    s->change(s->msg);
    return s->msg;
}

void setMsg(str_t *s, char *msg, int n) {
    printf(msg);
    memcpy(&(s->msg), msg, n);
}

EMSCRIPTEN_KEEPALIVE
char* execute(char *msg, int n, int m) {
    str_t s;
    setMethod(&s, m);
    setMsg(&s, msg, n);
    return trigger(&s);
}

EMSCRIPTEN_KEEPALIVE
int main(void) {
    printf("&emscripten_run_script: %p\n", &emscripten_run_script);
}
