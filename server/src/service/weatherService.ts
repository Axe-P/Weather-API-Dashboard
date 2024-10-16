import dotenv from 'dotenv';
dotenv.config();

const baseURL: string = process.env.API_BASE_URL || '';
const apiKey: string = process.env.WEATHER_API_KEY || '';

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  iconDescription: string;
  icon: string;
  
  constructor(weatherData: WeatherData) {
    this.city = weatherData.city;
    this.date = new Date(weatherData.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    this.tempF = parseFloat(((weatherData.tempF - 273.15) * 9/5 + 32).toFixed(2));
    this.windSpeed = weatherData.windSpeed;
    this.humidity = weatherData.humidity;
    this.iconDescription = weatherData.iconDescription;
    this.icon = weatherData.icon;
  }
}

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherData {
  city: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  iconDescription: string;
  icon: string;
}

interface WeatherApiResponse {
  city: Pick<{ name: string }, 'name'>;
  list: Array<{
    dt: number;
    dt_txt: string;
    weather: Array<Pick<{ icon: string; description: string }, 'icon' | 'description'>>;
    main: Pick<{ temp: number; humidity: number }, 'temp' | 'humidity'>;
    wind: Pick<{ speed: number }, 'speed'>;
  }>;
}

// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string | null = null;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<Coordinates> {
    // private async fetchLocationData(query: string) {}
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Invalid response: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data) {
        throw new Error("No location data!");
      }
      const locationData = data[0];
      return {
        lat: locationData.lat,
        lon: locationData.lon,
      };
    } catch (error) {
      console.error("Couldn't Grab data!:", error);
      throw error;
    }
  }
  
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    if (!this.cityName) {
      throw new Error("Invalid City Name!");
    }
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
    return query;
  }
  
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `lat=${lat}&lon=${lon}`;
  }
  
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    if (!this.cityName) {
      throw new Error("Invalid City Name!");
    }
    const geocodeQuery = this.buildGeocodeQuery();
    return this.fetchLocationData(geocodeQuery);
  }
  
  // TODO: Create fetchWeatherData method
  async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse> {
    try {
      const query = this.buildWeatherQuery(coordinates);
      const response = await fetch(`${this.baseURL}/data/2.5/forecast?${query}&appid=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`Invalid response: ${response.statusText}`);
      }
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error("Error grabbing data:", error);
      throw error;
    }
  }
  
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: WeatherApiResponse): WeatherData {
    const firstEntry = response.list[0];
    return {
      city: response.city.name,
      date: new Date(firstEntry.dt * 1000).toLocaleString(),
      tempF: firstEntry.main.temp,
      windSpeed: firstEntry.wind.speed,
      humidity: firstEntry.main.humidity,
      iconDescription: firstEntry.weather[0].description,
      icon: firstEntry.weather[0].icon
    };
  }
  
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: WeatherData, weatherData: any[]): Weather[] {
    return weatherData
    .filter((entry) => entry.dt_txt.endsWith("12:00:00"))
    .map((entry) => {
      return new Weather({
        city: currentWeather.city,
        date: entry.dt_txt,
        tempF: entry.main.temp,
        windSpeed: entry.wind.speed,
        humidity: entry.main.humidity,
        iconDescription: entry.weather[0].description,
        icon: entry.weather[0].icon
      });
    });
  }
  
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    try {
      console.log("City name:", this.cityName);
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
      return [new Weather(currentWeather), ...forecastArray];
    } catch (error) {
      console.error("Error fetching Weather:", error);
      throw error;
    }
  }
};

const weatherService = new WeatherService(baseURL, apiKey);
export default weatherService;