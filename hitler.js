module.exports = {
    data: { botLock: false },
    save: () => {},
    log: (msg, type = "HITLER") => console.log(`[${type}] ${msg}`)
};