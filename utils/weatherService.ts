import * as Location from "expo-location";

export interface WeatherData {
    temperature: number;
    weatherCode: number;
    humidity: number;
    isDay: boolean;
    locationName?: string;
}

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,is_day&timezone=auto`
        );
        const data = await response.json();

        if (!data.current) return null;

        // Reverse geocode for city name using Google API (More reliable)
        let locationName = "Current Location";
        const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

        if (GOOGLE_KEY) {
            try {
                const geoResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_KEY}&language=en`
                );
                const geoData = await geoResponse.json();

                if (geoData.results && geoData.results.length > 0) {
                    // Google Address Components
                    const components = geoData.results[0].address_components;

                    // Find most specific name: Local Admin Area (District) -> Locality (City) -> Admin Area 1 (Region)
                    // Note: In Uzbekistan, "sublocality" or "administrative_area_level_2" is often the district

                    const city = components.find((c: any) => c.types.includes("locality"))?.long_name;
                    const district = components.find((c: any) => c.types.includes("administrative_area_level_2") || c.types.includes("sublocality"))?.long_name;
                    const region = components.find((c: any) => c.types.includes("administrative_area_level_1"))?.long_name;

                    // Prefer City -> District -> Region
                    locationName = city || district || region || "Uzbekistan";
                }
            } catch (e) {
                console.log("Google Geocode failed:", e);
                // Fallback to native if Google fails
                try {
                    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                    if (reverseGeocode.length > 0) {
                        const loc = reverseGeocode[0];
                        locationName = loc.city || loc.subregion || loc.region || loc.name || locationName;
                    }
                } catch (nativeErr) {
                    console.log("Native Geocode failed:", nativeErr);
                }
            }
        } else {
            // Fallback for no key
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                if (reverseGeocode.length > 0) {
                    const loc = reverseGeocode[0];
                    locationName = loc.city || loc.subregion || loc.region || loc.name || locationName;
                }
            } catch (e) { console.log(e); }
        }

        return {
            temperature: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            isDay: data.current.is_day === 1,
            locationName,
        };
    } catch (error) {
        console.error("Weather fetch error:", error);
        return null;
    }
};

export const getWeatherIcon = (code: number, isDay: boolean): string => {
    // WMO Weather interpretation codes (WW)
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog
    // 51, 53, 55: Drizzle
    // 61, 63, 65: Rain
    // 80, 81, 82: Rain showers
    // 71, 73, 75: Snow
    // 95: Thunderstorm

    if (code === 0) return isDay ? "sun" : "moon";
    if (code >= 1 && code <= 3) return isDay ? "cloud" : "cloud"; // simple mapping
    if (code >= 45 && code <= 48) return "menu"; // Fog/Menu icon looks like lines
    if (code >= 51 && code <= 67) return "cloud-rain";
    if (code >= 71 && code <= 77) return "cloud-snow";
    if (code >= 95) return "cloud-lightning";
    return "cloud";
};
