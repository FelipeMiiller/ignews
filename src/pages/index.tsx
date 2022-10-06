import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { SubscribeButton } from "../conponents/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

const Home = (props: HomeProps) => {
 // console.log(props);


 
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get acess to all the publications <br />
            <span>for {props.product.amount} month</span>
          </p>
          <SubscribeButton />
        </section>

        <img src="./images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1LoZTPKcH4N1y0Lz2xvclfS5", {
    expand: ["product"],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  };

  console.log("ok");
  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
