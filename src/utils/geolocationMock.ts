// Utility to mock window.navigator.geolocation in real-time

let originalGetCurrentPosition: typeof navigator.geolocation.getCurrentPosition | null = null;
let originalWatchPosition: typeof navigator.geolocation.watchPosition | null = null;
let originalClearWatch: typeof navigator.geolocation.clearWatch | null = null;

let currentLat = 13.7513; // default Bangkok
let currentLng = 100.4926;
let isMockActive = false;

interface WatchListener {
  success: PositionCallback;
  error?: PositionErrorCallback | null;
  options?: PositionOptions;
}

const watchers = new Map<number, WatchListener>();
let watcherIdCounter = 1;

function triggerWatchers() {
  if (!isMockActive) return;
  
  const mockPosition: any = {
    coords: {
      latitude: currentLat,
      longitude: currentLng,
      accuracy: 10,
      altitude: 0,
      altitudeAccuracy: null,
      heading: null,
      speed: 0,
    },
    timestamp: Date.now(),
  };

  watchers.forEach((watcher) => {
    try {
      watcher.success(mockPosition);
    } catch (e) {
      console.error('Error triggering watch callback', e);
    }
  });
}

export const GeolocationMockService = {
  init() {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    if (!originalGetCurrentPosition) {
      originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      originalWatchPosition = navigator.geolocation.watchPosition;
      originalClearWatch = navigator.geolocation.clearWatch;
    }
  },

  enable(lat: number, lng: number) {
    this.init();
    isMockActive = true;
    currentLat = lat;
    currentLng = lng;

    if (!navigator.geolocation) return;

    // Override getCurrentPosition
    navigator.geolocation.getCurrentPosition = (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions
    ) => {
      if (isMockActive) {
        const mockPos: any = {
          coords: {
            latitude: currentLat,
            longitude: currentLng,
            accuracy: 15,
            altitude: 10,
            altitudeAccuracy: 5,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        successCallback(mockPos);
      } else if (originalGetCurrentPosition) {
        originalGetCurrentPosition.call(navigator.geolocation, successCallback, errorCallback, options);
      }
    };

    // Override watchPosition
    navigator.geolocation.watchPosition = (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions
    ): number => {
      if (isMockActive) {
        const id = watcherIdCounter++;
        watchers.set(id, { success: successCallback, error: errorCallback, options });
        
        // Execute immediately
        const mockPos: any = {
          coords: {
            latitude: currentLat,
            longitude: currentLng,
            accuracy: 15,
            altitude: 10,
            altitudeAccuracy: 5,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        successCallback(mockPos);
        return id;
      } else if (originalWatchPosition) {
        return originalWatchPosition.call(navigator.geolocation, successCallback, errorCallback, options);
      }
      return 0;
    };

    // Override clearWatch
    navigator.geolocation.clearWatch = (watchId: number) => {
      if (watchers.has(watchId)) {
        watchers.delete(watchId);
      } else if (originalClearWatch) {
        originalClearWatch.call(navigator.geolocation, watchId);
      }
    };

    triggerWatchers();
  },

  disable() {
    isMockActive = false;
    watchers.clear();

    if (typeof window !== 'undefined' && navigator.geolocation && originalGetCurrentPosition) {
      navigator.geolocation.getCurrentPosition = originalGetCurrentPosition;
      navigator.geolocation.watchPosition = (originalWatchPosition as typeof navigator.geolocation.watchPosition);
      navigator.geolocation.clearWatch = (originalClearWatch as typeof navigator.geolocation.clearWatch);
    }
  },

  updateCoordinates(lat: number, lng: number) {
    currentLat = lat;
    currentLng = lng;
    triggerWatchers();
  },

  isActive() {
    return isMockActive;
  },

  getCurrentCoords() {
    return { lat: currentLat, lng: currentLng };
  }
};
