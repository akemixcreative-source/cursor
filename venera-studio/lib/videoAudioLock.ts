let currentStop: (() => void) | null = null;

/** Register this video as the sole audio source; stops any previous holder. */
export function takeVideoAudio(stop: () => void): void {
  if (currentStop && currentStop !== stop) {
    currentStop();
  }
  currentStop = stop;
}

/** Release the lock when this instance unmounts or changes source. */
export function releaseVideoAudio(stop: () => void): void {
  if (currentStop === stop) {
    currentStop = null;
  }
}
