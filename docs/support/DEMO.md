# Repeatable synthetic demonstration

1. Run `pnpm demo:support`; open `/support-demo` on port 3100.
2. Select Demo Shop and customer A. Send `delivery` in the customer simulator.
3. Confirm a localized delivery answer, a Delivery policy citation, and one cited answer in the metrics.
4. Send `delivery hours`. The equally ranked articles must escalate to the waiting queue.
5. Claim as Demo Agent. Send `hours` as the customer. Confirm that no automated reply is added.
6. Switch the composer to Agent reply; send `I am checking your request.` The response must appear as an agent message.
7. Resolve the conversation. Confirm the composer is disabled and resolved metrics update.
8. Resume automation and send `hours`; confirm the cited answer returns.
9. Switch the workspace to Arabic and the reply language to Arabic. Send `التوصيل`; confirm RTL and the Arabic article answer. Repeat with Persian and `ارسال`.
10. Select Demo Studio and send `delivery`: there is no Shop-policy answer or citation. Reset the demo to restore all initial fixtures.

All names and policies are fictional. Sending here never contacts an external person or service. No money is charged, booked or refunded. Reloading discards state. The manual walkthrough is a review procedure, not evidence that browser QA has passed.
