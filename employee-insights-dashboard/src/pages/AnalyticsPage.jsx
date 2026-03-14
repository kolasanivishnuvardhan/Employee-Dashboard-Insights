import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'

const CITY_GEO_COORDINATES = {
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  Edinburgh: { lat: 55.9533, lon: -3.1883 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  London: { lat: 51.5072, lon: -0.1276 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  'New York': { lat: 40.7128, lon: -74.006 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  Tokyo: { lat: 35.6762, lon: 139.6503 },
}

const CITY_ALIASES = {
  Sidney: 'Sydney',
}

const MAP_WIDTH = 560
const MAP_HEIGHT = 280

function toTitleCase(value) {
  if (!value) return 'Unknown'
  return value
    .toString()
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ')
}

function toCanonicalCity(value) {
  const normalized = toTitleCase(value)
  return CITY_ALIASES[normalized] ?? normalized
}

function projectLatLon({ lat, lon }) {
  return {
    x: ((lon + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * MAP_HEIGHT,
  }
}

export function AnalyticsPage() {
  const { employees, mergedImage } = useAppData()

  const citySalaries = useMemo(() => {
    const accumulator = new Map()

    employees.forEach((employee) => {
      const city = toCanonicalCity(employee.city)
      const running = accumulator.get(city) ?? 0
      accumulator.set(city, running + employee.salary)
    })

    return Array.from(accumulator.entries())
      .map(([city, totalSalary]) => ({ city, totalSalary }))
      .sort((left, right) => right.totalSalary - left.totalSalary)
      .slice(0, 8)
  }, [employees])

  const maxSalary = citySalaries[0]?.totalSalary ?? 1

  return (
    <section className="card analytics-layout">
      <div>
        <h2>Audit Result + Salary Analytics</h2>
        <p>
          This screen combines the merged verification image with a city-level salary
          distribution chart and a geospatial scatter map.
        </p>

        <div className="audit-preview">
          {mergedImage ? (
            <img src={mergedImage} alt="Merged audit output" />
          ) : (
            <p>No merged image yet. Complete the details flow first.</p>
          )}
        </div>
      </div>

      <div className="analytics-stack">
        <article>
          <h3>Salary Distribution by City</h3>
          <svg viewBox="0 0 560 250" className="chart-svg" role="img">
            {citySalaries.map((entry, index) => {
              const barHeight = (entry.totalSalary / maxSalary) * 160
              const x = 30 + index * 65
              const y = 200 - barHeight

              return (
                <g key={entry.city}>
                  <rect x={x} y={y} width="42" height={barHeight} rx="8" />
                  <text x={x + 20} y="220" textAnchor="middle">
                    {entry.city.slice(0, 3)}
                  </text>
                  <text x={x + 20} y={y - 8} textAnchor="middle" className="salary-label">
                    {(entry.totalSalary / 1000).toFixed(0)}k
                  </text>
                </g>
              )
            })}
          </svg>
        </article>

        <article>
          <h3>City Geospatial Map (custom SVG)</h3>
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="map-svg" role="img">
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="rgba(30,64,175,0.08)" />
            {[-120, -60, 0, 60, 120].map((longitude) => {
              const x = ((longitude + 180) / 360) * MAP_WIDTH
              return (
                <line
                  key={`lon-${longitude}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2={MAP_HEIGHT}
                  className="map-grid-line"
                />
              )
            })}
            {[-60, -30, 0, 30, 60].map((latitude) => {
              const y = ((90 - latitude) / 180) * MAP_HEIGHT
              return (
                <line
                  key={`lat-${latitude}`}
                  x1="0"
                  y1={y}
                  x2={MAP_WIDTH}
                  y2={y}
                  className="map-grid-line"
                />
              )
            })}
            {citySalaries.map((entry) => {
              const coordinates = CITY_GEO_COORDINATES[entry.city]
              if (!coordinates) return null
              const point = projectLatLon(coordinates)

              return (
                <g key={entry.city}>
                  <circle cx={point.x} cy={point.y} r="6" fill="#1d4ed8" />
                  <text x={point.x + 8} y={point.y - 8}>
                    {entry.city}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="map-note">
            City coordinates are projected with a simple latitude/longitude
            equirectangular transform.
          </p>
        </article>
      </div>
    </section>
  )
}
