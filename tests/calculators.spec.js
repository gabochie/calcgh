const { test, expect } = require('@playwright/test');

const APP_PATH = '/';

test.beforeEach(async ({ page }) => {
  await page.goto(APP_PATH, { waitUntil: 'domcontentloaded', timeout: 15000 });
});

// ─── WAEC GRADE CALCULATOR ───
test.describe('WAEC Grade Calculator', () => {

  test('calculates aggregate correctly with default values', async ({ page }) => {
    await page.click('button:has-text("Calculate Aggregate")');
    const result = page.locator('#waec-result');
    await expect(result).toHaveClass(/show/);
    const agg = page.locator('#waec-agg');
    await expect(agg).toContainText('Aggregate:');
    await expect(agg).toContainText('/54');
  });

  test('shows First Class for aggregate <= 6', async ({ page }) => {
    const selects = page.locator('#waec-rows select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      await selects.nth(i).selectOption('1');
    }
    await page.click('button:has-text("Calculate Aggregate")');
    const status = page.locator('#waec-status');
    await expect(status).toContainText('First Class');
  });

  test('shows Pass for aggregate 25-30', async ({ page }) => {
    const selects = page.locator('#waec-rows select');
    const count = await selects.count();
    const values = [7, 5, 5, 5, 4, 3];
    for (let i = 0; i < count; i++) {
      await selects.nth(i).selectOption(String(values[i]));
    }
    await page.click('button:has-text("Calculate Aggregate")');
    const status = page.locator('#waec-status');
    await expect(status).toContainText('Pass');
  });

  test('shows Fail for aggregate > 30', async ({ page }) => {
    const selects = page.locator('#waec-rows select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      await selects.nth(i).selectOption('9');
    }
    await page.click('button:has-text("Calculate Aggregate")');
    const status = page.locator('#waec-status');
    await expect(status).toContainText(/not qualified/i);
  });

  test('aggregate value matches sum of selected grades', async ({ page }) => {
    const selects = page.locator('#waec-rows select');
    const grades = [1, 2, 3, 4, 5, 6];
    const expectedSum = grades.reduce((a, b) => a + b, 0);
    for (let i = 0; i < grades.length; i++) {
      await selects.nth(i).selectOption(String(grades[i]));
    }
    await page.click('button:has-text("Calculate Aggregate")');
    const agg = page.locator('#waec-agg');
    await expect(agg).toContainText(String(expectedSum));
  });
});

// ─── CURRENCY CONVERTER ───
test.describe('GHS Currency Converter', () => {

  test('converts GHS to USD correctly', async ({ page }) => {
    await page.fill('#fx-amount', '100');
    await page.selectOption('#fx-direction', 'from');
    await page.selectOption('#fx-currency', 'USD');
    await page.click('button:has-text("Convert Now")');
    const result = page.locator('#fx-result');
    await expect(result).toHaveClass(/show/);
    const toVal = page.locator('#fx-to-val');
    await expect(toVal).not.toHaveText('—');
    const amt = parseFloat((await toVal.textContent()).replace(/,/g, ''));
    expect(amt).toBeCloseTo(7.5758, 1);
  });

  test('converts foreign back to GHS correctly', async ({ page }) => {
    await page.fill('#fx-amount', '100');
    await page.selectOption('#fx-direction', 'to');
    await page.selectOption('#fx-currency', 'USD');
    await page.click('button:has-text("Convert Now")');
    const toVal = page.locator('#fx-to-val');
    await expect(toVal).not.toHaveText('—');
    const amt = parseFloat((await toVal.textContent()).replace(/,/g, ''));
    expect(amt).toBeCloseTo(1320.00, 1);
  });

  test('shows rate note with indicative disclaimer', async ({ page }) => {
    await page.fill('#fx-amount', '200');
    await page.selectOption('#fx-currency', 'GBP');
    await page.click('button:has-text("Convert Now")');
    const note = page.locator('#fx-rate-note');
    await expect(note).toContainText('indicative rate');
  });

  test('handles zero amount gracefully', async ({ page }) => {
    await page.fill('#fx-amount', '0');
    await page.click('button:has-text("Convert Now")');
    const toVal = page.locator('#fx-to-val');
    await expect(toVal).toContainText('0');
  });
});

