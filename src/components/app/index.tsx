import Editor from "../editor";
import View from "../view";
import "../../hooks/useMonacoEditor";
import "./index.less";
import { useState } from "react";

function App() {
  const [sourceCode, setSourceCode] = useState("");
  return (
    <div className="app">
      <div className="main">
        <Editor onCodeChange={setSourceCode} />
        <View code={sourceCode} />
      </div>
    </div>
  );
}

export default App;
