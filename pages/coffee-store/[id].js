import Link from "next/link";
import { useRouter } from "next/router";
import CoffeeStoreData from "../../data/coffee-stores.json";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/coffee-store.module.css";
import cls from "classname";
import { getCoffeeStores } from "@/lib/coffee-stores";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../store/store-context";
import { isEmpty, fetcher } from "@/utils";
import useSWR from "swr";

export async function getStaticProps(staticProps){
    const params = staticProps.params;
    const coffeeStores = await getCoffeeStores(); //getCoffeeStores() API call
    const findCoffeeStoreById = coffeeStores.find((coffestore) => { return coffestore.id.toString() === params.id})
    return{
        props: {
            CoffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {}
        }
    }
}

export async function getStaticPaths(){
  const CoffeeStore = await getCoffeeStores();  //getCoffeeStores() API call
  const paths = CoffeeStore.map((coffeeStore) => {
    return{
      params: {
        id: coffeeStore.id.toString()
      }
    }
  })
    return{
        paths,
        fallback: true
    }
}

const CoffeeStore = (initialProps) => {
    const router = useRouter(); 
    if(router.isFallback){
        return <div>Loading...</div>
    }

    const id = router.query.id;

    const [coffeeStore, setCoffeeStore] = useState(initialProps.CoffeeStore);   //this state is used to store data which is fetched from useContext-store 

    const { 
      state: { coffeeStores } 
    } = useContext(StoreContext)

    const handleCreateCoffeeStore = async (coffeeStore) => {
      try {
        const{ id, name, address, neighbourhood, voting, imgUrl } = coffeeStore
        const response =  await fetch("/api/createCoffeeStore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id, 
            name, 
            voting: 0, 
            imgUrl,
            neighbourhood: neighbourhood || "", 
            address: address || "", 
          })
        });
        const dbCoffeeStore = response.json();
      } catch(err){
        console.error("Error creting coffee store", err);
      }
    }

    useEffect(() => {
      if(isEmpty(initialProps.CoffeeStore)){
        if(coffeeStores.length > 0){
          const coffeeStoreFromContext = coffeeStores.find(
            (coffestore) => { 
              return coffestore.id.toString() === id
            });

          if(coffeeStoreFromContext){
            setCoffeeStore(coffeeStoreFromContext);
            handleCreateCoffeeStore(coffeeStoreFromContext);
          }
        }
      } else {
        //SSG
        handleCreateCoffeeStore(initialProps.CoffeeStore)
      }
    }, [id, initialProps, initialProps.CoffeeStore])
    
    const { address, neighborhood , name, imgUrl} = coffeeStore;

    const [votingCount, setVotingCount] = useState(0);

    const {data, error} = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher) // useSWR is used to set coffee-store data of first six stores in landing page and up-vote functionality
    
    useEffect(() => {
      if(data && data.length > 0){
        setCoffeeStore(data[0]);
        setVotingCount(data[0].voting);
      }
    }, [data])

    const handleUpvoteButton = async () => {
      try {
        const response =  await fetch("/api/favouriteCoffeeStoreById", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id 
          })
        });

        const dbCoffeeStore = await response.json();

        if(dbCoffeeStore && dbCoffeeStore.length > 0){
          let count = votingCount + 1;
          setVotingCount(count);
        }
      } catch(err){
        console.error("Error upvoting the coffee store", err);
      }


    }

    if (error) {
      return <div>Something went wrong retrieving coffee store page</div>
    }

    return (
        <div className={styles.layout}>
            <Head>
                <title>{name}</title>
            </Head>
            <div className={styles.container}>
              <div className={styles.col1}>
                <div className={styles.backToHomeLink}>
                  <Link href="/"> 
                    ← Back to home page
                  </Link>
                </div>
                <div className={styles.nameWrapper}>
                  <h1 className={styles.name}>{name}</h1>
                </div>
                  <Image src={imgUrl || "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"} width={600} height={360} className={styles.storeImg} alt={name} />
              </div>
              <div className={cls("glass",styles.col2)}>
                {address && (
                <div className={styles.iconWrapper}>
                    <Image src="/static/icons/places.svg" width="24" height="24" />
                    <p className={styles.text}>{address}</p>
                </div>
                )}
                {neighborhood && (
                <div className={styles.iconWrapper}>
                    <Image src="/static/icons/nearMe.svg" width="24" height="24" />
                    <p className={styles.text}>{neighborhood}</p>
                </div>
                )}
                <div className={styles.iconWrapper}>
                    <Image src="/static/icons/star.svg" width="24" height="24" />
                    <p className={styles.text}>{votingCount}</p>
                </div> 
                <button className={styles.upvoteButton} onClick={handleUpvoteButton}>Up vote!</button>
              </div>
            </div>
        </div>
    )
}
export default CoffeeStore;