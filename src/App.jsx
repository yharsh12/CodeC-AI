import {useState} from "react";
import "./App.css";
import axios from "axios";
function App(){
  const [language,setLanguage]=useState("cpp");
  const [code,setCode]=useState("//Write your code here");
  const [output,setOutput]=useState(" ");
  const [aiOutput,setAiOutput]=useState(" ");
  const [time,setTime]=useState("O(1)");
  const [space,setSpace]=useState("O(1)");
  const [activeTab,setActiveTab]=useState("TERMINAL");
  const [status,setStatus]=useState(" ");
  async function runCode(){
    try{
      setActiveTab("TERMINAL");
      setOutput("Running");
      const res=await axios.post("http://localhost:5100/run",{
        language,
        code
      });
      setOutput(res.data.output || "No output");
      setTime(res.data.time || "0");
      setStatus(res.data.status || "Unknown");
    }
    catch(err){
      setOutput(err.response?.data?.error || "Server Error");
    }
  }
  async function debugCode(){
    try{
      setActiveTab("AI REVIEW");
      setAiOutput("Analyzing");
      const res=await axios.post("http://localhost:5100/debug",{
        language,code
      });
      setAiOutput(cleanAI(res.data.ai));
      setTime(res.data.time);
      setSpace(res.data.space);
    }
    catch(err){
      setAiOutput("Debug Failed");
    }
  }
  async function explainCode(){
    try{
      setActiveTab("AI REVIEW");
      setAiOutput("Explaining");
      const res=await axios.post("http://localhost:5100/explain",{
        language,code
      });
      setAiOutput(cleanAI(res.data.result));
    }
    catch(err){
      setAiOutput("Explanation Failed");
    }
  }
  async function optimizeCode(){
    try{
      setActiveTab("AI REVIEW");
      setAiOutput("Optimizing");
      const res=await axios.post("http://localhost:5100/optimize",{
        language,code
      });
      setAiOutput(cleanAI(res.data.result));
    }
    catch(err){
      setAiOutput("Optimization Failed");
    }
  }
  function cleanAI(text){
    return text
      .replace(/^#{1,6}\s*/gm,"")
      .replace(/\*\*(.*?)\*\*/g,"$1")
      .replace(/\*(.*?)\*/g,"$1")
      .replace(/`{3}[\w]*\n?/g,"")
      .replace(/`/g,"")
      .replace(/^\s*[-*]\s+/gm,"• ")
      .trim();
  }
  function handleTab(e){
    if(e.key==="Tab"){
      e.preventDefault();
      const start=e.target.selectionStart;
      const end=e.target.selectionEnd;
      const newCode=code.substring(0,start)+"    "+code.substring(end);
      setCode(newCode);
      setTimeout(()=>{
        e.target.selectionStart=e.target.selectionEnd=start+4;
      });
    }
  }
  function handleKeyDown(e){
    const textarea=e.target;
    const start=textarea.selectionStart;
    const end=textarea.selectionEnd;
    const value=textarea.value;
    if(e.key==="Tab"){
      e.preventDefault();
      if(start===end){
        if(e.shiftKey){
          const lineStart=value.lastIndexOf("\n",start-1)+1;
          if(value.substring(lineStart,start).startsWith("    ")){
            const newCode=value.substring(0,lineStart)+value.substring(lineStart+4);
            setCode(newCode);
            setTimeout(()=>{
              textarea.selectionStart=textarea.selectionEnd=start-4;
            });
          }
        }
        else{
          const newCode=value.substring(0,start)+"    "+value.substring(end);
          setCode(newCode);
          setTimeout(()=>{
            textarea.selectionStart=textarea.selectionEnd=start+4;
          });
        }
      }
      else{
        const selected=value.substring(start,end);
        const lines=selected.split("\n");
        if(e.shiftKey){
          const newLines=lines.map(line=>line.startsWith("    ")?line.substring(4):line);
          const newCode=value.substring(0,start)+newLines.join("\n")+value.substring(end);
          setCode(newCode);
        }
        else{
          const newLines=lines.map(line=>"    "+line);
          const newCode=value.substring(0,start)+newLines.join("\n")+value.substring(end);
          setCode(newCode);
        }
      }
    }
    if(e.key==="Enter"){
      e.preventDefault();
      const lineStart=value.lastIndexOf("\n",start-1)+1;
      const currentLine=value.substring(lineStart,start);
      const indentation=currentLine.match(/^\s*/)?.[0]||"";
      let extraIndent="";
      if(currentLine.trim().endsWith("{")||currentLine.trim().endsWith(":")){
        extraIndent="    ";
      }
      const newCode=value.substring(0,start)+"\n"+indentation+extraIndent+value.substring(end);
      setCode(newCode);
      const newPosition=start+1+indentation.length+extraIndent.length;
      setTimeout(()=>{
        textarea.selectionStart=textarea.selectionEnd=newPosition;
      });
    }
  }
  function showTab(tab){
    setActiveTab(tab);
  }
  return(
    <div className="app">
      <div className="header">
        <div className="title">CODEC</div>
      </div>
      <div className="toolbar">
        <select value={language} onChange={e=>setLanguage(e.target.value)}>
          <option value="cpp">GNU G++23</option>
          <option value="python">Python 3</option>
          <option value="java">Java 21</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button className="run" onClick={runCode}>Run</button>
        <button className="debug" onClick={debugCode}>Debug</button>
        <button className="explain" onClick={explainCode}>Explain</button>
        <button className="optimize" onClick={optimizeCode}>Optimize</button>
      </div>
      <div className="editor-wrapper">
        <div className="editor">
          <div className="editor-head">
            Source Code
          </div>
          <textarea
            value={code}
            onChange={e=>setCode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div className="bottom-panel">
        <div className="tabs">
          <button
            className={activeTab==="TERMINAL"?"active":""}
            onClick={()=>showTab("TERMINAL")}
          >
            TERMINAL
          </button>
          <button
            className={activeTab==="OUTPUT"?"active":""}
            onClick={()=>showTab("OUTPUT")}
          >
            OUTPUT
          </button>
          <button
            className={activeTab==="PROBLEMS"?"active":""}
            onClick={()=>showTab("PROBLEMS")}
          >
            PROBLEMS
          </button>
          <button
            className={activeTab==="AI REVIEW"?"active":""}
            onClick={()=>showTab("AI REVIEW")}
          >
            AI REVIEW
          </button>
          <button
            className={activeTab==="COMPLEXITY"?"active":""}
            onClick={()=>showTab("COMPLEXITY")}
          >
            COMPLEXITY
          </button>
        </div>
        <div className="panel-content">
          {activeTab==="TERMINAL"&&(
            <div className="terminal-content">
              <div className="terminal-line">
                <span>$</span> CODEC execution terminal
              </div>
              <pre>{output}</pre>
            </div>
          )}
          {activeTab==="OUTPUT"&&(
            <div className="output-content">
              <h3>Program Output</h3>
              <pre>{output}</pre>
            </div>
          )}
          {activeTab==="PROBLEMS"&&(
            <div className="problems-content">
              <h3>Problems</h3>
              <pre>{output==="Waiting"?"No problems detected":output}</pre>
            </div>
          )}
          {activeTab==="AI REVIEW"&&(
            <div className="ai-content">
              <h3>AI Review</h3>
              <pre>{aiOutput}</pre>
            </div>
          )}
          {activeTab==="COMPLEXITY"&&(
            <div className="complexity-content">
              <div className="complexity-box">
                <h3>Time Complexity</h3>
                <div>{time}</div>
              </div>
              <div className="complexity-box">
                <h3>Space Complexity</h3>
                <div>{space}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        ©CODEC AI 2026
      </div>
    </div>
  );
}
export default App;
