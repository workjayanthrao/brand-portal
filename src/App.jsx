import React, { useRef, useState } from 'react'
import Login from './components/Login.jsx'
import BrandChooser from './components/BrandChooser.jsx'
import BrandView from './components/BrandView.jsx'
import { loadData, saveData, exportJSON, EDIT_PASSWORD, firstPage } from './storage.js'

const AUTH_KEY = 'brand-portal-authed'

export default function App() {
  const [data, setData] = useState(loadData)
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')
  const [view, setView] = useState({ screen: 'brands', brandId: null, pageId: null })
  const [editMode, setEditMode] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const importRef = useRef(null)

  const update = (d) => { setData(d); saveData(d) }

  /* ---- auth ---- */
  const loginOk = () => { sessionStorage.setItem(AUTH_KEY, '1'); setAuthed(true) }
  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false); setEditMode(false)
    setView({ screen: 'brands', brandId: null, pageId: null })
  }

  /* ---- edit toggle (separate password) ---- */
  const toggleEdit = () => {
    if (editMode) setEditMode(false)
    else setEditModal(true)
  }

  /* ---- navigation ---- */
  const openBrand = (brandId) => {
    const brand = data.brands.find((b) => b.id === brandId)
    const fp = brand ? firstPage(brand.tree) : null
    setView({ screen: 'brand', brandId, pageId: fp ? fp.id : null })
  }
  const backToBrands = () => setView({ screen: 'brands', brandId: null, pageId: null })

  /* ---- data mutation ---- */
  const changeBrands = (brands) => update({ ...data, brands })
  const changeBrand = (nb) => changeBrands(data.brands.map((b) => (b.id === nb.id ? nb : b)))

  /* ---- import ---- */
  const importFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result)
        if (!d || !Array.isArray(d.brands)) throw new Error('bad shape')
        update(d)
        backToBrands()
      } catch {
        window.alert('Invalid JSON file — import cancelled.')
      }
    }
    reader.readAsText(file)
  }

  if (!authed) return <Login onSuccess={loginOk} />

  const dark = view.screen === 'brands'
  const brand = view.brandId ? data.brands.find((b) => b.id === view.brandId) : null

  return (
    <div className={`app${editMode ? ' edit' : ''}${dark ? ' dark' : ''}`}>
      <header className={`topbar${dark ? ' on-dark' : ''}`}>
        <button className="wordmark" onClick={backToBrands}>Brand Portal</button>
        <div className="topbar-right">
          {editMode && (
            <>
              <button className="topbar-link" onClick={() => exportJSON(data)}>Export JSON</button>
              <button className="topbar-link" onClick={() => importRef.current.click()}>Import JSON</button>
              <input ref={importRef} type="file" accept="application/json" className="hidden-file"
                onChange={(e) => { importFile(e.target.files[0]); e.target.value = '' }} />
            </>
          )}
          <button className={`editmode-btn${editMode ? ' active' : ''}`} onClick={toggleEdit}>
            ✎ {editMode ? 'Exit edit mode' : 'Edit mode'}
          </button>
          <button className="topbar-link" onClick={logout}>Log out</button>
        </div>
      </header>

      {view.screen === 'brands' && (
        <BrandChooser
          brands={data.brands} onOpenBrand={openBrand}
          edit={editMode} onChangeBrands={changeBrands}
        />
      )}

      {view.screen === 'brand' && brand && (
        <BrandView
          brand={brand} pageId={view.pageId}
          onSelectPage={(pageId) => setView({ ...view, pageId })}
          onChangeBrand={changeBrand}
          edit={editMode} onBackToBrands={backToBrands}
        />
      )}

      {editModal && (
        <EditPasswordModal
          onClose={() => setEditModal(false)}
          onSuccess={() => { setEditModal(false); setEditMode(true) }}
        />
      )}
    </div>
  )
}

function EditPasswordModal({ onClose, onSuccess }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (pw === EDIT_PASSWORD) onSuccess()
    else setErr(true)
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Enter edit mode</h2>
        <input
          type="password" autoFocus value={pw} placeholder="Edit password"
          onChange={(e) => { setPw(e.target.value); setErr(false) }}
        />
        {err && <div className="login-error">Incorrect password.</div>}
        <button className="login-btn" type="submit">Unlock editing</button>
        <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
      </form>
    </div>
  )
}
