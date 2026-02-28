const fs = require('fs-extra');
const path = require('path');

module.exports = function({ api, Users, Threads, Currencies }) {
    return async function({ api, event }) {
        const { threadID, messageID, body, senderID } = event;
        if (!body || !global.client.commands) return;
        const prefix = global.config.PREFIX || ".";
        
        // Handle message without prefix (for some commands that might need it)
        for (const [name, command] of global.client.commands) {
            if (command.config.hasPrefix === false && body.toLowerCase().startsWith(name.toLowerCase())) {
                const args = body.trim().split(/ +/);
                args.shift();
                try {
                    return await command.run({ api, event, args, Users, Threads, Currencies, models: {} });
                } catch (e) { console.error(`[COMMAND ERROR] ${name}:`, e); }
            }
        }

        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = global.client.commands.get(commandName) || global.client.commands.values().find(c => c.config.aliases && c.config.aliases.includes(commandName));

        if (!command) return;

        try {
            const getText = (key, ...args) => {
                const lang = global.config.language || "vi";
                if (!command.languages || !command.languages[lang] || !command.languages[lang][key]) return key;
                let text = command.languages[lang][key];
                for (let i = 0; i < args.length; i++) {
                    const regEx = new RegExp(`%${i + 1}`, 'g');
                    text = text.replace(regEx, args[i]);
                }
                return text;
            };
            const models = {};
            // Setup global dependencies for the command
            if (command.config.dependencies) {
                for (const dep in command.config.dependencies) {
                    if (!global.nodemodule[dep]) {
                        try { global.nodemodule[dep] = require(dep); } catch(e) {}
                    }
                }
            }
            await command.run({ api, event, args, Users, Threads, Currencies, getText, models });
        } catch (error) {
            console.error(`[COMMAND ERROR] \${commandName}:`, error);
            api.sendMessage(`❌ حدث خطأ: \${error.message}`, threadID, messageID);
        }
    };
};
