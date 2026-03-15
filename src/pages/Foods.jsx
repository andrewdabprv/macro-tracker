import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFoods } from '../hooks/useFoods'
import { useMeals } from '../hooks/useMeals'
import { searchUSDA } from '../data/usda'
import { lookupBarcode } from '../data/openfoodfacts'
import { getNutrientGroups, NUTRIENT_CONFIG, BAR_THRESHOLDS } from '../data/nutrients'
import './Foods.css'

function round(n) {
  return Math.round(n * 10) / 10
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

const G = '#e8e8e8'
function barGradient(key, value) {
  const t = BAR_THRESHOLDS[key]
  if (!t) return `linear-gradient(to right, #34c759 25%, ${G} 25%)`
  if (value < t[0]) return `linear-gradient(to right, #34c759 25%, ${G} 25%)`
  if (value < t[1]) return `linear-gradient(to right, #34c759, #ffcc00 50%, ${G} 50%)`
  if (value < t[2]) return `linear-gradient(to right, #34c759, #ffcc00 40%, #ff9500 75%, ${G} 75%)`
  return `linear-gradient(to right, #34c759, #ffcc00 33%, #ff9500 66%, #ff3b30)`
}

// Add a new food or edit an existing one
function FoodFormModal({ initialFood, onSave, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const isEdit = !!initialFood
  const groups = getNutrientGroups()

  const [name, setName] = useState(initialFood?.name ?? '')
  const [fields, setFields] = useState(() => {
    const init = {}
    for (const { key } of NUTRIENT_CONFIG) {
      const v = initialFood?.[key]
      init[key] = (v != null && v !== 0) ? String(v) : ''
    }
    return init
  })

  function setField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!name.trim() || !fields.calories) return
    const data = { name: name.trim() }
    for (const { key } of NUTRIENT_CONFIG) {
      data[key] = parseFloat(fields[key]) || 0
    }
    onSave(data)
    onClose()
  }

  const canSave = name.trim() && fields.calories

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal food-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title-row">
          <h2>{isEdit ? 'Edit Food' : 'Add Custom Food'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="form-scroll">
          <div className="form-field">
            <label className="form-label">Name <span className="required">*</span></label>
            <input
              className="input"
              placeholder="e.g. Greek Yogurt"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus={!isEdit}
            />
          </div>

          <p className="per100">All values per 100g · only Calories is required</p>

          {Object.entries(groups).map(([group, nutrients]) => (
            <div key={group} className="form-group">
              <h3 className="form-group-title">{group}</h3>
              {nutrients.map(({ key, label, unit }) => (
                <div key={key} className="form-field-row">
                  <label className="form-field-label">
                    {label}
                    {key === 'calories' && <span className="required"> *</span>}
                  </label>
                  <div className="form-field-input-wrap">
                    <input
                      className="input num-input"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="—"
                      value={fields[key]}
                      onChange={e => setField(key, e.target.value)}
                    />
                    <span className="form-unit">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Barcode lookup via Open Food Facts
function BarcodeModal({ onImport, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLookup() {
    const code = barcode.trim()
    if (!code) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const food = await lookupBarcode(code)
      setResult(food)
    } catch (err) {
      setError(err.message ?? 'Lookup failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    onImport(result)
    onClose()
  }

  const present = result ? NUTRIENT_CONFIG.filter(n => result[n.key] > 0) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal barcode-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title-row">
          <h2>Barcode Lookup</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="barcode-hint">Type the numbers from the barcode (EAN-13)</p>
        <div className="search-row">
          <input
            className="input"
            placeholder="e.g. 5901234123457"
            value={barcode}
            onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            inputMode="numeric"
            autoFocus
          />
          <button className="btn primary small" onClick={handleLookup} disabled={loading || !barcode.trim()}>
            {loading ? '...' : 'Look up'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {result && (
          <>
            <div className="barcode-result-scroll">
              <p className="barcode-result-name">{result.name}</p>
              <p className="per100">Per 100g</p>
              {present.map(({ key, label, unit }) => {
                const value = result[key]
                return (
                  <div key={key} className="barcode-nutrient-row">
                    <div
                      className="barcode-inline-bar"
                      style={{ background: barGradient(key, value) }}
                    />
                    <span className="analysis-label">{label}</span>
                    <span className="analysis-value">{round(value)} {unit}</span>
                  </div>
                )
              })}
            </div>
            <button className="btn primary" onClick={handleAdd}>Add to database</button>
          </>
        )}
      </div>
    </div>
  )
}

// USDA search + import modal
function ImportModal({ onImport, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const foods = await searchUSDA(query)
      setResults(foods)
      if (foods.length === 0) setError('No results found.')
    } catch (err) {
      setError(err.message ?? 'Search failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title-row">
          <h2>Import from USDA</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="search-row">
          <input
            className="input"
            placeholder="e.g. chicken breast"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button className="btn primary small" onClick={handleSearch} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <ul className="food-list">
          {results.map(f => (
            <li key={f.fdcId} className="food-item import-item" onClick={() => { onImport(f); onClose() }}>
              <span className="import-name">{f.name}</span>
              <span className="import-meta">{round(f.calories)} kcal · {round(f.protein)}g P · {round(f.carbs)}g C · {round(f.fat)}g F</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Foods() {
  const navigate = useNavigate()
  const { foods, addFood, updateFood, deleteFood } = useFoods()
  const { meals, addMeal, deleteMeal } = useMeals()
  const [view, setView] = useState(() => {
    const saved = sessionStorage.getItem('foods-view')
    if (saved) sessionStorage.removeItem('foods-view')
    return saved ?? 'foods'
  })

  // Foods state
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showBarcode, setShowBarcode] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editFood, setEditFood] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  // Meals state
  const [showNewMeal, setShowNewMeal] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [mealMenuId, setMealMenuId] = useState(null)
  const [mealMenuPos, setMealMenuPos] = useState(null)
  const [mealConfirmId, setMealConfirmId] = useState(null)
  const newMealInputRef = useRef(null)

  function handleCreateMeal() {
    const name = newMealName.trim()
    if (!name) return
    addMeal({ name, ingredients: [] })
    setNewMealName('')
    setShowNewMeal(false)
  }

  function openNewMeal() {
    setNewMealName('')
    setShowNewMeal(true)
    // focus after render
    setTimeout(() => newMealInputRef.current?.focus(), 50)
  }

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )
  const confirmFood = foods.find(f => f.id === confirmId)
  const confirmMeal = meals.find(m => m.id === mealConfirmId)

  function handleDotsClick(e, id) {
    e.stopPropagation()
    if (menuId === id) {
      setMenuId(null); setMenuPos(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
      setMenuId(id)
    }
  }

  function handleMealDotsClick(e, id) {
    e.stopPropagation()
    if (mealMenuId === id) {
      setMealMenuId(null); setMealMenuPos(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setMealMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
      setMealMenuId(id)
    }
  }

  return (
    <div className="foods">
      <div className="foods-header">
        <h1 className="page-title">{view === 'foods' ? 'Foods' : 'Meals'}</h1>
        <div className="header-actions">
          {view === 'foods' ? (
            <>
              <button className="btn secondary small" onClick={() => setShowAdd(true)}>+ Add</button>
              <button className="btn secondary small" onClick={() => setShowBarcode(true)}>Barcode</button>
              <button className="btn primary small" onClick={() => setShowImport(true)}>+ Import</button>
            </>
          ) : (
            <button className="btn primary small" onClick={openNewMeal}>+ New</button>
          )}
        </div>
      </div>

      <div className="seg-control">
        <button className={`seg-btn ${view === 'foods' ? 'active' : ''}`} onClick={() => setView('foods')}>Foods</button>
        <button className={`seg-btn ${view === 'meals' ? 'active' : ''}`} onClick={() => setView('meals')}>Meals</button>
      </div>

      {view === 'foods' && (
        <>
          <input
            className="input"
            placeholder="Search your foods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {foods.length === 0 && (
            <p className="empty">No foods yet. Tap + Add or + Import to get started.</p>
          )}

          {menuId && (
            <>
              <div className="dropdown-backdrop" onClick={() => setMenuId(null)} />
              <div className="dropdown-menu" style={{ top: menuPos.top, right: menuPos.right }}>
                <button className="dropdown-item" onClick={() => { setMenuId(null); setEditFood(foods.find(f => f.id === menuId)) }}>Edit</button>
                <button className="dropdown-item danger" onClick={() => { setMenuId(null); setConfirmId(menuId) }}>Delete</button>
              </div>
            </>
          )}

          <ul className="food-list">
            {filtered.map(f => (
              <li key={f.id} className="food-item db-item">
                <button className="food-info" onClick={() => setEditFood(f)}>
                  <span className="food-name">{f.name}</span>
                  <span className="food-meta">{round(f.calories)} kcal · {round(f.protein)}g P · {round(f.carbs)}g C · {round(f.fat)}g F</span>
                </button>
                <button className="dots-btn" onClick={e => handleDotsClick(e, f.id)}>⋮</button>
              </li>
            ))}
          </ul>

          {confirmFood && (
            <div className="confirm-overlay">
              <div className="confirm-dialog">
                <p className="confirm-title">Delete food?</p>
                <p className="confirm-body">"{confirmFood.name}" will be permanently removed.</p>
                <div className="confirm-actions">
                  <button className="btn secondary" onClick={() => setConfirmId(null)}>Cancel</button>
                  <button className="btn danger" onClick={() => { deleteFood(confirmId); setConfirmId(null) }}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'meals' && (
        <>
          {meals.length === 0 && (
            <p className="empty">No meals yet. Tap + New to create one.</p>
          )}

          {mealMenuId && (
            <>
              <div className="dropdown-backdrop" onClick={() => setMealMenuId(null)} />
              <div className="dropdown-menu" style={{ top: mealMenuPos.top, right: mealMenuPos.right }}>
                <button className="dropdown-item" onClick={() => { setMealMenuId(null); navigate(`/meals/${mealMenuId}`) }}>Edit</button>
                <button className="dropdown-item danger" onClick={() => { setMealMenuId(null); setMealConfirmId(mealMenuId) }}>Delete</button>
              </div>
            </>
          )}

          <ul className="food-list">
            {meals.map(m => {
              const s = mealSummary(m)
              return (
                <li key={m.id} className="food-item db-item">
                  <button className="food-info" onClick={() => navigate(`/meals/${m.id}`)}>
                    <span className="food-name">{m.name}</span>
                    <span className="food-meta">
                      {s.kcal} kcal · {s.protein}g P · {s.carbs}g C · {s.fat}g F · {m.ingredients.length} ingredient{m.ingredients.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <button className="dots-btn" onClick={e => handleMealDotsClick(e, m.id)}>⋮</button>
                </li>
              )
            })}
          </ul>

          {confirmMeal && (
            <div className="confirm-overlay">
              <div className="confirm-dialog">
                <p className="confirm-title">Delete meal?</p>
                <p className="confirm-body">"{confirmMeal.name}" will be permanently removed.</p>
                <div className="confirm-actions">
                  <button className="btn secondary" onClick={() => setMealConfirmId(null)}>Cancel</button>
                  <button className="btn danger" onClick={() => { deleteMeal(mealConfirmId); setMealConfirmId(null) }}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showNewMeal && (
        <div className="confirm-overlay" onClick={() => setShowNewMeal(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <p className="confirm-title">New Meal</p>
            <input
              ref={newMealInputRef}
              className="input"
              placeholder="Meal name"
              value={newMealName}
              onChange={e => setNewMealName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateMeal()}
              autoFocus
            />
            <div className="confirm-actions">
              <button className="btn secondary" onClick={() => setShowNewMeal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleCreateMeal} disabled={!newMealName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <FoodFormModal
          onSave={addFood}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editFood && (
        <FoodFormModal
          initialFood={editFood}
          onSave={data => updateFood(editFood.id, data)}
          onClose={() => setEditFood(null)}
        />
      )}

      {showBarcode && (
        <BarcodeModal
          onImport={addFood}
          onClose={() => setShowBarcode(false)}
        />
      )}

      {showImport && (
        <ImportModal onImport={addFood} onClose={() => setShowImport(false)} />
      )}

    </div>
  )
}
