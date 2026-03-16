import { useState } from 'react'
import { useFoodLog } from '../hooks/useFoodLog'
import { useGoals } from '../hooks/useGoals'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { getNutrientGroups } from '../data/nutrients'
import './Home.css'

function round(n) {
  return Math.round(n * 10) / 10
}

const MAIN = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#007aff' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#34c759' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#ff9500' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    color: '#ff3b30' },
]

const R = 34
const CIRC = 2 * Math.PI * R

function Ring({ value, goal, color, label, unit }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0
  const offset = CIRC * (1 - pct)
  const over = goal > 0 && value > goal

  return (
    <div className="ring-wrap">
      <div className="ring-svg-wrap">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={R} fill="none" stroke="#3a3a3c" strokeWidth="7" />
          {(pct > 0 || over) && (
            <circle
              cx="44" cy="44" r={R}
              fill="none"
              stroke={over ? '#ff3b30' : color}
              strokeWidth="7"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
            />
          )}
        </svg>
        <div className="ring-center">
          <span className="ring-value">{round(value)}</span>
          {goal > 0 && <span className="ring-goal">/{goal}</span>}
        </div>
      </div>
      <span className="ring-label">{label}</span>
      <span className="ring-unit">{unit}</span>
    </div>
  )
}

const CHART_W = 280
const CHART_DATA_TOP = 8
const CHART_DATA_BOT = 52
const CHART_LABEL_Y = 68

function WeightCard() {
  const today = new Date().toISOString().slice(0, 10)
  const { getWeight, getRecentEntries } = useBodyWeight()

  const week = getRecentEntries(7)
  const known = week.filter(d => d.weight !== null)
  const weights = known.map(d => d.weight)
  const minW = known.length ? Math.min(...weights) : 0
  const maxW = known.length ? Math.max(...weights) : 0
  const range = maxW - minW || 1
  const colW = CHART_W / 7
  const todayWeight = getWeight(today)

  const pts = week.map((d, i) => {
    const x = colW * i + colW / 2
    const y = d.weight !== null
      ? CHART_DATA_BOT - ((d.weight - minW) / range) * (CHART_DATA_BOT - CHART_DATA_TOP)
      : null
    const dayLetter = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })
    return { x, y, weight: d.weight, day: dayLetter, isToday: d.date === today }
  })

  const linePts = pts.filter(p => p.y !== null).map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="weight-card">
      <div className="weight-card-header">
        <span className="weight-card-title">Body Weight</span>
        {todayWeight !== null
          ? <span className="weight-card-today">{todayWeight} kg</span>
          : <span className="weight-card-hint">Log in Today tab</span>
        }
      </div>

      <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_LABEL_Y + 6}`}>
        {known.length > 1 && (
          <polyline
            points={linePts}
            fill="none"
            stroke="#007aff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {pts.map((p, i) => (
          <g key={i}>
            {p.y !== null ? (
              <circle cx={p.x} cy={p.y} r="4" fill={p.isToday ? '#007aff' : '#5ac8fa'} />
            ) : (
              <circle cx={p.x} cy={(CHART_DATA_TOP + CHART_DATA_BOT) / 2} r="3"
                fill="none" stroke="#3a3a3c" strokeWidth="1.5" />
            )}
            <text
              x={p.x} y={CHART_LABEL_Y}
              textAnchor="middle"
              fontSize="10"
              fill={p.isToday ? '#007aff' : '#636366'}
              fontWeight={p.isToday ? '700' : '400'}
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function StreakCard() {
  const { getTotalsForDate } = useFoodLog()
  const { goals } = useGoals()
  const calorieGoal = goals.calories

  const today = new Date().toISOString().slice(0, 10)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const cals = calorieGoal > 0 ? getTotalsForDate(dateStr).calories : 0
    const hit = calorieGoal > 0 && cals >= calorieGoal * 0.9
    const letter = d.toLocaleDateString('en-US', { weekday: 'narrow' })
    return { dateStr, hit, letter, isToday: dateStr === today }
  })

  // Count streak backwards from today (count today only if already hit)
  let streak = 0
  for (let i = 6; i >= 0; i--) {
    if (days[i].hit) streak++
    else break
  }

  if (calorieGoal === 0) return null

  return (
    <div className="streak-card">
      <div className="streak-header">
        <span className="streak-title">Calorie Streak</span>
        <span className="streak-count">{streak} {streak === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="streak-dots">
        {days.map(({ dateStr, hit, letter, isToday }) => (
          <div key={dateStr} className="streak-day">
            <div className={`streak-dot ${hit ? 'hit' : 'miss'} ${isToday ? 'today' : ''}`} />
            <span className={`streak-letter ${isToday ? 'today' : ''}`}>{letter}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { totals } = useFoodLog()
  const { goals } = useGoals()
  const groups = getNutrientGroups()
  const [expandedGroup, setExpandedGroup] = useState(null)

  return (
    <div className="home">
      <h1 className="page-title">Home</h1>

      <WeightCard />

      <StreakCard />

      <div className="rings-grid">
        {MAIN.map(({ key, label, unit, color }) => (
          <Ring
            key={key}
            value={totals[key]}
            goal={goals[key]}
            color={color}
            label={label}
            unit={unit}
          />
        ))}
      </div>

      {goals.calories === 0 && (
        <p className="home-hint">Set your daily goals in Settings to track progress.</p>
      )}

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
                    <span className="nutrient-value">
                      {round(totals[key])} {unit}
                      {goals[key] > 0 && <span className="nutrient-goal"> / {goals[key]}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
