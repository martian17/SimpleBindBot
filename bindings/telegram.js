require('dotenv').config();
const fetch = (()=>{let m = import("node-fetch");return async (...args)=>await (await m).default(...args);})();
const bodyParser = require("body-parser");
const crypto = require('node:crypto');

const token = process.env.TELEGRAM_TOKEN;
const baseURL = `https://api.telegram.org/bot${token}`;
const doPost = async function(path,body){
    return await fetch(baseURL+path,{
        method:"post",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify(body)
    });
};
const doGet = async function(path){
    return await fetch(baseURL+path,{method: "get"});
};
const resJSON = async function(resprom){
    let res = await resprom;
    return await res.json();
};

const validateLineWebhook = function(req,res,next){
    console.log("got request",req.get("X-Telegram-Bot-Api-Secret-Token"));
    if(req.get("X-Telegram-Bot-Api-Secret-Token") === process.env.TELEGRAM_WEBHOOK_SECRET){
        //console.log("verified");
        req.body = JSON.parse(req.body);
        next();
    }else{
        //console.log("unauthorized");
        //let's mess with the hacker by sending 200
        res.sendStatus(200);
    }
};




const initTelegram = async function(){
    let result = await resJSON(doPost("/setWebhook",{
        url:"https://smsbind.martian17.com/webhook/telegram",
        //crypto.randomBytes(42).toString('base64')
        secret_token:process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates:["message"]
    }));
    //will cache later
    console.log(result);
}

//https://api.telegram.org/bot<token>/METHOD_NAME


let chatid = -1001677710671;//-1001674982306;

const sendMessage = async function(msg){
    if(msg.origin === "telegram:"+chatid)return;
    if(msg.type !== "text")return;
    //operation undefined
    let result = await resJSON(doPost("/sendMessage",{
        chat_id:chatid,
        text:`${msg.name} (${msg.originText})\n${msg.text}`
    }));
    //console.log(result);
};

const getUserImage = async function(uid){
    /*let res = await resJSON(doPost("/getUserProfilePhotos",{
        user_id:uid
    }));
    console.log(`telegram pfp for ${uid}: `,res);
    res = await resJSON(doGet("/getUserProfilePhotos?user_id=5487921503"))
    res = await resJSON(doGet("/getFile?file_id=AgACAgUAAxUAAWM38n9_TMfQAAFPdvGQwG4C58SHHAACNbMxGzskwVXLGh155slW7QEAAwIAA2MAAyoE"))*/
    return "https://pbs.twimg.com/profile_images/1183117696730390529/LRDASku7_200x200.jpg";
}


module.exports = async function(_app,_hub){
    app = _app;
    hub = _hub;
    await initTelegram();
    app.post("/webhook/telegram",validateLineWebhook,async (req,res)=>{
        res.sendStatus(200);//got the webhook, thank you very much
        //handle the response messages
        //console.log("telegram intercepted: ",req.body);
        if(!("message" in req.body))return;
        let message = req.body.message;
        if(!("chat" in message) || message.chat.id !== chatid)return;
        
        console.log("telegram intercepted: ",req.body);
        /*hub.emit("general",{
            type:"text",
            text:message.text,
            name:message.from.first_name||message.from.username,
            origin:"telegram:"+chatid,
            originText:"telegram",
            iconURL:await getUserImage(message.from.id)
        });*/
        //if(result.from.is_bot === true)return;
        
    });
    hub.on("general",sendMessage);
};





