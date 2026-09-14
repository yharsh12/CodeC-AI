const axios=require("axios");
const languageIds={
  cpp:54,
  python:71,
  java:62,
  javascript:63
};
async function runCode(language,code,input=""){
  const languageId=languageIds[language];
  if(!languageId){
    throw new Error("Unsupported language");
  }
  const headers={
    "Content-Type":"application/json"
  };
  const submission=await axios.post(
    `${process.env.JUDGE0_URL}/submissions?base64_encoded=false`,
    {
      language_id:languageId,
      source_code:code,
      stdin:input
    },
    {headers}
  );
  const token=submission.data.token;
  for(let i=0;i<30;i++){
    await new Promise(resolve=>setTimeout(resolve,1000));
    const response=await axios.get(`${process.env.JUDGE0_URL}/submissions/${token}?base64_encoded=false`,{headers});
    const result=response.data;
    if(result.status&&result.status.id>=3){
      return{
        output:result.stdout||result.stderr||result.compile_output||result.message||"No output",
        time:result.time||"0",
        memory:result.memory||"0",
        status:result.status.description||"Unknown"
      };
    }
  }
  throw new Error("Execution timed out");
}
module.exports=runCode;
