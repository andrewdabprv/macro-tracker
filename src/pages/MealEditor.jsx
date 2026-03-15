import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFoods } from '../hooks/useFoods'
import { useMeals } from '../hooks/useMeals'
import { NUTRIENT_CONFIG } from '../data/nutrients'
import './MealEditor.css'

function round(n) {
  return Math.round(n * 10) / 10
}

export default function MealEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { foods } = useFoods()
  const { meals, updateMeal } = useMeals()

  const existingMeal = meals.find(m => m.id === id)

  const [name, setName] = useState(existingMeal?.name ?? '')
  const [ingredients, setIngredients] = useState(existingMeal?.ingredients ?? [])
  const [ingSearch, setIngSearch] = useState('')

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(ingSearch.toLowerCase())
  )

  function addIngredient(food) {
    setIngredients(prev => [...prev, {
      foodId: food.id,
      foodSnapshot: {
        name: food.name,
        ...Object.fromEntries(NUTRIENT_CONFIG.map(n => [n.key, food[n.key] ?? 0]))
      },
      grams: 100,
    }])
    setIngSearch('')
  }

  function updateGrams(idx, val) {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, grams: val } : ing))
  }

  function removeIngredient(idx) {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  function goBack() {
    sessionStorage.setItem('foods-view', 'meals')
    navigate('/foods')
  }

  function handleSave() {
    if (!name.trim() || !existingMeal) return
    const meal = {
      name: name.trim(),
      ingredients: ingredients.map(ing => ({
        ...ing,
        grams: parseFloat(ing.grams) || 0,
      })),
    }
    try {
      updateMeal(existingMeal.id, meal)
    } catch (e) {
      console.error('Failed to save meal:', e)
    }
    goBack()
  }

  return (
    <div className="meal-editor">
      <div className="meal-editor-header">
        <button className="me-back-btn" onClick={goBack}>← Back</button>
        <button className="me-save-btn" onClick={handleSave} disabled={!name.trim()}>Save</button>
      </div>

      <input
        className="me-name-input"
        placeholder="Meal name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />

      <div className="me-section">
        <h2 className="me-section-title">Ingredients</h2>
        {ingredients.length === 0 ? (
          <p className="me-empty">No ingredients yet — search below to add some.</p>
        ) : (
          <div className="me-ing-list">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="me-ing-row">
                <div className="me-ing-info">
                  <span className="me-ing-name">{ing.foodSnapshot.name}</span>
                  <span className="me-ing-kcal">
                    {round((ing.foodSnapshot.calories ?? 0) * (parseFloat(ing.grams) || 0) / 100)} kcal
                  </span>
                </div>
                <div className="me-ing-right">
                  <input
                    className="me-grams-input"
                    type="number"
                    min="1"
                    value={ing.grams}
                    onChange={e => updateGrams(idx, e.target.value)}
                  />
                  <span className="me-unit">g</span>
                  <button className="me-remove-btn" onClick={() => removeIngredient(idx)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="me-section">
        <h2 className="me-section-title">Add Ingredient</h2>
        <input
          className="me-search-input"
          placeholder="Search your foods..."
          value={ingSearch}
          onChange={e => setIngSearch(e.target.value)}
        />
        {foods.length === 0 && (
          <p className="me-empty">Your food database is empty. Add foods first.</p>
        )}
        {foods.length > 0 && (
          <div className="me-food-list">
            {filteredFoods.map(f => (
              <button key={f.id} className="me-food-item" onClick={() => addIngredient(f)}>
                <span className="me-food-name">{f.name}</span>
                <span className="me-food-meta">{round(f.calories)} kcal · {round(f.protein)}g P · {round(f.carbs)}g C · {round(f.fat)}g F</span>
              </button>
            ))}
            {filteredFoods.length === 0 && ingSearch && (
              <p className="me-empty">"{ingSearch}" not in your database.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
