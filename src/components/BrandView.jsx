import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import PageView from './PageView.jsx'
import { TextTools, AddBar } from './shared.jsx'
import { PAGE_TYPES } from './Blocks.jsx'
import { flattenPages, findPage, makeBlock } from '../storage.js'

export default function BrandView({ brand, pageId, onSelectPage, onChangeBrand, edit, onBackToBrands }) {
  const [navOpen, setNavOpen] = useState(false)
  const pages = flattenPages(brand.tree)
  const page = findPage(brand.tree, pageId)

  const onChangeTree = (tree) => onChangeBrand({ ...brand, tree })

  const onChangePage = (np) => {
    const tree = JSON.parse(JSON.stringify(brand.tree))
    const apply = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === np.id) { nodes[i] = { ...nodes[i], ...np }; return true }
        if (nodes[i].children && apply(nodes[i].children)) return true
      }
      return false
    }
    apply(tree)
    onChangeTree(tree)
  }

  const selectPage = (id) => { onSelectPage(id); setNavOpen(false) }
  const addPageBlock = (type) => {
    if (page) onChangePage({ ...page, blocks: [...page.blocks, makeBlock(type)] })
  }

  return (
    <div className={`brand-view${edit ? ' edit' : ''}`} style={{ '--accent': brand.accent }}>
      <Sidebar
        brand={brand} currentPageId={pageId} mobileOpen={navOpen}
        onSelectPage={selectPage} onChangeTree={onChangeTree}
        edit={edit} onBackToBrands={onBackToBrands}
      />
      {navOpen && <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} />}
      <button className="mobile-nav-toggle" onClick={() => setNavOpen(!navOpen)}>
        {navOpen ? '✕ Close' : '☰ Menu'}
      </button>
      <PageView
        page={page} onChangePage={onChangePage}
        edit={edit} pages={pages} onNavigate={selectPage}
      />
      {edit && page && (
        <div className="edit-chrome">
          <AddBar types={PAGE_TYPES} onAdd={addPageBlock} label="Add blocks" />
          <TextTools />
        </div>
      )}
    </div>
  )
}
