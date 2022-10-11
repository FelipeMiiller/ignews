import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from "faunadb";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/react";
import { authOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};



interface userFaunaType {
  ref: {
    id: string;
  };
  data: {
    id: string;
    name: string;
    email: string;
    image: string;
    stripe_customer_id: string;
  };
}





/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default async (request: NextApiRequest, response: NextApiResponse) => {


  if (request.method === "POST") {
    const session = await unstable_getServerSession(request, response, authOptions)
     console.table(session?.user)

    let userFauna:userFaunaType
    await fauna.query(
      q.Get( q.Match(
        q.Index('user_by_email'),
        session?.user.email
      ))
    )
    .then((ret:any) => 
    {
      console.table(ret)
      userFauna= ret;
    })
    .catch((err) => console.error(
      'Error: [%s] %s: %s',
      err.name,
      err.message,
      err.errors()[0].description,
    ))


    if(!userFauna.data.stripe_customer_id) {
      const stripeCustomer = await stripe.customers.create({name: session?.user.name,
        email: session?.user.email,
      });
        console.table(stripeCustomer)

        
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), userFauna.ref.id),
          {
            data: { 
              stripe_customer_id: stripeCustomer.id,
            },
          },
        )
      )

    
    }
    const stripeCheckoutSession =  await stripe.checkout.sessions.create({
      customer: userFauna.data.stripe_customer_id,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1LoZTPKcH4N1y0Lz2xvclfS5", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })
    return response.status(200).json({sessionId: stripeCheckoutSession.id})


   
  } else {
    response.setHeader("Allow", "POST");
    response.status(405).end("Method not allowed");
  }
};
