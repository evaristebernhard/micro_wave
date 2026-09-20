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

// Lower intersection of:
// |J-pIn| = A series quarter-wave seed
// |J-pPatch| = A branch quarter-wave seed
// Recomputed from docs/23 field-aware A target.
const junction = { x: -5.467, y: -25.969 }
const pOut = { x: 20.2, y: -18.0 }
const insetEnd = { x: 0.0, y: patchDerived.notchYMax + 0.2 }

const patchTopHeight = patchDerived.patchYMax - patchDerived.notchYMax
const patchTopCenterY = (patchDerived.patchYMax + patchDerived.notchYMax) / 2
const patchLegWidth = (pcb.patchW - patchDerived.notchW) / 2
const patchLegOffset = (patchDerived.notchW + patchLegWidth) / 2
const patchLegHeight = pcb.insetDepth
const patchLegCenterY = patchDerived.patchYMin + patchLegHeight / 2

const productOutline = [
  { x: -25, y: -35 },
  { x: 25, y: -35 },
  { x: 25, y: 25 },
  { x: -25, y: 25 }
]

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

        {/* Full bottom RF ground, 0.2 mm edge pullback. */}
        <smtpad
          portHints={["pin2"]}
          pcbX="0mm"
          pcbY="-5mm"
          width="49.6mm"
          height="59.6mm"
          shape="rect"
          layer="bottom"
          coveredWithSolderMask={false}
        />
      </footprint>
    }
  />
)

const GroundLaunch = ({ x, suffix }: { x: number; suffix: string }) => (
  <>
    <testpoint
      name={`TP_GND_${suffix}`}
      footprintVariant="pad"
      padShape="rect"
      width={mm(pcb.rfGroundPadW)}
      height={mm(pcb.rfGroundPadH)}
      pcbX={mm(x)}
      pcbY={mm(pcb.tCellGroundPadY)}
      connections={{ pin1: "net.GND" }}
    />
    {[-1.4, -0.5, 0.5, 1.4].map((dx, i) => (
      <via
        key={`${suffix}-${i}`}
        name={`V_GND_${suffix}_${i + 1}`}
        pcbX={mm(x + dx)}
        pcbY={mm(pcb.tCellGroundPadY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />
    ))}
  </>
)

export const TCellCalibrationBoard = () => (
  <board
    title="2.45 GHz T-cell calibration board"
    outline={productOutline}
    material="fr4"
    layers={2}
    thickness="1.6mm"
    routeRemaining={false}
    schematicDisabled
  >
    <net name="GND" />
    <CalibrationRfCopper />
    <GroundLaunch x={-pcb.rfContactX} suffix="IN" />
    <GroundLaunch x={pcb.rfContactX} suffix="OUT" />

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
  productOutline,
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
