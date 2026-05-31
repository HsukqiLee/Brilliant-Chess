export function wasmThreadsSupported() {
    // WebAssembly 1.0
    const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    if (
        typeof WebAssembly !== "object" ||
        typeof WebAssembly.validate !== "function"
    )
        return false;
    if (!WebAssembly.validate(source)) return false;

    // SharedArrayBuffer
    if (typeof SharedArrayBuffer !== "function") return false;

    // Atomics
    if (typeof Atomics !== "object") return false;

    // Shared memory
    const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

    // Structured cloning
    try {
        window.postMessage(mem, "*");
    } catch {
        // console.log(`Browser Error ${e}`);
        return false;
    }

    // Growable shared memory (optional)
    try {
        mem.grow(8);
    } catch /*(e)*/ {
        // console.log(`Browser Error ${e}`);
        return false;
    }

    return true;
}

export function wasmSupported() {
    // WebAssembly 1.0

    if (typeof WebAssembly !== "object") return false;
    if (typeof WebAssembly.validate !== "function") return false;

    const source = Uint8Array.of(0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    return WebAssembly.validate(source);
}

export function getAproxMemory() {
    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) {
        return 1 * 1024
    }

    if (/iphone|ipad|ipod/i.test(userAgent)) {
        return 2 * 1024
    }

    if (/windows|mac|linux/i.test(userAgent)) {
        return 4 * 1024
    }

    if (/cros/i.test(userAgent)) {
        return 2 * 1024
    }

    if (/kaios/i.test(userAgent)) {
        return 0.5 * 1024
    }

    if (/blackberry|bb10/i.test(userAgent)) {
        return 0.5 * 1024
    }

    if (/tizen/i.test(userAgent)) {
        return 1 * 1024
    }

    return 0.5 * 1024
}