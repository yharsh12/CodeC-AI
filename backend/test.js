require("dotenv").config();
const{GoogleGenAI}=require("@google/genai");
const ai=new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY
});
async function test(){
  try{
    const response=await ai.models.generateContent({
      model:"gemini-3.6-flash",
      contents:"Say hello to CODEC in one sentence."
    });
    console.log(response.text);
  }
  catch(err){
    console.log("GEMINI ERROR:");
    console.log(err);
  }
}
test();

