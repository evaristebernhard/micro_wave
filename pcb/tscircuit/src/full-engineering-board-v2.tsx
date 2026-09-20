import geom from "../../../design/tcell_candidate_v2.json"

const mm = (value: number) => `${value}mm`
type P = { x: number; y: number }

const linePolygon = (a: P, b: P, width: number): P[] => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len <= 0) throw new Error("zero-length RF segment")
  const nx = (-dy / len) * width / 2
  const ny = (dx / len) * width / 2
  return [
    { x: a.x + nx, y: a.y + ny },
    { x: b.x + nx, y: b.y + ny },
    { x: b.x - nx, y: b.y - ny },
    { x: a.x - nx, y: a.y - ny }
  ]
}

const octagon = (center: P, diameter: number): P[] => {
  const r = diameter / 2
  return Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4
    return { x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) }
  })
}

const xTaper = (
  x0: number,
  x1: number,
  y: number,
  width0: number,
  width1: number
): P[] => [
  { x: x0, y: y + width0 / 2 },
  { x: x1, y: y + width1 / 2 },
  { x: x1, y: y - width1 / 2 },
  { x: x0, y: y - width0 / 2 }
]

const yTaper = (
  x: number,
  y0: number,
  y1: number,
  width0: number,
  width1: number
): P[] => [
  { x: x - width0 / 2, y: y0 },
  { x: x - width1 / 2, y: y1 },
  { x: x + width1 / 2, y: y1 },
  { x: x + width0 / 2, y: y0 }
]

const pIn = geom.tcell.inputReference
const pOut = geom.tcell.outputReference
const pPatch = geom.patch.feedReference
const junction = geom.tcell.junction

const boardBounds = {
  xMin: geom.board.center.x - geom.board.widthMm / 2,
  xMax: geom.board.center.x + geom.board.widthMm / 2,
  yMin: geom.board.center.y - geom.board.heightMm / 2,
  yMax: geom.board.center.y + geom.board.heightMm / 2
} as const

const patchYMin = geom.patch.center.y - geom.patch.lengthMm / 2
const patchYMax = geom.patch.center.y + geom.patch.lengthMm / 2
const notchW = geom.patch.feedWidthMm + 2 * geom.patch.insetGapMm
const notchYMax = patchYMin + geom.patch.insetDepthMm
const patchTopHeight = patchYMax - notchYMax
const patchTopCenterY = (patchYMax + notchYMax) / 2
const patchLegWidth = (geom.patch.widthMm - notchW) / 2
const patchLegOffset = (notchW + patchLegWidth) / 2
const patchLegCenterY = patchYMin + geom.patch.insetDepthMm / 2

// Smooth the narrow branch into the wider inset feed over the first 2 mm.
const feedTaperEndY = pPatch.y + 2.0
const feedEnd = { x: pPatch.x, y: notchYMax + 0.2 }

// The client requirement calls for a 10 kΩ identification resistor.
// The RF design does not use this value; it is a low-frequency count/ID path.
const id = {
  y: -32.0,
  padX: 22.3,
  padW: 4.2,
  padH: 2.2,
  traceW: 0.30,
  resistorOhm: 10000
} as const

const GroundLaunch = ({ x }: { x: number }) => (
  <>
    <smtpad
      portHints={["pin2"]}
      pcbX={mm(x)}
      pcbY={mm(geom.launch.groundPadCenterYMm)}
      width={mm(geom.launch.groundPadWidthMm)}
      height={mm(geom.launch.groundPadHeightMm)}
      shape="rect"
      coveredWithSolderMask={false}
    />
    {geom.launch.viaXOffsetsMm.map((dx, i) => (
      <platedhole
        key={`gnd-${x}-${i}`}
        portHints={["pin2"]}
        pcbX={mm(x + dx)}
        pcbY={mm(geom.launch.groundPadCenterYMm)}
        shape="circle"
        holeDiameter={mm(geom.launch.viaHoleDiameterMm)}
        outerDiameter={mm(geom.launch.viaOuterDiameterMm)}
      />
    ))}
  </>
)

