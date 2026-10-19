import { expect, test } from "@playwright/test";

test("hosted demo keeps messages ephemeral and cannot call a backend", async ({
  page,
}) => {
  let contactedBackend = false;
  await page.route("**/network-probe", (route) => {
    contactedBackend = true;
    return route.fulfill({ body: "Unexpected backend response" });
  });
  await page.goto("/support-demo/");
  await page
    .getByRole("textbox", { exact: true, name: "Message" })
    .fill("delivery");
  await page.getByRole("button", { exact: true, name: "Send message" }).click();
  await expect(page.locator('li[data-role="assistant"]')).toHaveCount(1);
  const blocked = await page.evaluate(async () => {
    try {
      await fetch("./network-probe");
      return false;
    } catch {
      return true;
    }
  });
  expect(blocked).toBe(true);
  expect(contactedBackend).toBe(false);
  expect(await page.context().cookies()).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.reload();
  await expect(page.locator('li[data-role="assistant"]')).toHaveCount(0);
});
