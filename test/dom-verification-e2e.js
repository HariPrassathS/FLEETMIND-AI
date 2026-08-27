const puppeteer = require('puppeteer');
const fs = require('fs');

async function runE2E() {
  console.log('Starting E2E DOM Verification Workflow...');
  
  if (!fs.existsSync('./test/e2e-screenshots')) {
    fs.mkdirSync('./test/e2e-screenshots', { recursive: true });
  }

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  // Custom function to log out DOM elements for verification
  const logDOM = async (stepName, selector = 'body') => {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const html = await page.$eval(selector, el => el.outerHTML);
      const text = await page.$eval(selector, el => el.innerText);
      console.log(`\n--- DOM VERIFICATION: ${stepName} ---`);
      console.log(`Text Content Preview:\n${text.substring(0, 500)}...\n`);
      await page.screenshot({ path: `./test/e2e-screenshots/${stepName.replace(/ /g, '_')}.png` });
      return true;
    } catch (error) {
      console.log(`\n--- DOM ERROR: ${stepName} ---`);
      console.error(error.message);
      await page.screenshot({ path: `./test/e2e-screenshots/ERROR_${stepName.replace(/ /g, '_')}.png` });
      return false;
    }
  };

  try {
    // 1. Go to homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001');
    await logDOM('1_Homepage');

    // 2. Log in as Customer
    console.log('Navigating to Login...');
    await page.goto('http://localhost:3001/login');
    await logDOM('2_Login_Page');

    // Select Customer role
    await page.waitForSelector('button:has-text("Customer")');
    const customerBtns = await page.$$('button');
    for (const btn of customerBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Customer')) await btn.click();
    }
    
    // Login
    await page.type('input[type="email"]', 'customer@fleetmind.com');
    await page.type('input[type="password"]', 'customer123');
    
    // Need to click submit
    const submitBtns = await page.$$('button[type="submit"]');
    if (submitBtns.length > 0) await submitBtns[0].click();
    
    // Wait for customer dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await logDOM('3_Customer_Dashboard');

    // 3. Create Shipment
    console.log('Creating shipment...');
    await page.goto('http://localhost:3001/customer/new-shipment');
    await logDOM('4_New_Shipment_Page');
    
    // Fill out form
    await page.type('input[name="pickup_address"]', 'E2E Pickup Addr');
    await page.type('input[name="destination_address"]', 'E2E Dest Addr');
    await page.type('input[name="weight"]', '1000');
    // submit
    const createBtns = await page.$$('button[type="submit"]');
    if (createBtns.length > 0) await createBtns[0].click();
    
    await page.waitForTimeout(2000);
    await logDOM('5_Shipment_Created_Dashboard');

    // Logout
    console.log('Logging out...');
    await page.goto('http://localhost:3001'); // Force navigation to clear state if logout button is hard to find
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    
    // 4. Log in as Dispatcher
    console.log('Logging in as Dispatcher...');
    await page.goto('http://localhost:3001/login');
    
    await page.waitForSelector('button');
    const dispatchBtns = await page.$$('button');
    for (const btn of dispatchBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Dispatcher')) await btn.click();
    }
    
    await page.type('input[type="email"]', 'dispatcher@fleetmind.com');
    await page.type('input[type="password"]', 'dispatch123');
    const dispatchSubmitBtns = await page.$$('button[type="submit"]');
    if (dispatchSubmitBtns.length > 0) await dispatchSubmitBtns[0].click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await logDOM('6_Dispatcher_Dashboard');

    // Go to shipments, find the new one and accept it
    await page.goto('http://localhost:3001/dispatcher/shipments');
    await logDOM('7_Dispatcher_Shipments');
    
    // Click on a pending shipment
    const links = await page.$$('a');
    for (const link of links) {
      const href = await page.evaluate(el => el.href, link);
      if (href.includes('/dispatcher/shipments/')) {
        await link.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    await logDOM('8_Dispatcher_Shipment_Detail');

    // Click assign/accept
    const actionBtns = await page.$$('button');
    for (const btn of actionBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Approve') || text.includes('Assign')) {
        await btn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await logDOM('9_Shipment_Assigned');

    // Logout
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // 5. Log in as Driver
    console.log('Logging in as Driver...');
    await page.goto('http://localhost:3001/login');
    
    await page.waitForSelector('button');
    const driverBtns = await page.$$('button');
    for (const btn of driverBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Driver')) await btn.click();
    }
    
    await page.type('input[type="email"]', 'driver@fleetmind.com');
    await page.type('input[type="password"]', 'driver123');
    const driverSubmitBtns = await page.$$('button[type="submit"]');
    if (driverSubmitBtns.length > 0) await driverSubmitBtns[0].click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // VERIFY DRIVER DASHBOARD DOM
    await logDOM('10_Driver_Dashboard_Initial');
    
    await page.goto('http://localhost:3001/driver/route');
    await page.waitForTimeout(2000);
    await logDOM('11_Driver_Route');
    
    await page.goto('http://localhost:3001/driver/shipments');
    await page.waitForTimeout(2000);
    await logDOM('12_Driver_Shipments');

    console.log('E2E DOM Verification Complete.');

  } catch (err) {
    console.error('Fatal Error during E2E DOM Verification:', err);
    await page.screenshot({ path: './test/e2e-screenshots/FATAL_ERROR.png' });
  } finally {
    await browser.close();
  }
}

runE2E();
