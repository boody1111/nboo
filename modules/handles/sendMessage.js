module.exports = function(api) {
    return function(message, threadID, callback, messageID) {
        return api.sendMessage(message, threadID, callback, messageID);
    };
};