import React, { useRef, useEffect } from 'react'

/* ---------- Rich text (contentEditable) ---------- */
export function RichText({ html, onChange, edit, className = 'rt body', placeholder = 'Type text…', tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (html || '')) ref.current.innerHTML = html || ''
  }, [html, edit])
  const Tag = tag
  if (!edit) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html || '' }} />
  }
  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      onBlur={() => onChange(ref.current.innerHTML)}
    />
  )
}

/* ---------- Media slot (image or video, with caption) ---------- */
export function MediaSlot({ media, onChange, edit, grey = false, showCaption = true }) {
  const fileRef = useRef(null)

  const setFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const kind = file.type.startsWith('video') ? 'video' : 'image'
      onChange({ kind, src: reader.result, caption: media?.caption || '' })
    }
    reader.readAsDataURL(file)
  }

  const pasteUrl = () => {
    const url = window.prompt('Paste image or video URL:')
    if (!url) return
    const kind = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? 'video' : 'image'
    onChange({ kind, src: url, caption: media?.caption || '' })
  }

  const hasMedia = media && media.src
  return (
    <div className="media-wrap">
      <div className={`media-slot${grey ? ' grey' : ''}`}>
        {hasMedia && media.kind === 'image' && <img src={media.src} alt={media.caption || ''} />}
        {hasMedia && media.kind === 'video' && <video src={media.src} controls />}
        {!hasMedia && edit && (
          <button
            className="add-plus"
            title="Add image or video"
            onClick={(e) => { e.altKey ? pasteUrl() : fileRef.current.click() }}
            onContextMenu={(e) => { e.preventDefault(); pasteUrl() }}
          >+</button>
        )}
        {hasMedia && edit && (
          <button className="media-clear" onClick={() => onChange(null)}>Remove</button>
        )}
        <input
          ref={fileRef} type="file" accept="image/*,video/*" className="hidden-file"
          onChange={(e) => { setFile(e.target.files[0]); e.target.value = '' }}
        />
      </div>
      {showCaption && (edit || media?.caption) && (
        <CaptionEditor media={media} onChange={onChange} edit={edit} />
      )}
    </div>
  )
}

function CaptionEditor({ media, onChange, edit }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== (media?.caption || '')) ref.current.innerText = media?.caption || ''
  }, [media?.caption, edit])
  if (!edit) {
    return media?.caption ? <div className="media-caption">{media.caption}</div> : null
  }
  return (
    <div
      ref={ref}
      className="media-caption"
      contentEditable
      suppressContentEditableWarning
      data-ph="Add caption (optional)…"
      onBlur={() => onChange({ ...(media || { kind: 'none', src: '' }), caption: ref.current.innerText })}
    />
  )
}

/* ---------- Add-block bar ---------- */
const TILE_DEFS = {
  text: ['≡', 'Text'],
  image: ['▭', 'Image'],
  textImage: ['≡▭', 'Text + Image'],
  twoImage: ['▭▭', '2 Images'],
  threeImage: ['▭▭▭', '3 Images'],
  section: ['▔▤', 'Section'],
  dodont: ['✓✕', "Do's / Don't"],
  callout: ['！', 'Callout'],
  note: ['▢', 'Note'],
}

export function AddBar({ types, onAdd, mini = false, label = 'Add blocks' }) {
  return (
    <div className={`addbar${mini ? ' mini' : ''}`}>
      <div className="addbar-panel">
        <div className="panel-label">{label}</div>
        <div className="addbar-tiles">
          {types.map((t) => (
            <button key={t} onClick={() => onAdd(t)}>
              <span className="t-ico">{TILE_DEFS[t][0]}</span>
              <span className="t-label">{TILE_DEFS[t][1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TextTools() {
  const exec = (cmd) => {
    if (cmd === 'createLink') {
      const url = window.prompt('Link URL:')
      if (url) document.execCommand('createLink', false, url)
      return
    }
    document.execCommand(cmd)
  }
  // onMouseDown preventDefault keeps the text selection alive
  return (
    <div className="addbar-panel texttools">
      <div className="panel-label">Text tools</div>
      <div className="addbar-tiles">
        <button onMouseDown={(e) => { e.preventDefault(); exec('bold') }}>
          <span className="t-ico"><b>B</b></span><span className="t-label">Bold</span>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('italic') }}>
          <span className="t-ico"><i>i</i></span><span className="t-label">Italic</span>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('createLink') }}>
          <span className="t-ico">⧉</span><span className="t-label">Hyperlink</span>
        </button>
      </div>
    </div>
  )
}

/* ---------- Block tool strip (move/delete) ---------- */
export function BlockTools({ onMoveUp, onMoveDown, onDelete }) {
  return (
    <div className="block-tools">
      <button title="Move up" onClick={onMoveUp}>↑</button>
      <button title="Move down" onClick={onMoveDown}>↓</button>
      <button title="Delete block" onClick={onDelete}>✕</button>
    </div>
  )
}
