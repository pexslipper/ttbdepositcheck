const puppeteer = require("puppeteer");

const getdepositlist = (async () => {

    const browser = await puppeteer.launch({headless: false ,slowMo :60 });
    const page = await browser.newPage();
    await page.goto('https://www.ttbdirect.com/ttb/kdw1.39.0#_frmIBPreLogin', {
        waitUntil: 'networkidle0',
      });
    await Promise.all([
        await page.waitForSelector('#frmIBPreLogin_txtUserId'),
        await page.focus('#frmIBPreLogin_txtUserId'),
        await page.keyboard.type('USERNAME'),//username
        await page.waitForSelector('#frmIBPreLogin_txtPassword'),
        await page.focus('#frmIBPreLogin_txtPassword'),
        await page.keyboard.type('PASSWORD'),//password
        await page.waitForSelector('#frmIBPreLogin_btnLogIn'),
        await page.click('#frmIBPreLogin_btnLogIn'),
        await page.waitForSelector('#frmIBPostLoginDashboard_btnMenuMyInbox'),
        await page.$eval('#frmIBPostLoginDashboard_btnMenuMyInbox', elem => elem.click()),
        await page.waitForSelector('li.seg2Normal[index="0"]>div#segMenuOptionsbox_segMenuOptionsbox'),
        await page.$eval('li.seg2Normal[index="0"]>div#segMenuOptionsbox_segMenuOptionsbox', elem => elem.click()),
        await page.waitForSelector('li.seg2Normal[index="0"]>div#segMenuOptionsbox_segMenuOptionsbox'),
        await page.$eval('li.seg2Normal[index="0"]>div#segMenuOptionsbox_segMenuOptionsbox', elem => elem.click()),

    ]);

const items = await page.$$('#vbox201224764772_lblNotfnSub');
const slips = [];
for (let i = 0, length = items.length; i < 10; i++) {
    const item = await page.evaluateHandle((i) => {
        return document.querySelectorAll('#vbox201224764772_lblNotfnSub')[i];
   }, i);
    const tchk = await page.evaluate(el => el.textContent, item);
    let check = tchk.startsWith("แจ้งรายการเงินเข้าบัญชี-สำเร็จ"); //เช็คข้อความที่ขึ้นต้นด้วยคำว่ามีเงิน
    //const slip = await page.$eval('#frmIBNotificationHome_lblNotfnMessage',text => text.innerHTML)//ดึงข้อความมาเก็บ
    //let check = slip.startsWith("มีเงิน") //เช็คข้อความที่ขึ้นต้นด้วยคำว่ามีเงิน
    if(check){
      await item.click();
      await page.waitForSelector('#frmIBNotificationHome_lblNotfnMessage');//รอข้อควมขึ้น
      const slip = await page.$eval('#frmIBNotificationHome_lblNotfnMessage',text => text.innerHTML)//ดึงข้อความมาเก็บ
let reci = {
"amt":00,
"bank":"",
"acc":"",
"name":"",
"date":""
};
let bpos = slip.search("บ.โอนเข้า");
const amt = slip.slice(6,bpos);/////////////////////จำนวนเงิน
let accpos = slip.search("จาก");
let t2 = slip.slice(accpos);
let xpos = t2.search(" X");
const bank = t2.slice(4,xpos);//////////////////////ธนาคาร
const trimacc = t2.slice(xpos);
const acc = trimacc.slice(1,6);////////////////////เลขบัญชีสี่ตัวสุดท้าย
const trimname = trimacc.slice(6);
const accname = trimname.slice(1,16);//////////////ชื่อ 15 ตัวอักษร
const trimdate = trimname.slice(16);
const bcut = trimdate.search("บ.")
const date = trimdate.slice(bcut+2)////////////////วันที่เวลา
reci.acc = acc;
reci.amt = amt;
reci.bank = bank;
reci.date = date;
reci.name = accname;
      await slips.push(reci)
  }

}
    console.log(slips);

    await page.$eval('#hbxIBPostLogin_lnkLogOut', elem => elem.click());
    await browser.close();
    return slips
    
})();

