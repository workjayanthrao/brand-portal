import React, { useState } from 'react'
import { uid } from '../storage.js'

function BrandLogo({ brand, onClick }) {
  const words = brand.name.split(' ')
  return (
    <div className="sidebar-logo" onClick={onClick} title="Back to brands">
      {brand.logo
        ? <img src={brand.logo} alt={brand.name} />
        : <span className="brand-logo-text">
            <span className="word1">{words[0]?.toLowerCase()} </span>
            <span className="word2">{words.slice(1).join(' ').toLowerCase()}</span>
          </span>}
    </div>
  )
}

export default function Sidebar({ brand, currentPageId, onSelectPage, onChangeTree, edit, onBackToBrands }) {
  const [renaming, setRenaming] = useState(null)

  const mutate = (fn) => {
    const tree = JSON.parse(JSON.stringify(brand.tree))
    fn(tree)
    onChangeTree(tree)
  }

  const addFolder = () => mutate((tree) => {
    tree.push({ id: uid(), type: 'folder', name: 'New folder', children: [], open: true })
  })

  const addPage = () => mutate((tree) => {
    const pg = { id: uid(), type: 'page', name: 'New page', blocks: [], children: [] }
    const target = tree.find((n) => n.type === 'folder')
    if (target) { target.children.push(pg); target.open = true }
    else tree.push(pg)
  })

  // generic helpers operating on a (parent array, index)
  const walk = (tree, id, cb, parent = null) => {
    for (let i = 0; i < tree.length; i++) {
      const n = tree[i]
      if (n.id === id) { cb(tree, i, n, parent); return true }
      if (n.children && walk(n.children, id, cb, n)) return true
    }
    return false
  }

  const rename = (id, name) => mutate((tree) => walk(tree, id, (arr, i, n) => { n.name = name || n.name }))
  const remove = (id) => {
    if (!window.confirm('Delete this item and everything inside it?')) return
    mutate((tree) => walk(tree, id, (arr, i) => arr.splice(i, 1)))
  }
  const moveNode = (id, dir) => mutate((tree) => walk(tree, id, (arr, i) => {
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    const [n] = arr.splice(i, 1); arr.splice(j, 0, n)
  }))
  const toggleOpen = (id) => mutate((tree) => walk(tree, id, (arr, i, n) => { n.open = n.open === false }))
  const addChildPage = (id) => mutate((tree) => walk(tree, id, (arr, i, n) => {
    n.children = n.children || []
    n.children.push({ id: uid(), type: 'page', name: n.type === 'folder' ? 'New page' : 'New sub-page', blocks: [], children: [] })
    n.open = true
  }))

  const Row = ({ node, depth, isFolder, isSub }) => {
    const open = node.open !== false
    const active = node.id === currentPageId
    return (
      <>
        <div className={`nav-row${isFolder ? ' folder' : ''}${isSub ? ' sub' : ''}`}>
          <span className="drag">≡</span>
          {renaming === node.id ? (
            <input
              className="nav-rename" autoFocus defaultValue={node.name}
              onBlur={(e) => { rename(node.id, e.target.value.trim()); setRenaming(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
            />
          ) : (
            <span
              className={`label${active ? ' active' : ''}`}
              onClick={() => isFolder ? toggleOpen(node.id) : onSelectPage(node.id)}
              onDoubleClick={edit ? () => setRenaming(node.id) : undefined}
            >{node.name}</span>
          )}
          {edit && (
            <span className="rowtools">
              <button title="Rename" onClick={() => setRenaming(node.id)}>✎</button>
              {(isFolder || depth === 0) && <button title={isFolder ? 'Add page' : 'Add sub-page'} onClick={() => addChildPage(node.id)}>＋</button>}
              <button title="Move up" onClick={() => moveNode(node.id, -1)}>↑</button>
              <button title="Move down" onClick={() => moveNode(node.id, 1)}>↓</button>
              <button title="Delete" onClick={() => remove(node.id)}>✕</button>
            </span>
          )}
          {(isFolder || (node.children && node.children.length > 0)) && (
            <button className="chev" onClick={() => toggleOpen(node.id)}>{open ? '⌃' : '⌄'}</button>
          )}
        </div>
        {open && node.children && (
          <div className="nav-children">
            {node.children.map((c) => (
              <Row key={c.id} node={c} depth={depth + 1} isFolder={c.type === 'folder'} isSub={!isFolder && c.type === 'page'} />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <aside className="sidebar">
      <BrandLogo brand={brand} onClick={onBackToBrands} />
      {edit && (
        <div className="sidebar-actions">
          <button onClick={addFolder}><span className="ico">▣</span> Add folder</button>
          <button onClick={addPage}><span className="ico">▤</span> Add page</button>
        </div>
      )}
      <nav className="nav-tree">
        {brand.tree.map((n) => (
          <Row key={n.id} node={n} depth={0} isFolder={n.type === 'folder'} isSub={false} />
        ))}
      </nav>
    </aside>
  )
}
