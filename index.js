import 'dotenv/config';

// This file is used to set up a Discord bot using discord.js
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { OpenAI } from 'openai/client.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignore messages from bots
    
    console.log(`Received message: ${message}`);
    
    // Only respond to messages with code blocks
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeMatch = message.content.match(codeBlockRegex);

    if (!codeMatch) return;

    await message.channel.sendTyping();

    try {
        const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
        messages: [
            { role: 'system', content: 'You are a senior software engineer reviewing submitted code. Give concise, actionable feedback.' },
            { role: 'user', content: `Review the following code:\n\n${codeMatch[0]}` }
        ],
        temperature: 0.3,
        });

        const reply = response.choices[0].message.content;
        message.reply(reply.slice(0, 2000)); // Discord limit
  } catch (error) {
        console.error('❌ Error:', error);
        message.reply('There was an error processing your code.');
  }

});

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return; 

    interaction.reply('This is a response to your command interaction.');
    console.log(interaction);
});

client.login(process.env.DISCORD_TOKEN)