const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const fs = require('fs-extra');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// In a real scenario, the token should be in an environment variable or config.json
// For this task, I will initialize it but the user needs to provide it.
const token = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

const userSessions = {};

const getRandomName = () => {
    const firstNames = ['Ahmed', 'Mohamed', 'Ali', 'Omar', 'Khaled', 'Youssef', 'Ibrahim', 'Hassan'];
    const lastNames = ['Mansour', 'Said', 'Abdou', 'Fayed', 'Khalil', 'Zaki', 'Salem', 'Amin'];
    return {
        first: firstNames[Math.floor(Math.random() * firstNames.length)],
        last: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
};

const getRandomBirthDate = () => {
    const year = Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return { year, month, day };
};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "مرحباً بك في بوت إنشاء حسابات فيسبوك.\n\nأرسل /create لبدء العملية.");
});

bot.onText(/\/create/, (msg) => {
    const chatId = msg.chat.id;
    userSessions[chatId] = { step: 'ASK_CONTACT', data: { ...getRandomName(), ...getRandomBirthDate() } };
    bot.sendMessage(chatId, "يرجى إرسال البريد الإلكتروني أو رقم الهاتف الذي تريد استخدامه:");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions[chatId];
    if (!session || msg.text.startsWith('/')) return;

    if (session.step === 'ASK_CONTACT') {
        session.data.contact = msg.text;
        session.step = 'ASK_PASSWORD';
        bot.sendMessage(chatId, "تم استلام جهة الاتصال. يرجى إرسال كلمة المرور التي تريد تعيينها للحساب:");
    } else if (session.step === 'ASK_PASSWORD') {
        session.data.password = msg.text;
        session.step = 'PROCESS_FB';
        bot.sendMessage(chatId, "جاري البدء في إنشاء الحساب... يرجى الانتظار.");
        
        try {
            const browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            session.browser = browser;
            session.page = page;

            await page.goto('https://www.facebook.com/reg/', { waitUntil: 'networkidle2' });

            // Fill registration form
            await page.type('input[name="firstname"]', session.data.first);
            await page.type('input[name="lastname"]', session.data.last);
            await page.type('input[name="reg_email__"]', session.data.contact);
            
            // Check if it's email to confirm
            const isEmail = session.data.contact.includes('@');
            if (isEmail) {
                await page.type('input[name="reg_email_confirmation__"]', session.data.contact);
            }

            await page.type('input[name="reg_passwd__"]', session.data.password);
            
            await page.select('select[name="birthday_day"]', session.data.day.toString());
            await page.select('select[name="birthday_month"]', session.data.month.toString());
            await page.select('select[name="birthday_year"]', session.data.year.toString());
            
            // Select gender (1 = Female, 2 = Male)
            await page.click('input[value="2"]'); 

            await page.click('button[name="websubmit"]');
            
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});

            session.step = 'ASK_CODE';
            bot.sendMessage(chatId, "لقد أرسل فيسبوك رمز التحقق. يرجى إدخال الكود هنا:");
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "حدث خطأ أثناء الاتصال بفيسبوك. قد يكون الـ IP محظوراً أو هناك مشكلة تقنية.");
            if (session.browser) await session.browser.close();
            delete userSessions[chatId];
        }
    } else if (session.step === 'ASK_CODE') {
        const code = msg.text;
        const page = session.page;
        
        try {
            // Facebook verification code input varies, usually it's 'code' or similar
            // This is a simplified attempt to find and fill it
            await page.waitForSelector('input', { timeout: 10000 });
            const inputs = await page.$$('input');
            let filled = false;
            for (const input of inputs) {
                const name = await (await input.getProperty('name')).jsonValue();
                if (name && (name.includes('code') || name.includes('confirmation'))) {
                    await input.type(code);
                    filled = true;
                    break;
                }
            }
            
            if (!filled) {
                // Try finding by placeholder or label if name fails
                await page.type('input', code); // Risky fallback
            }

            // Click confirm/submit button
            const buttons = await page.$$('button');
            for (const button of buttons) {
                const text = await (await button.getProperty('innerText')).jsonValue();
                if (text && (text.includes('Confirm') || text.includes('تأكيد') || text.includes('Continue'))) {
                    await button.click();
                    break;
                }
            }

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
            
            bot.sendMessage(chatId, `تم الانتهاء! تفاصيل الحساب:\nالاسم: ${session.data.first} ${session.data.last}\nالبريد/الهاتف: ${session.data.contact}\nكلمة المرور: ${session.data.password}\n\nيرجى محاولة تسجيل الدخول للتأكد.`);
            
            if (session.browser) await session.browser.close();
            delete userSessions[chatId];
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "فشل تأكيد الرمز. يرجى المحاولة مرة أخرى.");
        }
    }
});

console.log("Bot is running...");
