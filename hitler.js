const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "hitlerData.json");

// لو ملف التخزين مش موجود
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(
      {
        jrayed: [],
        tagThreads: [],
        hitler: {},
        repeat: {},
        threadIDs: [],
        botLock: false // false = مفتوح | true = مقفول
      },
      null,
      2
    )
  );
}

// قراءة البيانات
let data = JSON.parse(fs.readFileSync(dataPath));

// حفظ
function save() {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data,
  save
};