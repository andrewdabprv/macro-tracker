import { useState, useRef } from 'react'
import { useGoals } from '../hooks/useGoals'
import { NUTRIENT_CONFIG, getNutrientGroups } from '../data/nutrients'
import './Settings.css'

const ACTIVITY_LEVELS = [
  { value: 1.2,   label: 'Sedentary (little/no exercise)' },
  { value: 1.375, label: 'Light (1–3 days/week)' },
  { value: 1.55,  label: 'Moderate (3–5 days/week)' },
  { value: 1.725, label: 'Active (6–7 days/week)' },
  { value: 1.9,   label: 'Very active (2× per day)' },
]

function calcGoals({ gender, age, height, weight, bf, activity, goalKg }) {
  let bmr
  if (bf > 0) {
    const lbm = weight * (1 - bf / 100)
    bmr = 370 + 21.6 * lbm
  } else if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  const tdee = bmr * activity
  const calories = Math.round(tdee + goalKg * 1100)
  const protein = Math.round(weight * (goalKg < 0 ? 2.2 : 2.0))
  const fat = Math.round(calories * 0.28 / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  return { calories, protein, carbs, fat }
}

function goalLabel(v) {
  if (v === 0) return 'Maintain weight'
  if (v > 0) return `Bulk +${v} kg / week`
  return `Cut ${Math.abs(v)} kg / week`
}

export default function Settings() {
  const { goals, setGoal, applyAll, dietMode, setDietMode } = useGoals()
  const groups = getNutrientGroups()
  const [expandedGroup, setExpandedGroup] = useState(null)

  // Calculator state
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bf, setBf] = useState('')
  const [activity, setActivity] = useState(1.55)
  const [goalKg, setGoalKg] = useState(0)
  const [calcResult, setCalcResult] = useState(null)

  const canCalc = age && height && weight

  function handleCalculate() {
    const result = calcGoals({
      gender,
      age: parseFloat(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      bf: parseFloat(bf) || 0,
      activity,
      goalKg,
    })
    setCalcResult(result)
  }

  function handleApply() {
    applyAll(calcResult)
    setCalcResult(null)
  }

  return (
    <div className="settings">
      <h1 className="page-title">Settings</h1>

      {/* Diet mode */}
      <section className="settings-section">
        <h2 className="settings-section-title">Diet Mode</h2>
        <p className="settings-hint">Affects how your calorie streak is scored each day.</p>
        <div className="seg-control">
          {[['cut','Cut'],['maintain','Maintain'],['bulk','Bulk']].map(([val, label]) => (
            <button
              key={val}
              className={`seg-btn ${dietMode === val ? 'active' : ''}`}
              onClick={() => setDietMode(val)}
            >{label}</button>
          ))}
        </div>
        <p className="settings-hint diet-mode-hint">
          {dietMode === 'cut'      && 'Checkmark if you ate at or under your calorie goal.'}
          {dietMode === 'maintain' && 'Checkmark if you stayed within ±10% of your calorie goal.'}
          {dietMode === 'bulk'     && 'Checkmark if you hit at least 90% of your calorie goal.'}
        </p>
      </section>

      {/* Goals */}
      <section className="settings-section">
        <h2 className="settings-section-title">Daily Goals</h2>
        <p className="settings-hint">Set targets for each nutrient. Leave as 0 to skip tracking.</p>
        {Object.entries(groups).map(([group, nutrients]) => (
          <div key={group} className="nutrient-group">
            <button
              className="group-header"
              onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
            >
              <span>{group}</span>
              <span className="chevron">{expandedGroup === group ? '▲' : '▼'}</span>
            </button>
            {expandedGroup === group && (
              <div className="goals-rows">
                {nutrients.map(({ key, label, unit }) => (
                  <div key={key} className="form-field-row">
                    <label className="form-field-label">{label}</label>
                    <div className="form-field-input-wrap">
                      <input
                        className="input num-input"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="—"
                        value={goals[key] > 0 ? goals[key] : ''}
                        onChange={e => setGoal(key, parseFloat(e.target.value) || 0)}
                      />
                      <span className="form-unit">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Calculator */}
      <section className="settings-section">
        <h2 className="settings-section-title">Calculate Goals</h2>
        <p className="settings-hint">Enter your stats to automatically calculate daily targets.</p>

        <div className="gender-row">
          <button
            className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
            onClick={() => setGender('male')}
          >Male</button>
          <button
            className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
            onClick={() => setGender('female')}
          >Female</button>
        </div>

        <div className="form-group">
          {[
            { label: 'Age',         value: age,    set: setAge,    unit: 'yr', placeholder: '25' },
            { label: 'Height',      value: height, set: setHeight, unit: 'cm', placeholder: '175' },
            { label: 'Weight',      value: weight, set: setWeight, unit: 'kg', placeholder: '75' },
            { label: 'Body fat %',  value: bf,     set: setBf,     unit: '%',  placeholder: 'optional' },
          ].map(({ label, value, set, unit, placeholder }) => (
            <div key={label} className="form-field-row">
              <label className="form-field-label">{label}</label>
              <div className="form-field-input-wrap">
                <input
                  className="input num-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder={placeholder}
                  value={value}
                  onChange={e => set(e.target.value)}
                />
                <span className="form-unit">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="form-field">
          <label className="form-label">Activity level</label>
          <select
            className="input"
            value={activity}
            onChange={e => setActivity(parseFloat(e.target.value))}
          >
            {ACTIVITY_LEVELS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <div className="slider-header">
            <label className="form-label">Weekly goal</label>
            <span className="slider-label">{goalLabel(goalKg)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.25"
            value={goalKg}
            onChange={e => setGoalKg(parseFloat(e.target.value))}
            className="goal-slider"
          />
          <div className="slider-ticks">
            <span>Cut</span>
            <span>Maintain</span>
            <span>Bulk</span>
          </div>
        </div>

        <button
          className="btn primary calc-btn"
          onClick={handleCalculate}
          disabled={!canCalc}
        >
          Calculate
        </button>

        {calcResult && (
          <div className="calc-result">
            <p className="calc-result-title">Suggested daily targets</p>
            <div className="calc-result-rows">
              {[
                { label: 'Calories', value: calcResult.calories, unit: 'kcal' },
                { label: 'Protein',  value: calcResult.protein,  unit: 'g' },
                { label: 'Carbs',    value: calcResult.carbs,    unit: 'g' },
                { label: 'Fat',      value: calcResult.fat,      unit: 'g' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="calc-result-row">
                  <span className="calc-result-label">{label}</span>
                  <span className="calc-result-value">{value} {unit}</span>
                </div>
              ))}
            </div>
            <button className="btn primary" onClick={handleApply}>Apply to Goals</button>
          </div>
        )}
      </section>

      {/* Data backup */}
      <DataBackup />
    </div>
  )
}

const BACKUP_KEYS = ['foods', 'meals', 'food-log', 'macro-goals', 'diet-mode', 'body-weight']

function DataBackup() {
  const importRef = useRef()
  const [importStatus, setImportStatus] = useState(null)

  function handleExport() {
    const data = {}
    for (const key of BACKUP_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw) data[key] = JSON.parse(raw)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `macro-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result)
        for (const key of BACKUP_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]))
          }
        }
        setImportStatus('success')
        setTimeout(() => window.location.reload(), 800)
      } catch {
        setImportStatus('error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="settings-section">
      <h2 className="settings-section-title">Data Backup</h2>
      <p className="settings-hint">Export your data before clearing browser history to avoid losing it.</p>
      <div className="backup-row">
        <button className="btn secondary" onClick={handleExport}>Export backup</button>
        <button className="btn secondary" onClick={() => importRef.current.click()}>Import backup</button>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </div>
      {importStatus === 'success' && <p className="backup-ok">Restored — reloading…</p>}
      {importStatus === 'error' && <p className="backup-err">Invalid file. Please use a file exported from this app.</p>}
    </section>
  )
}
