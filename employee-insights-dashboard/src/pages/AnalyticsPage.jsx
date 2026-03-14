import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'

const CITY_COORDINATES = {
  Delhi: { x: 68, y: 58 },
  Mumbai: { x: 48, y: 88 },
  Bengaluru: { x: 55, y: 122 },
  Chennai: { x: 63, y: 129 },
  Kolkata: { x: 84, y: 81 },
  Hyderabad: { x: 58, y: 105 },
  Pune: { x: 50, y: 96 },
  Ahmedabad: { x: 46, y: 72 },
}

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

export function AnalyticsPage() {
  const { employees, mergedImage } = useAppData()

  const citySalaries = useMemo(() => {
    const accumulator = new Map()

    employees.forEach((employee) => {
      const city = toTitleCase(employee.city)
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
          <svg viewBox="0 0 140 170" className="map-svg" role="img">
            <path
              d="M28 18 L68 12 L104 26 L118 58 L106 94 L96 120 L76 146 L52 152 L30 132 L18 96 L22 68 Z"
              fill="rgba(30,64,175,0.15)"
              stroke="rgba(30,64,175,0.5)"
              strokeWidth="2"
            />
            {citySalaries.map((entry) => {
              const coord = CITY_COORDINATES[entry.city]
              if (!coord) return null

              return (
                <g key={entry.city}>
                  <circle cx={coord.x} cy={coord.y} r="4.5" fill="#1d4ed8" />
                  <text x={coord.x + 6} y={coord.y - 6}>
                    {entry.city}
                  </text>
                </g>
              )
            })}
          </svg>
        </article>
      </div>
    </section>
  )
}
