import { useEffect, useRef, useState } from "react";

const weatherUrl = "https://api.open-meteo.com/v1/forecast";
const geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search";

const popularCities = [
  "București", "Cluj-Napoca", "Timișoara", "Iași",
  "Constanța", "Craiova", "Brașov", "Sibiu",
  "Oradea", "Arad", "Pitești", "Ploiești",
  "Galați", "Bacău", "Suceava", "Alba Iulia",
  "Deva", "Târgu Mureș", "Baia Mare", "Buzău",
  "Botoșani", "Focșani", "Târgu Jiu",
  "Drobeta-Turnu Severin", "Reșița", "Vaslui",
  "Zalău", "Slatina", "Tulcea", "Bistrița",
  "Miercurea Ciuc", "Sfântu Gheorghe", "Alexandria",
  "Giurgiu", "Călărași", "Piatra Neamț", "Mediaș",
  "Turda", "Lugoj", "Mangalia", "Petroșani",
  "Sighișoara", "Făgăraș", "Câmpina", "Râmnicu Vâlcea"
];

const weatherDetails = [
  { label: "Umiditate", icon: "💧", key: "humidity" },
  { label: "Vânt", icon: "💨", key: "wind" },
  { label: "Precipitații", icon: "🌧️", key: "rain" },
  { label: "Indice UV", icon: "☀️", key: "uv" },
  { label: "Răsărit", icon: "🌅", key: "sunrise" },
  { label: "Apus", icon: "🌇", key: "sunset" }
];

const legendItems = [
  ["☀️", "Senin"],
  ["🌤️", "Parțial noros"],
  ["☁️", "Înnorat"],
  ["🌫️", "Ceață"],
  ["🌦️", "Burniță"],
  ["🌧️", "Ploaie"],
  ["🌨️", "Averse de zăpadă"],
  ["❄️", "Ninsoare"],
  ["⛈️", "Furtună"]
];

function weatherDescription(code) {
  if (code === 0) return "Senin";
  if (code === 1) return "Predominant senin";
  if (code === 2) return "Parțial noros";
  if (code === 3) return "Înnorat";
  if ([45, 48].includes(code)) return "Ceață";
  if ([51, 53, 55].includes(code)) return "Burniță";
  if ([56, 57].includes(code)) return "Burniță înghețată";
  if ([61, 63, 65].includes(code)) return "Ploaie";
  if ([66, 67].includes(code)) return "Ploaie înghețată";
  if ([71, 73, 75, 77].includes(code)) return "Ninsoare";
  if ([80, 81, 82].includes(code)) return "Averse de ploaie";
  if ([85, 86].includes(code)) return "Averse de ninsoare";
  if ([95, 96, 99].includes(code)) return "Furtună";
  return "Condiții meteo variabile";
}

function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

function formatTime(value) {
  return value ? value.slice(11, 16) : "--:--";
}

function formatDate(dateString, options = {}) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("ro-RO", options);
}

function createGeocodingUrl(name, count) {
  const url = new URL(geocodingUrl);
  url.search = new URLSearchParams({
    name,
    count: String(count),
    language: "ro",
    format: "json",
    countryCode: "RO"
  });
  return url;
}

