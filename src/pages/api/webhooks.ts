import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks: any = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
   
]);

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === "POST") {
    const buf = await buffer(request);
    const secret: any = request.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOKS_SECRET_KEY
      );
    } catch (err: any) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    const { type } = event;
    const stripeCheckoutSession = event.data.object as Stripe.Checkout.Session;

    if (relevantEvents.has(type)) {
      console.log(`Event received ${type}`);
      console.log(event);

      try {
        switch (type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await saveSubscription(
              stripeCheckoutSession.id,
              stripeCheckoutSession.customer.toString(),
            );

            break;
          case 'checkout.session.completed':
            await saveSubscription(
              stripeCheckoutSession.subscription.toString(),
              stripeCheckoutSession.customer.toString()
            );

            break;

          default:
            throw new Error(`Unhandled event: ${type}`);
        }
      } 
      catch (err: any) {
        return response.json(`Webhook Error: ${err.message}`);
      }



      response.status(200).json({ Received: true });
    } else {
      response.setHeader("Allow", "POST");
      response.status(405).end("Method not allowed");
    }
  }
};
