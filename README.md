# Demonstrations of Vulnerabilities Unique to WebAssembly

In this repository are two demonstrations of vulnerabilities unique to WebAssembly that can be leveraged by attackers to perform web-related attacks. Two attacks were demonstrated, Buffer Overflow -> XSS and Indirect Code Redirection -> RCE. The WebAssembly is intended to be used in extensions, though for demonstration purposes, the Indirect Code Redirection -> RCE attack is a webapp instead, to avoid the overhead of networking between an extension and a server.

This project was created for a portion of F24 18-636 Browser Security's final project.

## Sources
Massidda, E., Pisu, L., Maiorca, D., & Giacinto, G. (2024). Bringing Binary Exploitation at Port 80: Understanding C Vulnerabilities in WebAssembly. Proceedings of the 21st International Conference on Security and Cryptography - Volume 1: SECRYPT, 552–559. doi:10.5220/0012852400003767
McFadden, B., Lukasiewicz, T., Dileo, J., & Engler, J. (2018). NCC Group Whitepaper–Security Chasms of WASM.
Perrone, G., & Romano, S. P. (2024). WebAssembly and Security: a review. arXiv [Cs.CR]. Retrieved from http://arxiv.org/abs/2407.12297