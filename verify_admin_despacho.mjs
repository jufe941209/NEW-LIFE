import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Ir directo al admin (sin login real, solo screenshot del componente)
await page.goto('http://localhost:5173/admin');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'verify_admin_despacho.png', fullPage: true });
console.log('Screenshot tomado');

await browser.close();