// ─── LOAN CALCULATOR ───
test.describe('Ghana Loan Calculator', () => {

  test('calculates reducing balance loan correctly', async ({ page }) => {
    await page.fill('#loan-amount', '10000');
    await page.fill('#loan-rate', '28');
    await page.fill('#loan-term', '24');
    await page.selectOption('#loan-type', 'reducing');
    await page.click('button:has-text("Calculate Repayment")');
    const result = page.locator('#loan-result');
    await expect(result).toHaveClass(/show/);

    const monthly = page.locator('#loan-monthly');
    await expect(monthly).toContainText('GH₵');
    const totalPay = page.locator('#loan-total');
    const interest = page.locator('#loan-interest');

    const monthlyText = await monthly.textContent();
    const monthlyVal = parseFloat(monthlyText.replace(/[^0-9.]/g, ''));
    expect(monthlyVal).toBeGreaterThan(0);
    expect(monthlyVal).toBeLessThan(1000);

    const totalText = await totalPay.textContent();
    const interestText = await interest.textContent();
    const totalVal = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    const interestVal = parseFloat(interestText.replace(/[^0-9.]/g, ''));
    expect(totalVal).toBeGreaterThan(10000);
    expect(interestVal).toBeGreaterThan(0);
  });

  test('calculates flat rate loan correctly', async ({ page }) => {
    await page.fill('#loan-amount', '5000');
    await page.fill('#loan-rate', '20');
    await page.fill('#loan-term', '12');
    await page.selectOption('#loan-type', 'flat');
    await page.click('button:has-text("Calculate Repayment")');

    const monthly = page.locator('#loan-monthly');
    await expect(monthly).toContainText('GH₵');
    const monthlyVal = parseFloat((await monthly.textContent()).replace(/[^0-9.]/g, ''));
    expect(monthlyVal).toBe(500);
  });

  test('shows effective interest rate', async ({ page }) => {
    await page.fill('#loan-amount', '20000');
    await page.fill('#loan-rate', '30');
    await page.fill('#loan-term', '36');
    await page.selectOption('#loan-type', 'reducing');
    await page.click('button:has-text("Calculate Repayment")');
    const eff = page.locator('#loan-rate-eff');
    await expect(eff).toContainText('%');
  });
});

// ─── VAT CALCULATOR ───
test.describe('Ghana VAT Calculator', () => {

  test('adds standard VAT (18.5%) correctly', async ({ page }) => {
    await page.fill('#vat-amount', '1000');
    await page.selectOption('#vat-type', 'add');
    await page.selectOption('#vat-cat', 'standard');
    await page.click('button:has-text("Calculate Tax")');
    const result = page.locator('#vat-result');
    await expect(result).toHaveClass(/show/);

    const total = page.locator('#vat-total');
    const totalText = await total.textContent();
    const totalVal = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    expect(totalVal).toBeCloseTo(1185, 0);
  });

  test('removes standard VAT correctly', async ({ page }) => {
    await page.fill('#vat-amount', '1185');
    await page.selectOption('#vat-type', 'remove');
    await page.selectOption('#vat-cat', 'standard');
    await page.click('button:has-text("Calculate Tax")');

    const base = page.locator('#vat-base');
    const baseText = await base.textContent();
    const baseVal = parseFloat(baseText.replace(/[^0-9.]/g, ''));
    expect(baseVal).toBeCloseTo(1000, 0);
  });

  test('calculates VAT-only (15%) correctly', async ({ page }) => {
    await page.fill('#vat-amount', '500');
    await page.selectOption('#vat-type', 'add');
    await page.selectOption('#vat-cat', 'vat');
    await page.click('button:has-text("Calculate Tax")');

    const total = page.locator('#vat-total');
    await expect(total).toContainText('575');
  });

  test('calculates NHIL + GETFL only (3.5%)', async ({ page }) => {
    await page.fill('#vat-amount', '2000');
    await page.selectOption('#vat-type', 'add');
    await page.selectOption('#vat-cat', 'nhil');
    await page.click('button:has-text("Calculate Tax")');

    const total = page.locator('#vat-total');
    await expect(total).toContainText('2,070');
    const levies = page.locator('#vat-levies');
    await expect(levies).toContainText('70');
  });

  test('calculates COVID levy inclusive total', async ({ page }) => {
    await page.fill('#vat-amount', '1000');
    await page.selectOption('#vat-type', 'add');
    await page.selectOption('#vat-cat', 'covid');
    await page.click('button:has-text("Calculate Tax")');

    const total = page.locator('#vat-total');
    await expect(total).toContainText('1,195');
  });

  test('shows correct line items in breakdown grid', async ({ page }) => {
    await page.fill('#vat-amount', '500');
    await page.selectOption('#vat-type', 'add');
    await page.selectOption('#vat-cat', 'standard');
    await page.click('button:has-text("Calculate Tax")');

    const base = page.locator('#vat-base');
    const vatAmt = page.locator('#vat-vat');
    const levies = page.locator('#vat-levies');

    await expect(base).toContainText('500');
    await expect(vatAmt).toContainText('75');
    await expect(levies).toContainText('17.5');
  });
});

