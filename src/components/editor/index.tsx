import { useRef, useState, useEffect } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "./index.less";

import testCase1 from "../../mock/case1";
import log from "../../common/utils/log";

export default function Editor({
  onCodeChange,
}: {
  onCodeChange: (source: string) => void;
}) {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (monacoEl && !editor) {
      const monacoEditor = monaco.editor.create(monacoEl.current!, {
        value: testCase1,
        language: "go",
      });
      monacoEditor.onKeyDown((e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
          log.primary("Editor", "trigger a save event");
          e.preventDefault(); // 阻止浏览器默认的保存页面行为

          const sourceCode = monacoEditor.getValue();
          onCodeChange(sourceCode);
          log.success("Editor", "record go code", { sourceCode });
        }
      });
      setEditor(monacoEditor);
    }
    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div className="editor" ref={monacoEl}></div>;
}
