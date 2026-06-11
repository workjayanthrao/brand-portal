import React from 'react'
import { RichText } from './shared.jsx'
import { BlockList } from './Blocks.jsx'

export default function PageView({ page, onChangePage, edit, pages, onNavigate }) {
  if (!page) {
    return (
      <main className="page-area">
        <div className="page-inner">
          <p className="rt body" style={{ marginTop: 40 }}>
            Select a page from the sidebar{edit ? ' or add one.' : '.'}
          </p>
        </div>
      </main>
    )
  }
  return (
    <main className="page-area" key={page.id}>
      <div className="page-inner">
        <RichText
          html={page.name} edit={edit} tag="h1" className="page-title"
          placeholder="Page title"
          onChange={(html) => {
            const name = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            onChangePage({ ...page, name: name || page.name })
          }}
        />
        <BlockList
          blocks={page.blocks}
          onChange={(blocks) => onChangePage({ ...page, blocks })}
          edit={edit} context="page" pages={pages} onNavigate={onNavigate}
        />
      </div>
    </main>
  )
}
