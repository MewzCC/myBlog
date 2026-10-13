import type { StationId } from './island'

export default function StationArt({ id }: { id: StationId }) {
  return (
    <svg className="drift__station-art" viewBox="0 0 160 100" aria-hidden="true">
      <circle cx="126" cy="23" r="14" fill="var(--station-color)" />
      <path d="M7 83Q40 72 78 81T153 81V100H7Z" fill="#81dbc5" />
      <path d="M8 92Q39 85 66 93T153 92" fill="none" stroke="#fff4da" strokeWidth="3" />
      {id === 'about' ? (
        <g>
          <path d="M54 82L62 30H83L92 82Z" fill="#fff4da" stroke="#21373d" strokeWidth="2" />
          <path d="M60 42H85L87 53H58ZM56 66H89L91 77H54Z" fill="#ff9580" />
          <path
            d="M57 30V16H89V30ZM54 16L73 4L92 16Z"
            fill="#ffbd69"
            stroke="#21373d"
            strokeWidth="2"
          />
          <path d="M73 19V27M65 19V27M81 19V27M67 82V70H79V82" stroke="#21373d" strokeWidth="3" />
          <path d="M94 22L119 14M94 26L120 32" stroke="#ffbd69" strokeWidth="3" />
        </g>
      ) : (
        <g>
          <path d="M40 81V39H113V81Z" fill="#fff4da" stroke="#21373d" strokeWidth="2" />
          <path
            d="M32 40L49 21H105L122 40Z"
            fill="var(--station-color)"
            stroke="#21373d"
            strokeWidth="2"
          />
          <path
            d="M47 81V54H70V81M79 54H105V72H79Z"
            fill="#81dbc5"
            stroke="#21373d"
            strokeWidth="2"
          />
          <path d="M34 41H120V50H34Z" fill="var(--station-color)" />
          <text x="77" y="35" textAnchor="middle" fontSize="13" fill="#21373d">
            {id === 'work' ? '⚒' : id === 'notes' ? 'BOOKS' : 'POST'}
          </text>
          {id === 'guestbook' && (
            <path d="M85 59H101V69H85ZM85 59L93 65L101 59" fill="#fff4da" stroke="#21373d" />
          )}
          {id === 'work' && <path d="M55 58H62V78H55ZM49 64H68" stroke="#21373d" strokeWidth="2" />}
          {id === 'notes' && (
            <path d="M83 57V69M89 57V69M96 57V69" stroke="#ff9580" strokeWidth="4" />
          )}
        </g>
      )}
      <path d="M21 76V57M14 64L21 49L28 64Z" fill="#81dbc5" stroke="#21373d" strokeWidth="2" />
      <path d="M135 70V53M129 59L135 45L141 59Z" fill="#81dbc5" stroke="#21373d" strokeWidth="2" />
    </svg>
  )
}
