import { useState, useEffect, useRef } from 'react'
import { useFoodLog } from '../hooks/useFoodLog'
import { useFoods } from '../hooks/useFoods'
import { useMeals } from '../hooks/useMeals'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { getNutrientGroups } from '../data/nutrients'
import { searchUSDA } from '../data/usda'
import './Today.css'

function round(n) {
  return Math.round(n * 10) / 10
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function addDay(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function dateLabel(d) {
  const today = todayStr()
  const yesterday = addDay(today, -1)
  const tomorrow = addDay(today, 1)
  if (d === today) return 'Today'
  if (d === yesterday) return 'Yesterday'
  if (d === tomorrow) return 'Tomorrow'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function mealSummary(meal) {
  let kcal = 0, protein = 0, carbs = 0, fat = 0
  for (const ing of meal.ingredients) {
    const f = ing.grams / 100
    kcal    += (ing.foodSnapshot.calories ?? 0) * f
    protein += (ing.foodSnapshot.protein  ?? 0) * f
    carbs   += (ing.foodSnapshot.carbs    ?? 0) * f
    fat     += (ing.foodSnapshot.fat      ?? 0) * f
  }
  return { kcal: round(kcal), protein: round(protein), carbs: round(carbs), fat: round(fat) }
}

function AddEntryModal({ foods, meals, onAdd, onImportAndSelect, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [tab, setTab] = useState('foods')

  // Foods tab state
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [grams, setGrams] = useState('100')
  const [showUSDA, setShowUSDA] = useState(false)
  const [usdaQuery, setUsdaQuery] = useState('')
  const [usdaResults, setUsdaResults] = useState([])
  const [usdaLoading, setUsdaLoading] = useState(false)
  const [usdaError, setUsdaError] = useState(null)

  // Meals tab state
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [servings, setServings] = useState('1')

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleAdd() {
    const g = parseFloat(grams)
    if (!selected || isNaN(g) || g <= 0) return
    onAdd(selected, g)
    onClose()
  }

  function handleAddMeal() {
    const s = parseFloat(servings)
    if (!selectedMeal || isNaN(s) || s <= 0) return
    for (const ing of selectedMeal.ingredients) {
      onAdd(
        { id: ing.foodId, ...ing.foodSnapshot },
        Math.round(ing.grams * s * 10) / 10
      )
    }
    onClose()
  }

  async function handleUsdaSearch() {
    if (!usdaQuery.trim()) return
    setUsdaLoading(true)
    setUsdaError(null)
    try {
      const results = await searchUSDA(usdaQuery)
      setUsdaResults(results)
      if (results.length === 0) setUsdaError('No results found.')
    } catch (err) {
      setUsdaError(err.message ?? 'Search failed. Check your connection.')
    } finally {
      setUsdaLoading(false)
    }
  }

  function handleImportFood(food) {
    const saved = onImportAndSelect(food)
    setSelected(saved)
    setShowUSDA(false)
    setSearch('')
  }

  if (showUSDA) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-nav">
            <button className="back-btn" onClick={() => setShowUSDA(false)}>← Back</button>
            <h2>Search USDA</h2>
          </div>
          <div className="search-row">
            <input
              className="input"
              placeholder="e.g. avocado"
              value={usdaQuery}
              onChange={e => setUsdaQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUsdaSearch()}
              autoFocus
            />
            <button className="btn primary small" onClick={handleUsdaSearch} disabled={usdaLoading}>
              {usdaLoading ? '...' : 'Search'}
            </button>
          </div>
          {usdaError && <p className="error">{usdaError}</p>}
          <ul className="food-list">
            {usdaResults.map(f => (
              <li key={f.fdcId} className="food-item import-item" onClick={() => handleImportFood(f)}>
                <span className="food-item-name">{f.name}</span>
                <span className="food-item-meta">{round(f.calories)} kcal · {round(f.protein)}g P · {round(f.carbs)}g C · {round(f.fat)}g F</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="seg-control">
          <button className={`seg-btn ${tab === 'foods' ? 'active' : ''}`} onClick={() => setTab('foods')}>Foods</button>
          <button className={`seg-btn ${tab === 'meals' ? 'active' : ''}`} onClick={() => setTab('meals')}>Meals</button>
        </div>

        {tab === 'foods' && (
          <>
            <input
              className="input"
              placeholder="Search your foods..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <ul className="food-list">
              {filtered.map(f => (
                <li
                  key={f.id}
                  className={`food-item local-item ${selected?.id === f.id ? 'selected' : ''}`}
                  onClick={() => setSelected(f)}
                >
                  <span className="food-item-name">{f.name}</span>
                  <span className="food-item-meta">{round(f.calories)} kcal · {round(f.protein)}g P · {round(f.carbs)}g C · {round(f.fat)}g F</span>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="empty-item">
                  {search ? `"${search}" not in your database.` : 'Your database is empty.'}
                </li>
              )}
            </ul>

            <button className="usda-link" onClick={() => setShowUSDA(true)}>
              Not here? Search USDA to import →
            </button>

            {selected && (
              <div className="grams-row">
                <span className="selected-name">{selected.name}</span>
                <div className="grams-input-row">
                  <label>Grams</label>
                  <input
                    className="input grams-input"
                    type="number"
                    min="1"
                    value={grams}
                    onChange={e => setGrams(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn secondary" onClick={onClose}>Cancel</button>
              <button className="btn primary" onClick={handleAdd} disabled={!selected}>Add</button>
            </div>
          </>
        )}

        {tab === 'meals' && (
          <>
            <ul className="food-list">
              {meals.map(m => {
                const s = mealSummary(m)
                return (
                  <li
                    key={m.id}
                    className={`food-item local-item ${selectedMeal?.id === m.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMeal(m)}
                  >
                    <span className="food-item-name">{m.name}</span>
                    <span className="food-item-meta">{s.kcal} kcal · {s.protein}g P · {s.carbs}g C · {s.fat}g F</span>
                  </li>
                )
              })}
              {meals.length === 0 && (
                <li className="empty-item">No meals yet. Create one in the Foods tab.</li>
              )}
            </ul>

            {selectedMeal && (
              <div className="grams-row">
                <span className="selected-name">{selectedMeal.name}</span>
                <div className="grams-input-row">
                  <label>Servings</label>
                  <input
                    className="input grams-input"
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn secondary" onClick={onClose}>Cancel</button>
              <button className="btn primary" onClick={handleAddMeal} disabled={!selectedMeal}>Log Meal</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Today() {
  const [viewDate, setViewDate] = useState(todayStr)
  const dateInputRef = useRef()
  const { entries, totals, logFood, removeEntry } = useFoodLog(viewDate)
  const { foods, addFood } = useFoods()
  const { meals } = useMeals()
  const { logWeight, removeWeight, getWeight } = useBodyWeight()
  const [showModal, setShowModal] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState('Macros')
  const [weightInput, setWeightInput] = useState(() => {
    const w = getWeight(viewDate)
    return w !== null ? String(w) : ''
  })

  const groups = getNutrientGroups()

  // Sync weight input when date changes
  useEffect(() => {
    const w = getWeight(viewDate)
    setWeightInput(w !== null ? String(w) : '')
  }, [viewDate])

  function handleWeightBlur() {
    const v = parseFloat(weightInput)
    if (!isNaN(v) && v > 0) {
      logWeight(viewDate, Math.round(v * 10) / 10)
    } else if (weightInput === '') {
      removeWeight(viewDate)
    }
  }

  function importAndSelect(food) {
    return addFood(food)
  }

  return (
    <div className="today">
      <div className="today-date-nav">
        <button className="nav-arrow" onClick={() => setViewDate(d => addDay(d, -1))}>‹</button>
        <button className="nav-date-btn" onClick={() => dateInputRef.current.showPicker()}>
          <input
            ref={dateInputRef}
            type="date"
            value={viewDate}
            onChange={e => setViewDate(e.target.value)}
            className="hidden-date-input"
          />
          <span className="nav-date-label">{dateLabel(viewDate)}</span>
          <span className="nav-cal-icon">▦</span>
        </button>
        <button className="nav-arrow" onClick={() => setViewDate(d => addDay(d, 1))}>›</button>
      </div>

      <div className="today-weight-row">
        <span className="today-weight-label">Body weight</span>
        <div className="today-weight-input-wrap">
          <input
            className="today-weight-input"
            type="number"
            step="0.1"
            min="1"
            placeholder="—"
            inputMode="decimal"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onBlur={handleWeightBlur}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
          <span className="today-weight-unit">kg</span>
        </div>
      </div>

      <div className="nutrient-groups">
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
              <div className="nutrient-rows">
                {nutrients.map(({ key, label, unit }) => (
                  <div key={key} className="nutrient-row">
                    <span className="nutrient-label">{label}</span>
                    <span className="nutrient-value">{round(totals[key])} {unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="log-header">
        <h2>Logged</h2>
        <button className="btn primary small" onClick={() => setShowModal(true)}>+ Add</button>
      </div>

      {entries.length === 0 && (
        <p className="empty">Nothing logged yet.</p>
      )}

      <ul className="entry-list">
        {entries.map(e => (
          <li key={e.id} className="entry-item">
            <div className="entry-info">
              <span className="entry-name">{e.foodSnapshot.name}</span>
              <span className="entry-meta">{e.grams}g · {round(e.foodSnapshot.calories * e.grams / 100)} kcal</span>
            </div>
            <button className="remove-btn" onClick={() => removeEntry(e.id)}>✕</button>
          </li>
        ))}
      </ul>

      {showModal && (
        <AddEntryModal
          foods={foods}
          meals={meals}
          onAdd={logFood}
          onImportAndSelect={importAndSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
