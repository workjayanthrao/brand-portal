import React from 'react'
import Sidebar from './Sidebar.jsx'
import PageView from './PageView.jsx'
import { TextTools } from './shared.jsx'
import { flattenPages, findPage } from '../storage.js'

export default function BrandView({ brand, pageId, onSelectPage, onChangeBrand, edit, onBackToBrands }) {
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

  return (
    <div className={`brand-view${edit ? ' edit' : ''}`}>
      <Sidebar
        brand={brand} currentPageId={pageId}
        onSelectPage={onSelectPage} onChangeTree={onChangeTree}
        edit={edit} onBackToBrands={onBackToBrands}
      />
      <PageView
        page={page} onChangePage={onChangePage}
        edit={edit} pages={pages} onNavigate={onSelectPage}
      />
      {edit && (
        <div className="edit-chrome">
          <TextTools />
        </div>
      )}
    </div>
  )
}
