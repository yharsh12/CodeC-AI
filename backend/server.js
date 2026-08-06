
const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
dotenv.config();
const connectDB=require("./db");
const History=require("./History");
const AI=require("./ai");
const runCode=require("./judge0");
const app=express();
connectDB();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
  res.send("CODEC Backend Running");
});
app.post("/run",async(req,res)=>{
  try{
    const{language,code}=req.body;
    const result=await runCode(language,code);
    await History.create({
      language,
      code,
      output:result.output,
      ai:"",
      time:result.time,
      space:""
    });
    res.json({
      output:result.output,
      time:result.time,
      memory:result.memory,
      status:result.status
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error:err.response?.data?.error || err.message
    });
  }
});
app.post("/debug",async(req,res)=>{
  try{
    const{language,code}=req.body;
    const prompt=`
    You are an expert ${language} programmer.
    Analyze the following code:
    ${code}
    Find bugs, logical errors, syntax errors, and possible runtime errors.
    Return ONLY valid JSON in exactly this format:
    {
      "ai":"Explain the bugs and how to fix them.",
      "time":"O(...)",
      "space":"O(...)"
    }
    If there are no bugs, say that clearly in the ai field.
    `;
    const result=await AI(prompt);
    const clean=result.replace(/```json/g,"").replace(/```/g,"").trim();
    const data=JSON.parse(clean);
    await History.create({
      language,
      code,
      output:"",
      ai:data.ai,
      time:data.time,
      space:data.space
    });
    res.json({
      ai:data.ai,
      time:data.time,
      space:data.space
    });
  }
  catch(err){
    console.log("DEBUG ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});
app.post("/explain",async(req,res)=>{
  try{
    const{language,code}=req.body;
    const prompt=`
    Explain this ${language} code in simple words.
    Explain:
    1. What the code does
    2. How it works
    3. Important parts of the code
    Code:
    ${code}
    `;
    const result=await AI(prompt);
    res.json({
      result
    });
  }
  catch(err){
    console.log("EXPLAIN ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});
app.post("/optimize",async(req,res)=>{
  try{
    const{language,code}=req.body;
    const prompt=`
    You are an expert ${language} programmer.
    Optimize this code.
    Return:
    Optimized Code:
    <optimized code>
    Explanation:
    <explain what was improved>
    Time Complexity:
    <complexity>
    Space Complexity:
    <complexity>
    Original Code:
    ${code}
    `;
    const result=await AI(prompt);
    res.json({
      result
    });
  }
  catch(err){
    console.log("OPTIMIZE ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});
app.get("/history",async(req,res)=>{
  try{
    const history=await History.find().sort({createdAt:-1});
    res.json(history);
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error:err.message
    });
  }
});
app.listen(5100,()=>{
  console.log("Server running on port 5100");
});

