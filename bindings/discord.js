const { Client, GatewayIntentBits } = require('discord.js');
//invite link
//https://discord.com/api/oauth2/authorize?client_id=1022459038987997294&permissions=274877910016&redirect_uri=https%3A%2F%2Fdiscordapp.com%2Foauth2%2Fauthorize%3F%26client_id%3D1022459038987997294%26scope%3Dbot&response_type=code&scope=bot%20messages.read
//make sure to turn on the message content intent

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds|GatewayIntentBits.MessageContent|GatewayIntentBits.GuildMessages] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Discord bot Ready!');
});


const guildid = "1022460670081515560";
const channels = {
    "1022460670568059002":"general",
    "1022465674355949638":"frontend",
    "1022465698167005206":"backend"
};
const thisOrigin = "discord"


client.on("messageCreate", message => {
    //console.log("\n\n\n\n\n");
    //console.log(message);
    //console.log("\n\n\n\n\n");
    
    const cid = message.channelId;
    if(!(cid in channels)){
        return;
    }
    const cname = channels[cid];
    hub.emit(cname,{
        type:"text",
        text:message.content,
        name:message.author.username,
        origin:thisOrigin,
        originText:cname,//`${thisOrigin}:${cname}`,
        iconURL:message.author.displayAvatarURL()
    });
});



const sendMessage = function(cid,msg){
    if(msg.originName === thisOrigin)return;
    
};



//jeez want to defer
// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);





module.exports = function(_app,_hub){
    app = _app;
    hub = _hub;
    /*app.post("/webhook/line",validateLineWebhook,(req,res)=>{
        res.sendStatus(200);//got the webhook, thank you very much
        //handle the response messages
        const events = req.body.events || [];
        for(let evt of events){
            if(evt.type === "message")handleMessage(evt);
        }
    });
    hub.on("general",sendMessage);*/
    Object.entries(channels).map(([cid,cname])=>{
        hub.on(cname,(msg)=>{
            sendMessage(cid,msg);
        });
    });
};