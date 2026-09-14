const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const AI=require("./ai");
const runCode=require("./judge0");
dotenv.config();
const app=express();
const PORT=process.env.PORT||5100;
const FRONTEND_URL=process.env.FRONTEND_URL||"http://localhost:5173";
app.use(cors({
  origin:FRONTEND_URL
}));
app.use(express.json());
app.get("/",(req,res)=>{
  res.send("CODEC Backend Running");
});
app.get("/api/health",(req,res)=>{
  res.json({
    success:true,
    message:"CODEC backend is running"
  });
});
app.post("/run",async(req,res)=>{
  try{
    const{language,code,input=""}=req.body;
    if(!language||!code){
      return res.status(400).json({
        error:"Language and code are required"
      });
    }
    const result=await runCode(language,code,input);
    res.json({
      output:result.output,
      runtime:result.time,
      memory:result.memory,
      status:result.status
    });
  }
  catch(err){
    console.log("RUN ERROR:",err);
    res.status(500).json({
      error:err.response?.data?.error||err.message
    });
  }
});
app.post("/complexity",async(req,res)=>{
  try{
    const{language,code}=req.body;
    if(!language||!code){
      return res.status(400).json({
        error:"Language and code are required"
      });
    }
    const prompt=`
You are an expert ${language} programmer and algorithm analyst.
Analyze the following code and determine its algorithmic complexity.
Return ONLY valid JSON in exactly this format:
{
  "time":"O(...)",
  "space":"O(...)"
}
Rules:
- Give the asymptotic worst-case time complexity.
- Give the auxiliary space complexity.
- Do not use actual execution time.
- Do not include explanations outside the JSON.
- Carefully analyze loops, nested loops, recursion, sorting, searching, and data structures.
- Use precise notation such as O(1), O(log n), O(n), O(n log n), O(n^2), O(sqrt(n)), etc.
- Do not confuse runtime with time complexity.
Code:
${code}
`;
    const result=await AI(prompt);
    const clean=result.replace(/```json/g,"").replace(/```/g,"").trim();
    const data=JSON.parse(clean);
    res.json({
      time:data.time,
      space:data.space
    });
  }
  catch(err){
    console.log("COMPLEXITY ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});
app.post("/debug",async(req,res)=>{
  try{
    const{language,code}=req.body;
    if(!language||!code){
      return res.status(400).json({
        error:"Language and code are required"
      });
    }
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
    if(!language||!code){
      return res.status(400).json({
        error:"Language and code are required"
      });
    }
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
    if(!language||!code){
      return res.status(400).json({
        error:"Language and code are required"
      });
    }
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
app.listen(PORT,()=>{
  console.log(`CODEC backend running on port ${PORT}`);
});
