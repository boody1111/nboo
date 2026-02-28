const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// قائمة الحسابات المتصلة
let connectedAccounts = [];

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>اليكسي بوت - ALIX BOT</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Cairo', sans-serif;
                    background-color: #1a1a1a;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    background: #2a2a2a;
                    padding: 2rem;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    text-align: center;
                    max-width: 450px;
                    width: 90%;
                }
                img {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 1rem;
                    border: 3px solid #ff4757;
                }
                h1 { margin: 0; color: #ff4757; }
                h2 { margin: 0.5rem 0 1.5rem; font-size: 1.2rem; color: #ccc; }
                textarea {
                    width: 100%;
                    height: 120px;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #444;
                    background: #333;
                    color: white;
                    margin-bottom: 1rem;
                    box-sizing: border-box;
                    font-family: monospace;
                }
                button {
                    background: #ff4757;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    transition: 0.3s;
                    font-size: 1rem;
                }
                button:hover { background: #ff6b81; }
                .nav-links {
                    margin-top: 1.5rem;
                    display: flex;
                    justify-content: space-around;
                }
                .nav-link {
                    color: #70a1ff;
                    text-decoration: none;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/ynZXVMbd/991b35349a4ada4789c8d9dcf591a095.gif" alt="Anime">
                <h1>اليكسي بوت</h1>
                <h2>ALIX BOT</h2>
                <form action="/login" method="POST">
                    <textarea name="appState" placeholder="ضع كوكيز حسابك هنا (JSON)..." required></textarea>
                    <button type="submit">إضافة حساب جديد وتفعيله</button>
                </form>
                <div class="nav-links">
                    <a href="/devices" class="nav-link">الأجهزة المتصلة (${connectedAccounts.length})</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { appState } = req.body;
    try {
        const state = JSON.parse(appState);
        const accountId = Date.now().toString();
        const fileName = `appstate_${accountId}.json`;
        fs.writeJSONSync(path.join(__dirname, fileName), state);
        
        if (global.startNewAccount) {
            global.startNewAccount(path.join(__dirname, fileName));
        }

        res.send('<h1>تم إضافة الحساب بنجاح! البوت يعمل الآن.</h1><a href="/">العودة للرئيسية</a>');
    } catch (e) {
        res.send('<h1>خطأ في الكوكيز! تأكد من التنسيق.</h1><a href="/">العودة</a>');
    }
});

app.get('/devices', (req, res) => {
    let rows = connectedAccounts.map(acc => `
        <li>
            <div class="acc-info">
                <strong>حساب:</strong> <a href="https://www.facebook.com/${acc.id}" target="_blank">فيس بوك (${acc.id})</a><br>
                <strong>متصل منذ:</strong> ${acc.time}<br>
                <strong>الحالة:</strong> <span style="color: #2ed573;">متصل نشط ✅</span>
            </div>
        </li>
    `).join('');
    
    if (rows === '') rows = '<li>لا توجد حسابات نشطة حالياً</li>';

    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>الأجهزة المتصلة - ALIX BOT</title>
            <style>
                body { font-family: 'Cairo', sans-serif; background: #1a1a1a; color: white; padding: 2rem; }
                .container { max-width: 600px; margin: auto; }
                h1 { color: #ff4757; text-align: center; }
                ul { list-style: none; padding: 0; }
                li { background: #2a2a2a; margin: 15px 0; padding: 20px; border-radius: 10px; border-right: 5px solid #ff4757; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
                .acc-info a { color: #70a1ff; text-decoration: none; font-weight: bold; }
                .back-btn { display: inline-block; margin-top: 20px; color: #ff4757; text-decoration: none; font-weight: bold; border: 1px solid #ff4757; padding: 8px 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>الحسابات المرتبطة ببوتي</h1>
                <ul>${rows}</ul>
                <a href="/" class="back-btn">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

function listen(callback) {
    app.listen(port, () => {
        let url = `http://localhost:${port}`;
        
        if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
            url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        }
        
        console.log(`[SERVER] Dashboard running at: ${url}`);
        
        // Provide alternative link for users who can't access .repl.co directly
        const altUrl = process.env.REPL_SLUG ? `https://${process.env.REPL_ID}.id.repl.co` : url;

        fs.writeFileSync(path.join(__dirname, 'gag.js'), `// رابط البوت الخاص بك:\nconst dashboardURL = "${url}";\nconst altDashboardURL = "${altUrl}";\nconsole.log("رابط لوحة التحكم الرئيسي: ", dashboardURL);\nconsole.log("رابط لوحة التحكم البديل: ", altDashboardURL);`);
        if (callback) callback(url);
    });
}

module.exports = { listen, connectedAccounts };