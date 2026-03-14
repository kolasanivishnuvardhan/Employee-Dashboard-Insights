const EMPLOYEE_API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'
const EMPLOYEE_API_PAYLOAD = { username: 'test', password: '123456' }

function normalizeText(value, fallback) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString()
  }

  return fallback
}

function parseSalary(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const numeric = Number(value.replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }

  return 0
}

export function normalizeEmployee(record, index) {
  if (Array.isArray(record)) {
    const [name, department, city, employeeCode, startDate, salary] = record
    const normalizedName = normalizeText(name, `Employee ${index + 1}`)
    const normalizedCode = normalizeText(employeeCode, '')
    const identitySeed =
      normalizedCode || normalizedName.toLowerCase().replace(/\s+/g, '-')

    return {
      id: `${identitySeed}-${index}`,
      employeeCode: normalizedCode,
      name: normalizedName,
      city: normalizeText(city, 'Unknown'),
      salary: parseSalary(salary),
      department: normalizeText(department, 'General'),
      email: 'n/a',
      startDate: normalizeText(startDate, ''),
      raw: record,
    }
  }

  const normalizedName = normalizeText(
    record.name ?? [record.first_name, record.last_name].filter(Boolean).join(' '),
    'Unknown Employee',
  )

  const rawId =
    record.id ??
    record.employee_id ??
    record.empId ??
    record.employee_code ??
    record.code ??
    record.extension
  const normalizedRawId = normalizeText(rawId, '')
  const identitySeed =
    normalizedRawId || normalizedName.toLowerCase().replace(/\s+/g, '-')

  const salaryValue =
    record.salary ??
    record.monthly_salary ??
    record.ctc ??
    record.total_salary ??
    record.amount

  return {
    id: `${identitySeed}-${index}`,
    employeeCode: normalizedRawId,
    name: normalizedName,
    city: normalizeText(record.city ?? record.location ?? record.office ?? record.branch, 'Unknown'),
    salary: parseSalary(salaryValue),
    department: normalizeText(
      record.department ?? record.team ?? record.designation ?? record.position,
      'General',
    ),
    email: normalizeText(record.email, 'n/a'),
    startDate: normalizeText(record.start_date ?? record.joining_date ?? '', ''),
    raw: record,
  }
}

export function extractEmployeeRecords(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.result)) return payload.result
  if (Array.isArray(payload?.rows)) return payload.rows
  if (Array.isArray(payload?.TABLE_DATA?.data)) return payload.TABLE_DATA.data
  if (Array.isArray(payload?.table_data?.data)) return payload.table_data.data
  return []
}

export async function fetchEmployeesFromApi() {
  const response = await fetch(EMPLOYEE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(EMPLOYEE_API_PAYLOAD),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = await response.json()
  const records = extractEmployeeRecords(payload)
  return records.map(normalizeEmployee)
}
