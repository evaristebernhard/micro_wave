import geom from "./connection-hardware-geometry.json"

const mm = (v: number) => `${v}mm`
type P = { x: number; y: number }

const strokePolyline = (points: P[], width: number): P[] => {
  const half = width / 2
  const normals = points.slice(0, -1).map((p, i) => {
    const q = points[i + 1]
    const dx = q.x - p.x
    const dy = q.y - p.y
    const len = Math.hypot(dx, dy)
    return { x: -dy / len, y: dx / len }
  })

  const offset = (i: number, side: 1 | -1): P => {
    const p = points[i]
    if (i === 0) {
      const n = normals[0]
      return { x: p.x + side * half * n.x, y: p.y + side * half * n.y }
    }
    if (i === points.length - 1) {
      const n = normals[normals.length - 1]
      return { x: p.x + side * half * n.x, y: p.y + side * half * n.y }
    }
    const n0 = normals[i - 1]
    const n1 = normals[i]
    const sx = n0.x + n1.x
    const sy = n0.y + n1.y
    const sl = Math.hypot(sx, sy)
    const mx = sx / sl
    const my = sy / sl
    const denom = Math.max(Math.abs(mx * n0.x + my * n0.y), 0.25)
    return {
      x: p.x + side * half * mx / denom,
      y: p.y + side * half * my / denom
    }
  }

  const left = points.map((_, i) => offset(i, 1))
  const right = points.map((_, i) => offset(i, -1)).reverse()
  return [...left, ...right]
}

const outline = [
  { x: -50, y: -15 },
  { x: 15, y: -15 },
  { x: 15, y: 50 },
  { x: -15, y: 50 },
  { x: -15, y: 15 },
  { x: -50, y: 15 }
]

const rfPath = [
  { x: -47.5, y: 0 },
  { x: -6, y: 0 },
  { x: 0, y: 6 },
  { x: 0, y: 47.5 }
]

const idPath = [
  { x: -47.5, y: -10.5 },
  { x: -10.5, y: -10.5 },
  { x: -10.5, y: 47.5 }
]

const CornerCopper = () => (
  <chip
    name="CORNER_CU"
    pcbX={0}
    pcbY={0}
    pinLabels={{ pin1: "RF", pin2: "GND", pin3: "ID" }}
    connections={{ pin2: "net.GND" }}
    footprint={
      <footprint>
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={strokePolyline(rfPath, geom.rf.calibratedTraceWidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin3"]}
          shape="polygon"
          points={strokePolyline(idPath, geom.rf.idTraceWidthMm)}
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          pcbX="-47.5mm"
          pcbY="0mm"
          width={mm(geom.interface.signalPadWidthMm)}
          height={mm(geom.interface.signalPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX="0mm"
          pcbY="47.5mm"
          width={mm(geom.interface.signalPadHeightMm)}
          height={mm(geom.interface.signalPadWidthMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin2"]}
          pcbX="-47.5mm"
          pcbY="-6mm"
          width={mm(geom.interface.groundPadWidthMm)}
          height={mm(geom.interface.groundPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin2"]}
          pcbX="-6mm"
          pcbY="47.5mm"
          width={mm(geom.interface.groundPadHeightMm)}
          height={mm(geom.interface.groundPadWidthMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin3"]}
          pcbX="-47.5mm"
          pcbY="-10.5mm"
          width={mm(geom.interface.idPadWidthMm)}
          height={mm(geom.interface.idPadHeightMm)}
          shape="rect"
        />
        <smtpad
          portHints={["pin3"]}
          pcbX="-10.5mm"
          pcbY="47.5mm"
          width={mm(geom.interface.idPadHeightMm)}
          height={mm(geom.interface.idPadWidthMm)}
          shape="rect"
        />
      </footprint>
    }
  />
)

export const CornerBridgeBoard = () => (
  <board
    title="2.45 GHz planar L corner magnetic bridge"
    outline={outline}
    material="fr4"
    layers={2}
    thickness={mm(geom.stackup.fr4ThicknessMm)}
    routeRemaining={false}
    schematicDisabled
  >
    <net name="GND" />

    <copperpour
      name="GND_PLANE"
      connectsTo="net.GND"
      layer="bottom"
      boardEdgeMargin={mm(geom.rf.boardEdgeGroundMarginMm)}
      clearance="0.15mm"
    />

    <CornerCopper />

    {geom.interface.viaXOffsetsMm.map((dx, i) => (
      <via
        key={`L-${i}`}
        name={`V_GND_L_${i + 1}`}
        pcbX={mm(-47.5 + dx)}
        pcbY="-6mm"
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
        outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
        connectsTo="net.GND"
      />
    ))}
    {geom.interface.viaXOffsetsMm.map((dy, i) => (
      <via
        key={`T-${i}`}
        name={`V_GND_T_${i + 1}`}
        pcbX="-6mm"
        pcbY={mm(47.5 + dy)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
        outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
        connectsTo="net.GND"
      />
    ))}

    <silkscreenrect pcbX="-47.5mm" pcbY="8mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
    <silkscreenrect pcbX="-47.5mm" pcbY="13mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
    <silkscreenrect pcbX="8mm" pcbY="47.5mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
    <silkscreenrect pcbX="13mm" pcbY="47.5mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />

    <silkscreentext pcbX="-20mm" pcbY="11mm" text="CORNER BRIDGE 5+5cm" fontSize="0.62mm" />
    <silkscreentext pcbX="10mm" pcbY="25mm" pcbRotation={90} text="RF 50R + ID" fontSize="0.50mm" />
  </board>
)
