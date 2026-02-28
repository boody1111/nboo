module.exports.config = {
    name: "ريمو",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "يعرض ايدي الكروب الحالي",
    commandCategory: "خدمات",
    usages: "ريمو",
    cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
    try {
        const threadID = event.threadID;

        api.sendMessage(
            `🆔 ايدي الكروب:\n\n${threadID}`,
            threadID
        );
    } catch (err) {
        console.error('[ ريمو ERROR ]', err);
    }
};