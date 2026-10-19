import { expect, test } from "@playwright/test";

test("cited answer, human takeover, and localized RTL layout", async ({
  page,
}) => {
  await page.goto("/support-demo");
  await page
    .getByRole("textbox", { exact: true, name: "Message" })
    .fill("delivery");
  await page.getByRole("button", { exact: true, name: "Send message" }).click();
  await expect(page.locator('li[data-role="assistant"]')).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sources: Delivery policy" })
  ).toBeVisible();
  await page
    .getByRole("button", { exact: true, name: "Request human" })
    .click();
  await page
    .getByRole("button", { exact: true, name: "Claim as Demo Agent" })
    .click();
  await page
    .getByRole("textbox", { exact: true, name: "Message" })
    .fill("hours");
  await page.getByRole("button", { exact: true, name: "Send message" }).click();
  await expect(page.locator('li[data-role="assistant"]')).toHaveCount(1);
  await page.getByLabel("Workspace language").selectOption("ar");
  await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { exact: true, name: "مساحة الدعم" })
  ).toBeVisible();
});

for (const width of [320, 768, 1024, 1440]) {
  test(`workspace fits ${width}px and produces a real screenshot`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1000, width });
    await page.goto("/support-demo");
    await expect(
      page.getByRole("heading", { exact: true, name: "Support workspace" })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await page.screenshot({
      fullPage: true,
      path: `test-results/support-${width}.png`,
    });
  });
}
