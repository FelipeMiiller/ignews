import { info } from "console";
import { signIn, useSession } from "next-auth/react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/strip-js";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session, status } = useSession();

 async function handleSubscribe() {
    if (status === "unauthenticated") 
    {
      signIn("github");
      return;
    }

    //requisition
    try{

    const response = await api.post('api/subscribe')

    const {sessionId}= response.data;
    console.log(response.data);

    const stripe = await getStripeJs()


    stripe?.redirectToCheckout({sessionId})

    }
    catch (err:any)
    {
     alert("Error: nao sei" + err.message);
    }



  };

  return (
    <button type="button" 
     className={styles.subscribeButton} 
     onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}
