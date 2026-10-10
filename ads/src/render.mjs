export default async function run(page) {
  const dir = process.env.ADS_DIR;
  await page.setViewportSize({ width: 1080, height: 1350 });
  const out = [];
  for (const name of ["ad-a-fees", "ad-b-voo"]) {
    await page.goto(`file://${dir}/src/${name}.html`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${dir}/${name}.png` });
    out.push(name);
  }
  return out;
}
