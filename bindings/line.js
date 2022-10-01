const fetch = (()=>{let m = import("node-fetch");return async (...args)=>await (await m).default(...args);})();
const bodyParser = require("body-parser");
const crypto = require('node:crypto');


const TOKEN = process.env.LINE_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
let app = null;
let hub = null;
let thisOrigin = "line";
//groupid = false;
let groupid = "C0a8c6e12f4c55ab12c3e1ae7bcc5c291";//"C379456dec637d5386c0849faf62e3f4b";


const validateLineWebhook = function(req,res,next){
    //console.log(req.headers);
    //console.log(req.body);
    const body = req.body;
    const secret = CHANNEL_SECRET;
    let hash = crypto.createHmac("sha256",secret).update(body).digest("base64");
    //console.log(hash);
    //console.log(req.get("x-line-signature"));
    if(hash === req.get("x-line-signature")){
        //console.log("verified");
        req.body = JSON.parse(body);
        next();
    }else{
        //console.log("unauthorized");
        //let's mess with the hacker by sending 200
        res.sendStatus(200);
    }
};

const getUserInfo = async function(groupid,userid){
    if(!userid)return "unknown user";
    //let res = await fetch('https://api.line.me/v2/bot/profile/'+userid, {
    let res = await fetch(`https://api.line.me/v2/bot/group/${groupid}/member/${userid}`, {
        headers: {
            Authorization: 'Bearer ' + process.env.LINE_TOKEN,
        },
        method: 'get'
    });
    let body = await res.json()
    //will cache later
    //console.log(body);
    return body;
};



const handleMessage = async function(msg){
    //console.log(msg);
    //groupid = msg?.source?.groupId || groupid;
    if(msg?.source?.groupId !== groupid)return;
    console.log("msg sent by line: ",msg);
    const message = msg.message;
    if(message.type === "text"){
        //console.log(msg);
        let userinfo = await getUserInfo(groupid,msg?.source?.userId);
        hub.emit("general",{
            type:"text",
            text:message.text,
            name:userinfo.displayName,
            origin:thisOrigin,
            originText:thisOrigin,
            iconURL:userinfo.pictureUrl
        });
    }
};


let sendMessage = async function(msg){
    //console.log(msg.origin);
    if(msg.origin === thisOrigin)return;
    //console.log("sending",groupid);
    //console.log(groupid,msg);
    let res = await fetch('https://api.line.me/v2/bot/message/push', {
        headers: {
            "Content-Type": 'application/json; charset=UTF-8',
            Authorization: 'Bearer ' + process.env.LINE_TOKEN,
        },
        method: 'post',
        body: JSON.stringify({
            to:groupid,
            messages: [{
                sender: {
                    name: `${msg.name} (${msg.originText})`.slice(0,20),
                    iconUrl: msg.iconURL
                },
                type: 'text',
                text: msg.text
            }]
        })
    });
    //console.log(res,await res.json());
}


module.exports = async function(_app,_hub){
    app = _app;
    hub = _hub;
    app.post("/webhook/line",validateLineWebhook,(req,res)=>{
        res.sendStatus(200);//got the webhook, thank you very much
        //handle the response messages
        const events = req.body.events || [];
        for(let evt of events){
            if(evt.type === "message")handleMessage(evt);
        }
    });
    hub.on("general",sendMessage);
    console.log(await getUserInfo(groupid,"U8176f3bbdccdf8a51f29add5718fe6b6"));
};



