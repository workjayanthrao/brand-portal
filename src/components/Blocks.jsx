import React from 'react'
import { RichText, MediaSlot, AddBar, BlockTools } from './shared.jsx'
import { makeBlock, ddItem } from '../storage.js'

export const PAGE_TYPES = ['text', 'image', 'textImage', 'twoImage', 'section', 'dodont', 'callout', 'note']
export const SECTION_TYPES = ['text', 'image', 'twoImage', 'dodont', 'callout', 'note']
export const CALLOUT_TYPES = ['text', 'image', 'twoImage', 'threeImage', 'dodont']

/* Renders an ordered list of blocks with editing controls + an add bar */
export function BlockList({ blocks, onChange, edit, context, pages, onNavigate, showAddBar = true }) {
  const types = context === 'callout' ? CALLOUT_TYPES : context === 'section' ? SECTION_TYPES : PAGE_TYPES
  const label = context === 'callout' ? 'Callout tools' : context === 'section' ? 'Section tools' : 'Page tools'

  const update = (i, b) => { const next = [...blocks]; next[i] = b; onChange(next) }
  const remove = (i) => { const next = [...blocks]; next.splice(i, 1); onChange(next) }
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]; const [b] = next.splice(i, 1); next.splice(j, 0, b)
    onChange(next)
  }
  const add = (type) => onChange([...blocks, makeBlock(type)])

  return (
    <>
      {blocks.map((b, i) => (
        <div className={`block b-${b.type.toLowerCase()}-outer`} key={b.id}>
          {edit && <BlockTools onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)} onDelete={() => remove(i)} />}
          <Block block={b} onChange={(nb) => update(i, nb)} edit={edit} pages={pages} onNavigate={onNavigate} />
        </div>
      ))}
      {edit && showAddBar && <AddBar types={types} onAdd={add} mini={context !== 'page'} label={label} />}
    </>
  )
}

function Block({ block, onChange, edit, pages, onNavigate }) {
  const set = (patch) => onChange({ ...block, ...patch })

  switch (block.type) {
    case 'text':
      return <RichText html={block.html} onChange={(html) => set({ html })} edit={edit}
        className={`rt ${block.style || 'body'}`} />

    case 'image':
      return <div className="b-image"><MediaSlot media={block.media} onChange={(media) => set({ media })} edit={edit} /></div>

    case 'textImage':
      return (
        <div className="b-textimage">
          <div className="ti-left">
            <RichText html={block.html} onChange={(html) => set({ html })} edit={edit} className="rt lead" placeholder="Lead text…" />
            {(edit || block.html2) && (
              <RichText html={block.html2} onChange={(html2) => set({ html2 })} edit={edit} className="rt small" placeholder="Secondary text (optional)…" />
            )}
          </div>
          <MediaSlot media={block.media} onChange={(media) => set({ media })} edit={edit} />
        </div>
      )

    case 'twoImage':
      return (
        <div className="b-twoimage">
          <MediaSlot media={block.media1} onChange={(media1) => set({ media1 })} edit={edit} />
          <MediaSlot media={block.media2} onChange={(media2) => set({ media2 })} edit={edit} />
        </div>
      )

    case 'threeImage':
      return (
        <div className="b-threeimage">
          <MediaSlot media={block.media1} onChange={(media1) => set({ media1 })} edit={edit} grey />
          <MediaSlot media={block.media2} onChange={(media2) => set({ media2 })} edit={edit} grey />
          <MediaSlot media={block.media3} onChange={(media3) => set({ media3 })} edit={edit} grey />
        </div>
      )

    case 'section':
      return (
        <div className="b-section">
          <RichText html={block.title} onChange={(title) => set({ title })} edit={edit} className="sec-title" tag="h3" placeholder="Title" />
          <div className="sec-body">
            <BlockList blocks={block.blocks} onChange={(blocks) => set({ blocks })} edit={edit}
              context="section" pages={pages} onNavigate={onNavigate} />
          </div>
        </div>
      )

    case 'dodont': {
      const setItem = (i, patch) => {
        const items = [...block.items]; items[i] = { ...items[i], ...patch }; set({ items })
      }
      const setUnits = (u) => {
        let items = [...block.items]
        while (items.length < u) items.push(ddItem(items.length < 2))
        items = items.slice(0, u)
        set({ units: u, items })
      }
      return (
        <div>
          {edit && (
            <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
              <button className="t-label" style={{ fontWeight: block.units === 2 ? 700 : 400, fontFamily: 'var(--display)' }} onClick={() => setUnits(2)}>2 units</button>
              <button className="t-label" style={{ fontWeight: block.units === 3 ? 700 : 400, fontFamily: 'var(--display)' }} onClick={() => setUnits(3)}>3 units</button>
            </div>
          )}
          <div className={`b-dodont u${block.units}`}>
            {block.items.map((it, i) => (
              <div className="dd-item" key={it.id}>
                <MediaSlot media={it.media} onChange={(media) => setItem(i, { media })} edit={edit} showCaption={false} />
                <div className="dd-cap">
                  <button
                    className={`dd-badge ${it.good ? 'do' : 'dont'}`}
                    title={edit ? 'Toggle do / don’t' : undefined}
                    onClick={edit ? () => setItem(i, { good: !it.good }) : undefined}
                  />
                  <RichText html={it.html} onChange={(html) => setItem(i, { html })} edit={edit} className="rt small" placeholder="Caption…" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'callout': {
      const collapsed = !!block.collapsed
      const linked = pages.find((p) => p.id === block.linkPageId)
      return (
        <div className="b-callout">
          <div className="callout-head">
            <span className="info">i</span>
            <RichText html={block.title} onChange={(title) => set({ title })} edit={edit} className="c-title" placeholder="Callout title" />
            {edit ? (
              <select className="callout-link-select" value={block.linkPageId || ''} onChange={(e) => set({ linkPageId: e.target.value })}>
                <option value="">No page link</option>
                {pages.map((p) => <option key={p.id} value={p.id}>{' '.repeat(p.depth * 2)}{p.name}</option>)}
              </select>
            ) : linked ? (
              <a className="c-link" href="#" onClick={(e) => { e.preventDefault(); onNavigate(linked.id) }}>Link to page ↗</a>
            ) : null}
            <button className="chev" onClick={() => set({ collapsed: !collapsed })}>{collapsed ? '⌄' : '⌃'}</button>
          </div>
          {!collapsed && (
            <div className="callout-body">
              <BlockList blocks={block.blocks} onChange={(blocks) => set({ blocks })} edit={edit}
                context="callout" pages={pages} onNavigate={onNavigate} />
            </div>
          )}
        </div>
      )
    }

    case 'note':
      return (
        <div className="b-note">
          <span className="note-prefix">Note:</span>
          <RichText html={block.html} onChange={(html) => set({ html })} edit={edit} className="rt" placeholder="Note text…" />
        </div>
      )

    default:
      return null
  }
}
