require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { handlePlay, handlePause, handleResume, handleStop, handleQueue } = require("./music.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === "play") {
        await handlePlay(interaction, options.getString("url"));
    } else if (commandName === "pause") {
        await handlePause(interaction);
    } else if (commandName === "resume") {
        await handleResume(interaction);
    } else if (commandName === "stop") {
        await handleStop(interaction);
    } else if (commandName === "queue") {
        await handleQueue(interaction);
    }
});

client.login(process.env.TOKEN);