const FullRfFootprint = () => (
  <chip
    name="RF1"
    pcbX={0}
    pcbY={0}
    pinLabels={{ pin1: "RF", pin2: "GND" }}
    connections={{ pin2: "net.GND" }}
    footprint={
      <footprint>
        {/* Magnetic RF signal contacts. */}
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(-geom.launch.contactXAbsMm)}
          pcbY={mm(geom.launch.signalPadCenterYMm)}
          width={mm(geom.launch.signalPadWidthMm)}
          height={mm(geom.launch.signalPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(geom.launch.contactXAbsMm)}
          pcbY={mm(geom.launch.signalPadCenterYMm)}
          width={mm(geom.launch.signalPadWidthMm)}
          height={mm(geom.launch.signalPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        {/* 1 mm overlap tapers avoid a hard pad-to-microstrip step. */}
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={xTaper(
            pIn.x - 1.0,
            pIn.x + 0.05,
            pIn.y,
            geom.launch.signalPadHeightMm,
            geom.tcell.seriesWidthMm
          )}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={xTaper(
            pOut.x - 0.05,
            pOut.x + 1.0,
            pOut.y,
            geom.tcell.through50WidthMm,
            geom.launch.signalPadHeightMm
          )}
          coveredWithSolderMask={false}
        />

        {/* V2 calibrated T-cell. */}
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(pIn, junction, geom.tcell.seriesWidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pOut, geom.tcell.through50WidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pPatch, geom.tcell.branchWidthMm)}
          coveredWithSolderMask={false}
        />

        {/* Octagonal junction reduces the square-corner discontinuity of V1. */}
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={octagon(junction, geom.tcell.junctionNodeSizeMm)}
          coveredWithSolderMask={false}
        />

        {/* Branch-to-inset taper; the quarter-wave branch itself still ends at pPatch. */}
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={yTaper(
            pPatch.x,
            pPatch.y - 0.15,
            feedTaperEndY,
            geom.tcell.branchWidthMm,
            geom.patch.feedWidthMm
          )}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(
            { x: pPatch.x, y: feedTaperEndY - 0.05 },
            feedEnd,
            geom.patch.feedWidthMm
          )}
          coveredWithSolderMask={false}
        />

        {/* Inset-fed rectangular Patch. */}
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(geom.patch.center.x)}
          pcbY={mm(patchTopCenterY)}
          width={mm(geom.patch.widthMm)}
          height={mm(patchTopHeight)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(-patchLegOffset)}
          pcbY={mm(patchLegCenterY)}
          width={mm(patchLegWidth)}
          height={mm(geom.patch.insetDepthMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(patchLegOffset)}
          pcbY={mm(patchLegCenterY)}
          width={mm(patchLegWidth)}
          height={mm(geom.patch.insetDepthMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        <GroundLaunch x={-geom.launch.contactXAbsMm} />
        <GroundLaunch x={geom.launch.contactXAbsMm} />
      </footprint>
    }
  />
)

const IdentificationChain = () => (
  <>
    <testpoint
      name="TP_ID_IN"
      footprintVariant="pad"
      padShape="rect"
      width={mm(id.padW)}
      height={mm(id.padH)}
      pcbX={mm(-id.padX)}
      pcbY={mm(id.y)}
    />

    <resistor
      name="R_ID"
      resistance="10kohm"
      footprint="0603"
      pcbX="0mm"
      pcbY={mm(id.y)}
    />

    <testpoint
      name="TP_ID_OUT"
      footprintVariant="pad"
      padShape="rect"
      width={mm(id.padW)}
      height={mm(id.padH)}
      pcbX={mm(id.padX)}
      pcbY={mm(id.y)}
    />

    <trace
      name="TR_ID_IN"
      from=".TP_ID_IN > .pin1"
      to=".R_ID > .pin1"
      pcbPath={["TP_ID_IN.pin1", "R_ID.pin1"]}
      width={mm(id.traceW)}
    />
    <trace
      name="TR_ID_OUT"
      from=".R_ID > .pin2"
      to=".TP_ID_OUT > .pin1"
      pcbPath={["R_ID.pin2", "TP_ID_OUT.pin1"]}
      width={mm(id.traceW)}
    />
  </>
)

const BoardMarking = () => (
  <>
    <silkscreentext
      pcbX="0mm"
      pcbY="22.1mm"
      text="MW FULL-A V2 / 2.45GHz / WORKPIECE +Z"
      fontSize="0.70mm"
    />
    <silkscreentext
      pcbX="-21.7mm"
      pcbY="-14.8mm"
      text="RF IN"
      fontSize="0.60mm"
    />
    <silkscreentext
      pcbX="21.7mm"
      pcbY="-14.8mm"
      text="RF OUT"
      fontSize="0.60mm"
    />
    <silkscreentext
      pcbX="0mm"
      pcbY="-28.1mm"
      text={`TCELL V2  W50=${geom.tcell.through50WidthMm.toFixed(2)}  WT=${geom.tcell.seriesWidthMm.toFixed(2)}  WB=${geom.tcell.branchWidthMm.toFixed(2)}`}
      fontSize="0.44mm"
    />
    <silkscreentext
      pcbX="-19.5mm"
      pcbY="-34.0mm"
      text="ID IN"
      fontSize="0.48mm"
    />
    <silkscreentext
      pcbX="19.5mm"
      pcbY="-34.0mm"
      text="ID OUT"
      fontSize="0.48mm"
    />
    <silkscreentext
      pcbX="0mm"
      pcbY="-34.0mm"
      text="10k ID"
      fontSize="0.45mm"
    />

    <silkscreenrect
      pcbX={mm(-geom.launch.contactXAbsMm)}
      pcbY="-20.5mm"
      width="5.0mm"
      height="10.0mm"
      filled={false}
      stroke="solid"
      strokeWidth="0.18mm"
    />
    <silkscreenrect
      pcbX={mm(geom.launch.contactXAbsMm)}
      pcbY="-20.5mm"
      width="5.0mm"
      height="10.0mm"
      filled={false}
      stroke="solid"
      strokeWidth="0.18mm"
    />

    <fabricationnotedimension
      from={{ x: boardBounds.xMin, y: boardBounds.yMax - 1 }}
      to={{ x: boardBounds.xMax, y: boardBounds.yMax - 1 }}
      text="50.0 mm"
      fontSize={0.8}
      arrowSize={0.6}
    />
    <fabricationnotedimension
      from={{ x: boardBounds.xMin + 1, y: boardBounds.yMin }}
      to={{ x: boardBounds.xMin + 1, y: boardBounds.yMax }}
      text="60.0 mm"
      fontSize={0.8}
      arrowSize={0.6}
    />
  </>
)

export const FullEngineeringBoardV2 = () => (
  <board
    title="2.45 GHz full engineering board A V2"
    width={mm(geom.board.widthMm)}
    height={mm(geom.board.heightMm)}
    boardAnchorPosition={geom.board.center}
    boardAnchorAlignment="center"
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
      boardEdgeMargin={mm(geom.board.edgeMarginMm)}
      clearance="0.15mm"
    />

    <FullRfFootprint />
    <IdentificationChain />
    <BoardMarking />
  </board>
)

export const fullEngineeringBoardV2Meta = {
  role: "full engineering A-stage board",
  sourceCandidate: "design/tcell_candidate_v2.json",
  boardMm: [geom.board.widthMm, geom.board.heightMm],
  idResistanceOhm: id.resistorOhm,
  rfCopperMask: "exposed",
  status: "screen candidate; not manufacturing freeze"
} as const
