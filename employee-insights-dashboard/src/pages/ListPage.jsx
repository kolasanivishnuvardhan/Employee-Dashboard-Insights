import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { navigate } from '../utils/router'
import { fetchEmployeesFromApi } from '../utils/employeeData'

const ROW_HEIGHT = 64
const VIEWPORT_HEIGHT = 480
const BUFFER_ROWS = 6

export function ListPage() {
  const { employees, setEmployees, setSelectedEmployee } = useAppData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const viewportRef = useRef(null)

  useEffect(() => {
    if (employees.length > 0) return

    async function loadEmployees() {
      setLoading(true)
      setError('')

      try {
        const records = await fetchEmployeesFromApi()
        setEmployees(records)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load employee records',
        )
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [employees.length, setEmployees])

  const { visibleRows, startIndex, totalHeight, paddingTop, paddingBottom } =
    useMemo(() => {
      const totalCount = employees.length
      const total = totalCount * ROW_HEIGHT
      const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS)
      const visibleCount =
        Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + BUFFER_ROWS * 2
      const end = Math.min(totalCount, start + visibleCount)
      const rows = employees.slice(start, end)

      return {
        visibleRows: rows,
        startIndex: start,
        totalHeight: total,
        paddingTop: start * ROW_HEIGHT,
        paddingBottom: Math.max(0, total - end * ROW_HEIGHT),
      }
    }, [employees, scrollTop])

  return (
    <section className="card">
      <div className="list-header">
        <div>
          <h2>High-Performance Employee Grid</h2>
          <p>Custom virtualization renders only visible rows and a small buffer.</p>
        </div>
        <span className="pill">Total rows: {employees.length}</span>
      </div>

      {loading ? <p>Loading employee records...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error && employees.length === 0 ? <p>No employee records found.</p> : null}

      <div
        ref={viewportRef}
        className="virtualized-viewport"
        style={{ height: VIEWPORT_HEIGHT }}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight }}>
          <div style={{ paddingTop, paddingBottom }}>
            {visibleRows.map((employee, index) => (
              <div key={employee.id} className="employee-row">
                <div>
                  <strong>{employee.name}</strong>
                  <p>
                    {employee.department} · {employee.city}
                  </p>
                </div>
                <div>
                  <p>${employee.salary.toLocaleString()}</p>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      navigate(`/details/${employee.id}`)
                    }}
                  >
                    Verify Identity
                  </button>
                </div>
                <span className="row-index">#{startIndex + index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
