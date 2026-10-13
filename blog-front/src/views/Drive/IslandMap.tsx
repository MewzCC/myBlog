import { islandSize, type IslandTelemetry } from './island'

export default function IslandMap({
  telemetry,
  stations,
  detailed = false,
}: {
  telemetry: IslandTelemetry
  stations: readonly { id: string; x: number; z: number; color: string }[]
  detailed?: boolean
}) {
  const x = (value: number) => 50 + (value / islandSize.width) * 88
  const z = (value: number) => 50 + (value / islandSize.depth) * 88
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={
        detailed
          ? '扩展岛屿全图，包含外围道路、森林、营地、海港及岛民位置'
          : '岛屿小地图与车辆实时位置'
      }
    >
      <rect x="4" y="6" width="92" height="88" rx="15" className="drift__map-island" />
      <path d="M16 17H84V83H16Z M35 34H65V66H35Z M50 17V83 M16 50H84" className="drift__map-road" />
      <ellipse cx="25" cy="25" rx="7" ry="5" fill="#81dbc5" />
      <path d="M36 88l3-5 3 5 M72 76l3-5 3 5" fill="#ffbd69" />
      {stations.map((s) => (
        <circle key={s.id} cx={x(s.x)} cy={z(s.z)} r="3" fill={s.color} />
      ))}
      {telemetry.residents.map((r) => (
        <circle
          key={r.id}
          cx={x(r.x)}
          cy={z(r.z)}
          r="1.8"
          fill={r.hp === 0 ? '#66756c' : r.hp < 100 ? '#ff9580' : '#21373d'}
        >
          <title>
            {r.name} · {r.hp}/100
          </title>
        </circle>
      ))}
      <g
        transform={`translate(${x(telemetry.x)} ${z(telemetry.z)}) rotate(${(-telemetry.yaw * 180) / Math.PI})`}
      >
        <path d="M0 5L-3 -4L0 -2L3 -4Z" className="drift__map-car" />
      </g>
      {detailed && (
        <g className="drift__atlas-labels">
          <text x="10" y="44">
            FOREST
          </text>
          <text x="66" y="45">
            HARBOR
          </text>
          <text x="54" y="92">
            CAMP
          </text>
          <text x="53" y="11">
            LOOKOUT
          </text>
        </g>
      )}
    </svg>
  )
}
