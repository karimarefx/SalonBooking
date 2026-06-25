import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = (options = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [permissionState, setPermissionState] = useState('prompt'); // prompt, granted, denied

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
        setPermissionState('granted');
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        // PositionError.PERMISSION_DENIED = 1
        if (err.code === 1) {
          setPermissionState('denied');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  }, [options]);

  useEffect(() => {
    // Check permission state if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          // Listen for change
          result.onchange = () => {
            setPermissionState(result.state);
            if (result.state === 'granted') {
              updateLocation();
            } else if (result.state === 'denied') {
              setLocation({ lat: null, lng: null });
            }
          };
        })
        .catch((err) => console.warn('Permissions API query failed:', err));
    }

    updateLocation();
  }, []);

  return {
    ...location,
    error,
    loading,
    permissionState,
    refreshLocation: updateLocation,
  };
};

export default useGeolocation;