// ─── BMI CALCULATOR ───
test.describe('BMI Calculator', () => {

  test('calculates BMI for default values (72kg, 172cm)', async ({ page }) => {
    await page.fill('#bmi-weight', '72');
    await page.fill('#bmi-height', '172');
    await page.click('button:has-text("Calculate BMI")');
    const result = page.locator('#bmi-result');
    await expect(result).toHaveClass(/show/);
    const bmi = page.locator('#bmi-val');
    await expect(bmi).toContainText('24.3');
  });

  test('classifies as Normal weight for BMI 18.5-25', async ({ page }) => {
    await page.fill('#bmi-weight', '65');
    await page.fill('#bmi-height', '170');
    await page.click('button:has-text("Calculate BMI")');
    const cat = page.locator('#bmi-cat');
    await expect(cat).toContainText('Normal');
  });

  test('classifies as Underweight for BMI < 18.5', async ({ page }) => {
    await page.fill('#bmi-weight', '50');
    await page.fill('#bmi-height', '175');
    await page.click('button:has-text("Calculate BMI")');
    const cat = page.locator('#bmi-cat');
    await expect(cat).toContainText('Underweight');
  });

  test('classifies as Overweight for BMI 25-30', async ({ page }) => {
    await page.fill('#bmi-weight', '85');
    await page.fill('#bmi-height', '170');
    await page.click('button:has-text("Calculate BMI")');
    const cat = page.locator('#bmi-cat');
    await expect(cat).toContainText('Overweight');
  });

  test('classifies as Obese Class I for BMI 30-35', async ({ page }) => {
    await page.fill('#bmi-weight', '100');
    await page.fill('#bmi-height', '170');
    await page.click('button:has-text("Calculate BMI")');
    const cat = page.locator('#bmi-cat');
    await expect(cat).toContainText('Obese Class I');
  });

  test('classifies as Obese II/III for BMI >= 35', async ({ page }) => {
    await page.fill('#bmi-weight', '120');
    await page.fill('#bmi-height', '165');
    await page.click('button:has-text("Calculate BMI")');
    const cat = page.locator('#bmi-cat');
    await expect(cat).toContainText('Obese Class II/III');
  });

  test('displays ideal weight range', async ({ page }) => {
    await page.fill('#bmi-weight', '80');
    await page.fill('#bmi-height', '180');
    await page.click('button:has-text("Calculate BMI")');
    const ideal = page.locator('#bmi-ideal');
    const idealLow = page.locator('#bmi-ideal-low');
    const idealHigh = page.locator('#bmi-ideal-high');

    await expect(ideal).toContainText('kg');
    await expect(idealLow).toContainText('kg');
    await expect(idealHigh).toContainText('kg');
  });
});

// ─── UI / LAYOUT TESTS ───
test.describe('UI & Layout', () => {

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/CalcGH/);
  });

  test('all 5 calculator sections are present', async ({ page }) => {
    await expect(page.locator('#waec')).toBeVisible();
    await expect(page.locator('#forex')).toBeVisible();
    await expect(page.locator('#loan')).toBeVisible();
    await expect(page.locator('#vat')).toBeVisible();
    await expect(page.locator('#health')).toBeVisible();
  });

  test('nav bar is sticky with logo and premium button', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(page.locator('.nav-logo')).toContainText('CalcGH');
    await expect(page.locator('.btn-premium')).toContainText('Go Ad-Free');
  });

  test('hero section loads with stats', async ({ page }) => {
    await expect(page.locator('.hero h1')).toContainText('Ghana');
    await expect(page.locator('.hero-stats')).toBeVisible();
  });

  test('premium modal opens and closes', async ({ page }) => {
    await page.click('.btn-premium');
    const modal = page.locator('#modal');
    await expect(modal).toHaveClass(/open/);
    await page.click('.modal-close');
    await expect(modal).not.toHaveClass(/open/);
  });

  test('premium plan selector switches plans', async ({ page }) => {
    await page.goto(APP_PATH + '#premium');
    const yearly = page.locator('.plan-opt').nth(1);
    await yearly.click();
    await expect(yearly).toHaveClass(/sel/);
    const total = page.locator('#o-total');
    await expect(total).toContainText('GH₵ 79');
  });

  test('all free tools have free badges', async ({ page }) => {
    const badges = page.locator('.tc-free-badge');
    const count = await badges.count();
    expect(count).toBe(5);
  });

  test('footer contains key links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.locator('text=WAEC Aggregate')).toBeVisible();
    await expect(footer.locator('text=Privacy Policy')).toBeVisible();
  });
});

// ─── RESPONSIVE / ACCESSIBILITY ───
test.describe('Responsiveness', () => {

  test('mobile viewport renders sidebar elements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('#waec')).toBeVisible();
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('tablet viewport renders all tools', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.tools-grid')).toBeVisible();
  });
});
