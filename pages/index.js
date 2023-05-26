import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import Banner from '@/components/banner'
import Card from '@/components/card'
import { getCoffeeStores } from '@/lib/coffee-stores'
import useTrackLocation from '@/hooks/use-track-location'
import { useContext, useEffect, useState } from 'react'
import { ACTION_TYPES, StoreContext } from '../store/store-context'

export async function getStaticProps(context){
    const coffeeStores = await getCoffeeStores()         //getCoffeeStores will call Foursquare API
    return{
      props: {
        coffeeStores
      }
    }
}

export default function Home(props) {
  
  const [coffeeStoresError, setCoffeeStoresError] = useState(null);

  const {dispatch, state} = useContext(StoreContext);
  const {coffeeStores, latLong} = state;
  
  const {handleTrackLocation, locationErrorMsg, isFindingLocation} = useTrackLocation();
  
  const handleOnBannerClick = () =>{
    handleTrackLocation();
  }
  
  useEffect(() => {
    async function setCoffeeStoresByLocation() {
      if(latLong){
        try{
          const response = await fetch(`/api/getCoffeeStoresByLocation?$latLong=${latLong}&limit=30`);  //getCoffeeStoresByLocation serverless function
          const coffeeStores = await response.json();
          // setCoffeeStores(fetchedCoffeeStores);
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORE,
            payload: { coffeeStores }
          })
          setCoffeeStoresError("");
        } catch (error) {
            setCoffeeStoresError(error.message);
        }
      }
    }
    setCoffeeStoresByLocation()
  }, [latLong])

  return (
    <>
      <Head>
        <title>Coffee Stores</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <Banner buttonText = { isFindingLocation ? "Locating..." : "View shops nearby"} 
          handleOnClick={handleOnBannerClick}
        />
        {locationErrorMsg && <p>Somthing went wrong : {locationErrorMsg}</p>}
        {coffeeStoresError && <p>Somthing went wrong : {coffeeStoresError}</p>}
        <div className={styles.heroImage}>
          <Image src="/static/hero-image.png" width={700} height={400} alt='hero-image'/>
        </div>
        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Stores near me</h2>
            <div className={styles.cardLayout}>
              {coffeeStores.map((coffeeStrore) => {
                return(
                <Card 
                key={coffeeStrore.id}
                className={styles.card} 
                name={coffeeStrore.name} 
                imgUrl={coffeeStrore.imgUrl || "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"}
                href={`/coffee-store/${coffeeStrore.id}`}
                />
                ); 
              })
              }
            </div>         
          </div>
        )}

        {props.coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Bangalore Stores</h2>
            <div className={styles.cardLayout}>
              {props.coffeeStores.map((coffeeStrore) => {
                return(
                <Card 
                key={coffeeStrore.id}
                className={styles.card} 
                name={coffeeStrore.name} 
                imgUrl={coffeeStrore.imgUrl || "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"}
                href={`/coffee-store/${coffeeStrore.id}`}
                />
                ); 
              })
              }
            </div>         
          </div>
        )}
      </main>
    </>
  )
}
