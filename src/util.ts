import { encode } from 'latlon-geohash';

export function sleep(time: number) {
  return new Promise<void>((resolve: () => void) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export function calcGeohash(lat: number, lng: number) {
  return <string>encode(lat, lng, 4);
}
