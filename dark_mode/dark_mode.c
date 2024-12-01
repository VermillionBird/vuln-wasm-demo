#include <stdio.h>
#include <string.h>
#include <emscripten.h>

EM_JS(void, modify_page, (char* style, char* thanks, char* credits), {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = decodeURIComponent(UTF8ToString(style));
    const thanksElement = document.createElement('p');
    thanksElement.innerHTML = decodeURIComponent(UTF8ToString(thanks));
    const creditElement = document.createElement('p');
    creditElement.innerText = decodeURIComponent(UTF8ToString(credits));
    document.head.appendChild(styleElement);
    document.body.appendChild(thanksElement);
    document.body.appendChild(creditElement);
});

EMSCRIPTEN_KEEPALIVE
void generate_content(float size, char* url) {
    char style[256];
    char thanks[] = "Thank you for using DarkMode! Your support means a lot to us. If you can, consider donating at https://www.very-fake-site.com";
    char credits[256];
    char* fmt = "body {\n"
                "    background-color: #121212;\n"
                "    color: #e0e0e0;\n"
                "    font-size: %.2fpx;\n"
                "}\n"
                "a {\n"
                "    color: #bb86fc;\n"
                "}\n"
                ".header, .footer {\n"
                "    background-color: #333333;\n"
                "}";
    sprintf(style, fmt, size);
    sprintf(credits, "Page '%s' has been changed to dark mode, courtesy of DarkMode.", url);
    modify_page(style, thanks, credits);
}

int main() {
    return 0;
}
