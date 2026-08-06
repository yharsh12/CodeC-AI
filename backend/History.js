const mongoose=require("mongoose");
const Schema=new mongoose.Schema({
    language:String,
    code:String,
    output:String,
    ai:String,
    time:String,
    space:String,
    createdAt:{
    type:Date,
    default:Date.now
}
});
module.exports=mongoose.model("History",Schema);