import { useRef, useState, useEffect } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "./index.less";
import log from "../../common/utils/log";
import useConvert from "../../hooks/useConvert";
import parse from "../../hooks/useParse";

const convert = useConvert();

export default function View({ code }: { code: string }) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      const monacoEditor = monaco.editor.create(monacoEl.current!, {
        // value: "function() {}",
        language: "typescript",
      });
      console.log(monacoEditor);
      editorRef.current = monacoEditor;
      return () => monacoEditor.dispose();
    }
  }, [monacoEl.current]);

  useEffect(() => {
    log.primary("View", "code changed", { code });
    convert(code).then((data) => {
      log.success("View", "code converted result", { data });
      const result = parse(data);
      log.success("View", "code parse to ts code", { result });
      editorRef.current?.setValue(result);
    });
  }, [editorRef.current, code]);

  return <div className="view" ref={monacoEl}></div>;
}
