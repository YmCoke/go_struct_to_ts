import Go from './useWasm'

export default function useConvert() {
    if (!WebAssembly.instantiateStreaming) {
        // polyfill
        WebAssembly.instantiateStreaming = async (resp, importObject) => {
            const source = await (await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
        };
    }

    // @ts-ignore
    const go = new Go();
    let mod: WebAssembly.Module, inst: WebAssembly.Instance;
    WebAssembly.instantiateStreaming(fetch("/lib.wasm"), go.importObject).then(
        (result) => {
            mod = result.module;
            inst = result.instance;
        }
    );
    return async function convert(sourceCode: string) {
        // @ts-ignore
        window.global.source = sourceCode;
        await go.run(inst);
        inst = await WebAssembly.instantiate(mod, go.importObject); // reset instance
        // @ts-ignore
        return JSON.parse(output);
    }
}
