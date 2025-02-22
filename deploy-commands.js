require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song from a YouTube URL")
        .addStringOption(option =>
            option.setName("url").setDescription("YouTube URL").setRequired(true)
        ),
    new SlashCommandBuilder().setName("pause").setDescription("Pauses the music"),
    new SlashCommandBuilder().setName("resume").setDescription("Resumes the music"),
    new SlashCommandBuilder().setName("stop").setDescription("Stops the music"),
    new SlashCommandBuilder().setName("queue").setDescription("Shows the current queue"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log("Slash commands registered!");
    } catch (error) {
        console.error(error);
    }
})();
