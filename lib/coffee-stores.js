// Fetching coffee-stores Images

import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

// Fetching coffee-stores Details

export const getUrlForCoffeeStores = (latLong, query, limit) => {
    return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latLong}&limit=${limit}`
}

//Fetching List of coffee stores images from "unsplash API"

const getListOfCoffeeStoresPhotos = async () => {
     const photos = await unsplash.search.getPhotos({
        query: 'coffee shop',
        page: 1,
        perPage: 40,
      });
    const unsplashResults = photos.response?.results.map((result) => result.urls["small"])
    return unsplashResults
}


export const getCoffeeStores = async (latlong = "12.996355750476514,77.69647189768436", limit = 6) => {
    const photos = await getListOfCoffeeStoresPhotos();
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
        }
      }; 
      const response = await fetch(
        getUrlForCoffeeStores(latlong, "coffee", limit), options
        );                                                         // privious latLong : 12.959389442781312%2C77.69283454416663
      const data = await response.json();
      return data.results.map((result, index) => {
        return {
          id : result.fsq_id,
          name : result.name,
          address : result.location.address || result.location.formatted_address,
          neighborhood : result.location.region,
          imgUrl: photos.length > 0 ? photos[index] : null
        }
      })
}

