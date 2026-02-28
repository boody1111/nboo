const axios = require('axios');

module.exports = {
  name: "فيديو",
  description: "يتم إرسال فيديو عشوائي ",

  async run({ event, send }) {
    try {
      const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
      const { shotiurl: pogiurl, username: chilliName, nickname: pogiName, duration: pogiDuration } = response.data;

      await send(`إسـم المستـخـدم👤: ${chilliName}\nالإسـم المـستـعار📃: ${pogiName}\nالمـدة⏳: ${pogiDuration} ثوانـي`);

      await send({
        attachment: {
          type: "فيديو",
          payload: {
            url: pogiurl
          }
        }
      });

    } catch (error) {
      await send(`لقد فشل العثور على فيديو Chilli. الخطأ: ${error.message || error}`);
    }
  }
};
