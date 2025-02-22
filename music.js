const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus 
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");

const queue = new Map();

async function handlePlay(interaction, url) {
    if (!interaction.member.voice.channel) {
        return interaction.reply("❌ You must be in a voice channel to play music!");
    }

    const guildId = interaction.guildId;
    const voiceChannel = interaction.member.voice.channel;

    if (!queue.has(guildId)) {
        queue.set(guildId, { songs: [], connection: null, player: createAudioPlayer() });
    }

    queue.get(guildId).songs.push(url);
    interaction.reply(`🎵 Added to queue: ${url}`);

    if (!queue.get(guildId).connection) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        queue.get(guildId).connection = connection;
        queue.get(guildId).player = createAudioPlayer();

        connection.subscribe(queue.get(guildId).player);
        playNextSong(guildId);
    }
}

async function playNextSong(guildId) {
    const serverQueue = queue.get(guildId);
    if (!serverQueue || serverQueue.songs.length === 0) {
        serverQueue.connection.destroy();
        queue.delete(guildId);
        return;
    }

    const song = serverQueue.songs.shift();
    try {
        const stream = await ytdl(song, { filter: "audioonly", highWaterMark: 1 << 25 });
        const resource = createAudioResource(stream);

        serverQueue.player.play(resource);
        serverQueue.player.on(AudioPlayerStatus.Idle, () => playNextSong(guildId));
    } catch (error) {
        console.error("Error playing song:", error);
        playNextSong(guildId);
    }
}

async function handlePause(interaction) {
    const guildId = interaction.guildId;
    if (!queue.has(guildId)) {
        return interaction.reply("❌ No music is currently playing.");
    }

    queue.get(guildId).player.pause();
    interaction.reply("⏸ Music paused.");
}

async function handleResume(interaction) {
    const guildId = interaction.guildId;
    if (!queue.has(guildId)) {
        return interaction.reply("❌ No music is currently playing.");
    }

    queue.get(guildId).player.unpause();
    interaction.reply("▶ Music resumed.");
}

async function handleStop(interaction) {
    const guildId = interaction.guildId;
    if (queue.has(guildId)) {
        queue.get(guildId).player.stop();
        queue.get(guildId).connection.destroy();
        queue.delete(guildId);
        interaction.reply("🛑 Stopped playing and cleared the queue.");
    } else {
        interaction.reply("❌ No music is currently playing.");
    }
}

async function handleQueue(interaction) {
    const guildId = interaction.guildId;
    if (!queue.has(guildId) || queue.get(guildId).songs.length === 0) {
        interaction.reply("❌ The queue is empty.");
    } else {
        interaction.reply("🎶 Current Queue:\n" + queue.get(guildId).songs.join("\n"));
    }
}

module.exports = { handlePlay, handlePause, handleResume, handleStop, handleQueue };
