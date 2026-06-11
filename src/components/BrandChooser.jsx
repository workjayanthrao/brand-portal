import React, { useRef, useState } from 'react'
import { uid } from '../storage.js'

function BrandCard({ brand, onOpen, edit, onChange, onDelete }) {
  const fileRef = useRef(null)
  const [renaming, setRenaming] = useState(false)

  const setLogo = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...brand, logo: reader.result })
    reader.readAsDataURL(file)
  }

  const words = brand.name.split(' ')

  return (
    <div className="brand-card-wrap">
      <div
        className="brand-card"
        style={{ background: brand.cardBg, color: brand.cardTextColor }}
        onClick={onOpen}
      >
        {brand.logo
          ? <img src={brand.logo} alt={brand.name} />
          : <span className="brand-logo-text" style={{ color: brand.cardTextColor }}>
              <span className="word1">{words[0]?.toLowerCase()} </span>
              <span className="word2" style={{ color: brand.accent }}>{words.slice(1).join(' ').toLowerCase()}</span>
            </span>}
      </div>
      <div className="brand-card-label">
        {renaming ? (
          <input
            autoFocus defaultValue={brand.name}
            onBlur={(e) => { onChange({ ...brand, name: e.target.value.trim() || brand.name }); setRenaming(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
          />
        ) : brand.name}
      </div>
      {edit && (
        <div className="brand-card-tools">
          <button onClick={() => setRenaming(true)}>Rename</button>
          <button onClick={() => fileRef.current.click()}>Logo</button>
          <label>
            BG <input type="color" value={brand.cardBg} onChange={(e) => onChange({ ...brand, cardBg: e.target.value })} />
          </label>
          <label>
            Text <input type="color" value={brand.cardTextColor} onChange={(e) => onChange({ ...brand, cardTextColor: e.target.value })} />
          </label>
          <button onClick={onDelete}>✕</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden-file"
            onChange={(e) => { setLogo(e.target.files[0]); e.target.value = '' }} />
        </div>
      )}
    </div>
  )
}

export default function BrandChooser({ brands, onOpenBrand, edit, onChangeBrands }) {
  const updateBrand = (i, b) => {
    const next = [...brands]; next[i] = b; onChangeBrands(next)
  }
  const deleteBrand = (i) => {
    if (!window.confirm(`Delete "${brands[i].name}" and all its content?`)) return
    const next = [...brands]; next.splice(i, 1); onChangeBrands(next)
  }
  const addBrand = () => {
    onChangeBrands([...brands, {
      id: uid(), name: 'New Brand', logo: null,
      cardBg: '#FFFFFF', cardTextColor: '#0A202E', accent: '#00D0FA',
      tree: [{ id: uid(), type: 'page', name: 'Brand Guidelines', blocks: [], children: [] }],
    }])
  }

  return (
    <div className="brands-page">
      <div className="brands-body">
        <h1>Choose your brand to begin.</h1>
        <div className="brand-grid">
          {brands.map((b, i) => (
            <BrandCard
              key={b.id} brand={b} edit={edit}
              onOpen={() => onOpenBrand(b.id)}
              onChange={(nb) => updateBrand(i, nb)}
              onDelete={() => deleteBrand(i)}
            />
          ))}
          {edit && (
            <button className="add-brand-card" onClick={addBrand}>＋ Add brand</button>
          )}
        </div>
      </div>
      <div className="brands-footer">Developed for Amazon India by Landor</div>
    </div>
  )
}
