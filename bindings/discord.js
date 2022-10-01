const fetch = (()=>{let m = import("node-fetch");return async (...args)=>await (await m).default(...args);})();
require("dotenv").config();

const log = function(...vals){
    console.log("discord:",...vals);
}


//guild channel event mapping
const guildid = "1025691579974942722";

/*
general 1025691580516020297
frontend 1025691708773642250
backend 1025691736737054760
*/

const channels = {
    "1025691580516020297":{
        name:"general",
        listen:["general"],
        emit:["general"]
    },
    "1025691708773642250":{
        name:"frontend",
        listen:["frontend"],
        emit:["frontend"]
    },
    "1025691736737054760":{
        name:"backend",
        listen:["backend"],
        emit:["backend"]
    }
};

const baseURL = "https://discord.com/api/v10";
const doPost = async function(path,body){
    return await fetch(baseURL+path,{
        method:"post",
        headers:{
            Authorization:`Bot ${process.env.DISCORD_TOKEN}`,
            "Content-Type": "application/json"
        },
        body:JSON.stringify(body)
    });
};
const doGet = async function(path){
    return await fetch(baseURL+path,{
        method:"get",
        headers:{
            Authorization:`Bot ${process.env.DISCORD_TOKEN}`
        }
    });
};
const resJSON = async function(resprom){
    let res = await resprom;
    return await res.json();
};


const getChannels = async function(){
    //getting hooks for each of the channels
    let hooks = await resJSON(doGet(`/guilds/${guildid}/webhooks`));
    for(let hook of hooks){
        if(hook?.user?.id !== process.env.DISCORD_BOT_ID)continue;
        const cid = hook.channel_id;
        if(cid in channels){
            channels[cid].hook = hook;
        }
    }
    for(let cid in channels){
        let channel = channels[cid];
        if(!("hook" in channel)){
            //create a new hook for the channel
            let hook = await resJSON(doPost(`/channels/${cid}/webhooks`,{
                name:"mocking drone"
            }));
            channel.hook = hook;
        }
    }
    log("hooks all prepared");
    //send test messages to each channels
    /*for(let cid in channels){
        let channel = channels[cid];
        let hook = channel.hook;
        let res = await doPost(`/webhooks/${hook.id}/${hook.token}`,{
            content:`hello ${channel.name}`,
            username:`mockingbird in ${channel.name}`,
            avatar_url:"https://cdn.discordapp.com/avatars/538903439686762496/a82ad47c849ed8e1730221f9ab6a865e.webp?size=80"
        });
        log(channel.name,await res.text());
    }*/
    return channels;
};

const channelPromise = getChannels();



const sendMessage = function(channel,msg){
    if(msg.origin === "discord:"+channel.id)return;
    if(msg.type !== "text")return;
    let hook = channel.hook;
    doPost(`/webhooks/${hook.id}/${hook.token}`,{
        content:msg.text,
        username:msg.name+` (${msg.originText})`,
        avatar_url:msg.iconURL
    });
}


const { Client, GatewayIntentBits } = require("discord.js");
let app,hub;
const client = new Client({ intents: [GatewayIntentBits.Guilds|GatewayIntentBits.MessageContent|GatewayIntentBits.GuildMessages] });

client.on("messageCreate", async message => {
    const cid = message.channelId;
    const channels = await channelPromise;
    if(!(cid in channels) ||
       message.author.id === channels[cid].hook.id || 
       !hub){
        return;
    }
    const channel = channels[cid];
    channel.emit.map(e=>{
        console.log("emitting ",e);
        hub.emit(e,{
            type:"text",
            text:message.content,
            name:message.author.username,
            origin:"discord:"+channel.id,
            originText:channel.name,
            iconURL:message.author.displayAvatarURL()
        });
    });
});

client.once('ready', async () => {
	log('Ready!');
    //log(await client.user.setUsername("Bindertron 1000"));
});

client.login(process.env.DISCORD_TOKEN);



module.exports = async function(_app,_hub){
    app = _app;
    hub = _hub;
    let channels = await channelPromise;
    Object.entries(channels).map(([cid,channel])=>{
        channel.listen.map(e=>hub.on(e,(msg)=>sendMessage(channel,msg)));
    });
};

