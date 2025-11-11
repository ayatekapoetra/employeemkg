import { getDistance } from 'geolib';

export const verifyCheckInLocation = async (currentLocation, allowedLocations) => {
  if (!currentLocation || !allowedLocations || allowedLocations.length === 0) {
    return {
      allowed: false,
      distance: null,
      nearestLocation: null,
      message: 'Invalid location data',
    };
  }

  let nearestDistance = Infinity;
  let nearestLocation = null;

  for (const location of allowedLocations) {
    const distance = getDistance(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestLocation = location;
    }

    if (distance <= (location.radius || 100)) {
      return {
        allowed: true,
        distance,
        nearestLocation: location,
        message: 'Within allowed radius',
      };
    }
  }

  return {
    allowed: false,
    distance: nearestDistance,
    nearestLocation,
    message: `You are ${nearestDistance}m away from ${nearestLocation?.name || 'the nearest location'}. Required radius: ${nearestLocation?.radius || 100}m`,
  };
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

export const getCurrentPosition = async (LocationService) => {
  try {
    const position = await LocationService.getCurrentLocation();
    return {
      success: true,
      position,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
