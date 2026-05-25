import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

// 1. Cargar la página
await page.goto('http://localhost:5173/login-responsable');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'verify_1_initial.png', fullPage: true });
console.log('1. Página cargada');

// Verificar campos presentes (clave: debe ser email+password, NO cedula)
const fields = await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll('input'));
  return inputs.map(i => ({ type: i.type, placeholder: i.placeholder }));
});
console.log('Campos en el formulario:', JSON.stringify(fields));
const hasCedula = fields.some(f => f.placeholder.toLowerCase().includes('cedula') || f.placeholder.toLowerCase().includes('cédula'));
const hasEmail = fields.some(f => f.type === 'email');
const hasPassword = fields.some(f => f.type === 'password');
console.log('NO tiene campo cédula:', !hasCedula);
console.log('Tiene campo email:', hasEmail);
console.log('Tiene campo password:', hasPassword);

// 2. Verificar botón ojo existe en DOM
const eyeExists = await page.$('.resp-login-eye') !== null;
console.log('Botón ojo en DOM:', eyeExists);

// 3. Toggle de contraseña con force (puede estar detrás del input en headless)
if (eyeExists) {
  await page.click('.resp-login-eye', { force: true });
  await page.waitForTimeout(300);
  const typeAfter = await page.$eval('input[placeholder="Tu contraseña"]', el => el.type);
  console.log('Tipo input tras click ojo:', typeAfter, '(esperado: text)');
  await page.click('.resp-login-eye', { force: true });
  await page.waitForTimeout(200);
  const typeBack = await page.$eval('input[placeholder="Tu contraseña"]', el => el.type);
  console.log('Tipo input tras segundo click:', typeBack, '(esperado: password)');
}

// 4. Submit con campos vacíos
await page.click('button[type="submit"]');
await page.waitForTimeout(500);
const error1 = await page.textContent('.resp-login-error').catch(() => null);
console.log('Error campos vacíos:', error1?.trim());
await page.screenshot({ path: 'verify_2_empty_fields.png', fullPage: true });

// 5. Credenciales incorrectas
await page.fill('input[type="email"]', 'noexiste@test.com');
await page.fill('input[placeholder="Tu contraseña"]', 'wrongpass');
await page.screenshot({ path: 'verify_3_filled.png', fullPage: true });
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
const error2 = await page.textContent('.resp-login-error').catch(() => null);
console.log('Error credenciales incorrectas:', error2?.trim());
await page.screenshot({ path: 'verify_4_wrong_creds.png', fullPage: true });

await browser.close();
console.log('Verificación completa');
