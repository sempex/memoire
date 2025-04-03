import { UserWebhookEvent, WebhookEvent } from "@clerk/express";
import { Router } from "express";
import { Webhook } from "svix";

const webhookRouter = Router();

webhookRouter.post("/", async (req, res) => {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers and body
  const headers = req.headers;
  const payload = req.body;

  // Get Svix headers for verification
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return void res.status(400).json({
      success: false,
      message: "Error: Missing svix headers",
    });
  }

  let evt: UserWebhookEvent;

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If verification fails, error out and return error code
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    }) as UserWebhookEvent;
  } catch (err: any) {
    console.log("Error: Could not verify webhook:", err.message);
    return void res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  switch (evt.type) {
    case "user.created":
      console.log("User created");
      break;
    case "user.updated":
      console.log("User updated");
      break;
    case "user.deleted":
      console.log("User deleted");
      break;
  }

  return void res.status(200).json({
    success: true,
    message: "Webhook received",
  });
});

export default webhookRouter;
