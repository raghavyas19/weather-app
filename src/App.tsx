import React, { useState, useEffect } from 'react';
import { Search, Cloud, Loader2, Moon, Sun, RefreshCw, Droplets, Eye, Wind, X, BarChart2, Building2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      main: string;
      icon: string;
    }>;
  }>;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const savedWeather = localStorage.getItem('weather');
    return savedWeather ? JSON.parse(savedWeather) : null;
  });
  const [forecast, setForecast] = useState<ForecastData | null>(() => {
    const savedForecast = localStorage.getItem('forecast');
    return savedForecast ? JSON.parse(savedForecast) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    return savedSearches ? JSON.parse(savedSearches) : [];
  });

  const API_KEY = import.meta.env.VITE_API_KEY;


  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (weather) localStorage.setItem('weather', JSON.stringify(weather));
    if (forecast) localStorage.setItem('forecast', JSON.stringify(forecast));
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [weather, forecast, recentSearches]);

  const fetchWeatherData = async (cityName: string) => {
    setLoading(true);
    setError('');

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);

      setRecentSearches(prev => {
        const searches = [cityName, ...prev.filter(s => s !== cityName)].slice(0, 20);
        return searches;
      });

    } catch (err) {
      setError('City not found or API error occurred');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeatherData(city);
  };

  const refreshWeather = () => {
    if (weather) {
      fetchWeatherData(weather.name);
    }
  };

  const clearSearch = () => {
    setCity('');
  };

  const removeRecentSearch = (searchToRemove: string) => {
    setRecentSearches(prev => prev.filter(search => search !== searchToRemove));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-blue-300'}`}>
      <div className="max-w-6xl mx-auto p-4">
        <div className={`rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <Cloud className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
              Weather Dashboard
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mb-6 relative">
            <div className="relative flex-1">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'bg-white border-gray-300 focus:ring-blue-500'
                  }`}
              />
              {city && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <X className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} size={18} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors ${darkMode
                ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
                } text-white`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search />
              )}
            </button>
          </form>

          {error && (
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
              {error}
            </div>
          )}

          {weather && (
            <div className={`rounded-lg p-6 mb-6 transition-colors ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Building2 className={darkMode ? 'text-blue-400' : 'text-blue-500'} size={24} />
                  {weather.name}
                </h2>
                <button
                  onClick={refreshWeather}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } hover:rotate-180 duration-500`}
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Temperature Card */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform hover:scale-105`}>
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt={weather.weather[0].description}
                      className="w-16 h-16"
                    />
                    <div>
                      <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {Math.round(weather.main.temp)}°C
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {weather.weather[0].main}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Humidity */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform hover:scale-105`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                    <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Humidity</h3>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {weather.main.humidity}%
                  </p>
                </div>

                {/* Wind Speed */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform hover:scale-105`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                    <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Wind Speed</h3>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {weather.wind.speed} km/h
                  </p>
                </div>

                {/* Visibility */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform hover:scale-105`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                    <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Visibility</h3>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {(weather.visibility / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast && (
            <div className={`rounded-lg p-6 transition-colors ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <BarChart2 className={darkMode ? 'text-blue-400' : 'text-blue-500'} size={20} />
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.list
                  .filter((_, index) => index % 8 === 0)
                  .slice(0, 5)
                  .map((day) => (
                    <div
                      key={day.dt}
                      className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform hover:scale-105`}
                    >
                      <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {format(new Date(day.dt * 1000), 'EEE, MMM d')}
                      </p>
                      <div className="flex items-center justify-between">
                        <img
                          src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                          alt={day.weather[0].main}
                          className="w-12 h-12"
                        />
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(day.main.temp)}°C
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <div key={search} className="relative inline-flex">
                    <button
                      onClick={() => {
                        setCity(search);
                        fetchWeatherData(search);
                      }}
                      className={`px-3 py-1 rounded-full transition-colors ${darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {search}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(search)}
                      className="absolute -right-1 -top-1 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;