import { fewModeRobustDesignSeed, matchedExtractionTCellSeed, patchDerived, pcb } from "./geometry"

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

const cal = fewModeRobustDesignSeed.targetExtraction.A
const pIn = { x: -20.2, y: -18.0 }
const pPatch = { x: 0.0, y: -9.25 }

// Field-aware A calibration junction.
// Distances:
// |J-pIn|    ~= 16.75 mm  (series quarter-wave seed)
// |J-pPatch| ~= 17.59 mm  (branch quarter-wave seed)
const junction = { x: -5.467, y: -25.969 }
const pOut = { x: 20.2, y: -18.0 }
const insetEnd = { x: 0.0, y: patchDerived.notchYMax + 0.2 }

const boardCenter = { x: 0, y: -5 }
const productBounds = {
  xMin: -25,
  xMax: 25,
  yMin: -35,
  yMax: 25
} as const

const patchTopHeight = patchDerived.patchYMax - patchDerived.notchYMax
const patchTopCenterY = (patchDerived.patchYMax + patchDerived.notchYMax) / 2
const patchLegWidth = (pcb.patchW - patchDerived.notchW) / 2
const patchLegOffset = (patchDerived.notchW + patchLegWidth) / 2
const patchLegHeight = pcb.insetDepth
const patchLegCenterY = patchDerived.patchYMin + patchLegHeight / 2

const GroundLaunchFootprint = ({ x }: { x: number }) => (
  <>
    <smtpad
      portHints={["pin2"]}
      pcbX={mm(x)}
      pcbY={mm(pcb.tCellGroundPadY)}
      width={mm(pcb.rfGroundPadW)}
      height={mm(pcb.rfGroundPadH)}
      shape="rect"
      coveredWithSolderMask={false}
    />
    {[-1.4, -0.5, 0.5, 1.4].map((dx, i) => (
      <platedhole
        key={`gnd-${x}-${i}`}
        portHints={["pin2"]}
        pcbX={mm(x + dx)}
        pcbY={mm(pcb.tCellGroundPadY)}
        shape="circle"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
      />
    ))}
  </>
)

const CalibrationRfCopper = () => (
  <chip
    name="RF_CAL"
    pcbX={0}
    pcbY={0}
    pinLabels={{ pin1: "RF", pin2: "GND" }}
    connections={{ pin2: "net.GND" }}
    footprint={
      <footprint>
        {/* RF input/output magnetic signal pads. */}
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(-pcb.rfContactX)}
          pcbY={mm(pcb.rfTraceY)}
          width={mm(pcb.rfPadW)}
          height={mm(pcb.rfPadH)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(pcb.rfContactX)}
          pcbY={mm(pcb.rfTraceY)}
          width={mm(pcb.rfPadW)}
          height={mm(pcb.rfPadH)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        {/* Field-aware A calibration T-cell. */}
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(pIn, junction, cal.bareFr4SeriesWidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pOut, matchedExtractionTCellSeed.fiftyOhmWidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pPatch, cal.bareFr4BranchWidthMm)}
          coveredWithSolderMask={false}
        />

        {/*
         * Explicit copper nodes guarantee area overlap between separately
         * stroked transformer polygons. Netlist/shorts checks do not prove
         * same-net polygons are physically joined in the rendered Gerber.
         */}
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(junction.x)}
          pcbY={mm(junction.y)}
          width="2.2mm"
          height="2.2mm"
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(pPatch.x)}
          pcbY={mm(pPatch.y)}
          width="1.6mm"
          height="1.6mm"
          shape="rect"
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(pPatch, insetEnd, pcb.rfTraceW)}
          coveredWithSolderMask={false}
        />

        {/* Rectangular inset-fed Patch. */}
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(pcb.patchCenterX)}
          pcbY={mm(patchTopCenterY)}
          width={mm(pcb.patchW)}
          height={mm(patchTopHeight)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(-patchLegOffset)}
          pcbY={mm(patchLegCenterY)}
          width={mm(patchLegWidth)}
          height={mm(patchLegHeight)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(patchLegOffset)}
          pcbY={mm(patchLegCenterY)}
          width={mm(patchLegWidth)}
          height={mm(patchLegHeight)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        {/*
         * Launch return pads and plated holes belong to the same distributed
         * RF footprint. This prevents placement DRC from treating intentional
         * launch geometry as overlapping independent components.
         */}
        <GroundLaunchFootprint x={-pcb.rfContactX} />
        <GroundLaunchFootprint x={pcb.rfContactX} />
      </footprint>
    }
  />
)

export const TCellCalibrationBoard = () => (
  <board
    title="2.45 GHz T-cell calibration board"
    width="50mm"
    height="60mm"
    boardAnchorPosition={boardCenter}
    boardAnchorAlignment="center"
    material="fr4"
    layers={2}
    thickness="1.6mm"
    routeRemaining={false}
    schematicDisabled
  >
    <net name="GND" />

    {/* Board-level return plane: not a component footprint. */}
    <copperpour
      name="GND_PLANE"
      connectsTo="net.GND"
      layer="bottom"
      boardEdgeMargin="0.2mm"
      clearance="0.15mm"
    />

    <CalibrationRfCopper />

    <silkscreentext
      pcbX="0mm"
      pcbY="22.0mm"
      text="TCAL 2.45GHz / FIELD-A"
      fontSize="0.8mm"
    />
    <silkscreentext
      pcbX="0mm"
      pcbY="-31.8mm"
      text={`k=${(100 * cal.k).toFixed(2)}%  Zt=${cal.seriesTransformerOhm.toFixed(2)}R  Zb=${cal.branchTransformerOhm.toFixed(2)}R`}
      fontSize="0.52mm"
    />
    <silkscreentext
      pcbX="0mm"
      pcbY="-33.0mm"
      text="RF TOP COPPER: NO MASK / CALIBRATION ONLY"
      fontSize="0.45mm"
    />

    <fabricationnotedimension
      from={{ x: -25, y: 24 }}
      to={{ x: 25, y: 24 }}
      text="50.0 mm"
      fontSize={0.8}
      arrowSize={0.6}
    />
    <fabricationnotedimension
      from={{ x: -24, y: -35 }}
      to={{ x: -24, y: 25 }}
      text="60.0 mm"
      fontSize={0.8}
      arrowSize={0.6}
    />
  </board>
)

export const calibrationGeometry = {
  boardCenter,
  productBounds,
  inputReference: pIn,
  outputReference: pOut,
  patchReference: pPatch,
  junction,
  targetExtraction: cal.k,
  targetSeriesOhm: cal.seriesTransformerOhm,
  targetBranchOhm: cal.branchTransformerOhm,
  seriesWidthMm: cal.bareFr4SeriesWidthMm,
  branchWidthMm: cal.bareFr4BranchWidthMm,
  seriesQuarterWaveMm: cal.bareFr4SeriesQuarterWaveMm,
  branchQuarterWaveMm: cal.bareFr4BranchQuarterWaveMm
} as const
