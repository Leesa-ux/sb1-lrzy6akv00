import { db } from "../lib/db";
import { sendBrevoSMS } from "../lib/brevo-client";
import { getSMSTemplate } from "../lib/sms-templates";

async function sendLaunchDaySMS() {
  try {
    console.log("Starting Launch Day SMS campaign...");

    const users = await db.user.findMany({
      where: {
        phone: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        role: true,
      },
    });

    console.log(`Found ${users.length} users with phone numbers`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.phone) continue;

      try {
        await sendBrevoSMS({
          phone: user.phone,
          message: getSMSTemplate("launch_day"),
        });

        successCount++;
        console.log(`✓ SMS sent to ${user.email}`);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to send SMS to ${user.email}:`, error);
      }
    }

    console.log("\n=== Launch Day SMS Campaign Complete ===");
    console.log(`Total users: ${users.length}`);
    console.log(`Successfully sent: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Success rate: ${((successCount / users.length) * 100).toFixed(2)}%`);

    process.exit(0);
  } catch (error) {
    console.error("Fatal error in Launch Day SMS script:", error);
    process.exit(1);
  }
}

sendLaunchDaySMS();