function normalizeCity(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function CurrentWeather({ place, data }) {
  const { current, daily } = data;
  const details = {
    humidity: `${current.relative_humidity_2m}%`,
    wind: `${Math.round(current.wind_speed_10m)} km/h`,
    rain: `${current.precipitation} mm`,
    uv: daily.uv_index_max[0] ?? "--",
    sunrise: formatTime(daily.sunrise[0]),
    sunset: formatTime(daily.sunset[0])
  };
  const locationParts = [place.name, place.admin1, place.country].filter(Boolean);

  return (
    <section id="weather">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CONDIȚII ACTUALE</p>
          <h2>{[...new Set(locationParts)].join(", ")}</h2>
          <p className="muted">
            {formatDate(daily.time[0], {
              weekday: "long",
              day: "numeric",
              month: "long"
            })}
          </p>
        </div>
        <div className="main-icon" aria-hidden="true">
          {weatherIcon(current.weather_code)}
        </div>
      </div>

      <div className="current-card">
        <div className="temperature-area">
          <p className="weather-description">
            {weatherDescription(current.weather_code)}
          </p>
          <p className="temperature">{Math.round(current.temperature_2m)}°C</p>
          <p className="muted">
            Resimțită: {Math.round(current.apparent_temperature)}°C
          </p>
        </div>

        <div className="weather-details">
          {weatherDetails.map(({ label, icon, key }) => (
            <article className="detail-card" key={key}>
              <span className="detail-icon">{icon}</span>
              <div>
                <p>{label}</p>
                <strong>{details[key]}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Forecast({ data }) {
  return (
    <section id="forecast-section">
      <div className="section-heading forecast-heading">
        <div>
          <p className="eyebrow">URMĂTOARELE ZILE</p>
          <h2>Prognoza pe 7 zile</h2>
        </div>
        <span className="forecast-badge">7 zile</span>
      </div>
      <div className="forecast-grid">
        {data.daily.time.map((date, index) => {
          const code = data.daily.weather_code[index];
          return (
            <article className="forecast-day" key={date}>
              <p className="day-name">
                {index === 0 ? "Astăzi" : formatDate(date, { weekday: "short" })}
              </p>
              <p className="day-date">
                {formatDate(date, { day: "numeric", month: "short" })}
              </p>
              <p className="forecast-icon">{weatherIcon(code)}</p>
              <p className="forecast-description">{weatherDescription(code)}</p>
              <p className="rain-chance">
                🌧️ {data.daily.precipitation_probability_max[index] ?? 0}%
              </p>
              <p className="temperatures">
                <span className="max-temp">
                  {Math.round(data.daily.temperature_2m_max[index])}°
                </span>
                <span className="min-temp">
                  {Math.round(data.daily.temperature_2m_min[index])}°
                </span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  const [city, setCity] = useState("București");
  const [hasEditedCity, setHasEditedCity] = useState(false);
  const [cityOptions, setCityOptions] = useState(
    popularCities.map(name => ({ name }))
  );
  const [weatherResult, setWeatherResult] = useState(null);
  const [status, setStatus] = useState({
    message: "Se pregătesc datele meteo...",
    isError: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const weatherController = useRef(null);

  useEffect(() => {
    getWeather("București");
  }, []);

  useEffect(() => {
    if (!hasEditedCity) return undefined;
    const query = city.trim();
    if (query.length < 2) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(createGeocodingUrl(query, 100), {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Căutarea localităților a eșuat.");

        const data = await response.json();
        const results = data.results || [];
        setCityOptions(
          results.map(place => ({
            name: place.name,
            label: [place.admin1, place.admin2].filter(Boolean).join(", ")
          }))
        );

        if (results.length === 0) {
          setStatus({
            message: "Nu am găsit localități pentru această căutare.",
            isError: true
          });
        } else {
          setStatus({
            message: `Am găsit ${results.length} rezultat(e). Alege localitatea.`,
            isError: false
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus({
            message: "Nu am putut încărca sugestiile. Poți alege un oraș popular.",
            isError: true
          });
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [city, hasEditedCity]);

  useEffect(() => () => weatherController.current?.abort(), []);

  async function getWeather(cityName) {
    const selectedCity = cityName.trim();
    if (!selectedCity) {
      setStatus({ message: "Alege sau introdu numele unui oraș.", isError: true });
      return;
    }

    weatherController.current?.abort();
    const controller = new AbortController();
    weatherController.current = controller;
    setIsLoading(true);
    setWeatherResult(null);
    setStatus({
      message: `Se încarcă vremea pentru ${selectedCity}...`,
      isError: false
    });

    try {
      const geoResponse = await fetch(createGeocodingUrl(selectedCity, 10), {
        signal: controller.signal
      });
      if (!geoResponse.ok) {
        throw new Error("Serviciul de căutare nu este disponibil.");
      }

      const geoData = await geoResponse.json();
      const places = geoData.results || [];
      if (places.length === 0) {
        throw new Error("Localitatea nu a fost găsită. Încearcă alt nume.");
      }

      const place = places.find(
        item => normalizeCity(item.name) === normalizeCity(selectedCity)
      ) || places[0];
      const url = new URL(weatherUrl);
      url.search = new URLSearchParams({
        latitude: place.latitude,
        longitude: place.longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "weather_code",
          "wind_speed_10m"
        ].join(","),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_probability_max",
          "uv_index_max",
          "sunrise",
          "sunset"
        ].join(","),
        forecast_days: "7",
        timezone: "auto"
      });

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Nu am putut prelua datele meteo.");

      const data = await response.json();
      setWeatherResult({ place, data });
      setStatus({ message: "Datele meteo au fost actualizate.", isError: false });
    } catch (error) {
      if (error.name !== "AbortError") {
        setStatus({
          message: error.message || "A apărut o eroare. Verifică internetul.",
          isError: true
        });
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }

  function handleCityKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      getWeather(city);
    }
  }

  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">PROGNOZĂ METEO</p>
          <h1>
            Weather<span>Now</span>
          </h1>
          <p>Vremea de azi, la un singur click distanță.</p>
        </div>
        <div className="hero-icon" aria-hidden="true">🌤️</div>
      </header>

      <main className="container">
        <section className="search-panel">
          <label htmlFor="city">Alege un oraș din România</label>
          <div className="search-row">
            <input
              id="city"
              type="text"
              list="city-options"
              placeholder="Scrie un oraș, ex. Sibiu..."
              value={city}
              onChange={event => {
                setCity(event.target.value);
                setHasEditedCity(true);
              }}
              onKeyDown={handleCityKeyDown}
              autoComplete="off"
            />
            <datalist id="city-options">
              {cityOptions.map((option, index) => (
                <option
                  key={`${option.name}-${index}`}
                  value={option.name}
                  label={option.label}
                />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => getWeather(city)}
              disabled={isLoading}
            >
              Vezi vremea
            </button>
          </div>
          <p className="hint">Scrie câteva litere pentru a căuta localități.</p>
          <p id="status" className={status.isError ? "error" : ""} role="status" aria-live="polite">
            {status.message}
          </p>
        </section>

        {weatherResult && (
          <CurrentWeather place={weatherResult.place} data={weatherResult.data} />
        )}
        {weatherResult && <Forecast data={weatherResult.data} />}

        <section className="legend-panel">
          <h2>Ce înseamnă simbolurile meteo?</h2>
          <div className="legend-grid">
            {legendItems.map(([icon, description]) => (
              <div key={description}>
                {icon} <span>{description}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="disclaimer">
          Prognoza este informativă și poate suferi modificări.
        </p>
      </main>

      <footer>
        <p>WeatherNow © 2026</p>
        <p>
          Date meteo furnizate de{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo
          </a>
          .
        </p>
      </footer>
    </>
  );
}
