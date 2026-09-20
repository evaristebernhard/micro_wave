import calGeom from "./tcell-calibration-geometry.json"

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

const pIn = calGeom.tcell.inputReference
const junction = calGeom.tcell.junction
const pOut = calGeom.tcell.outputReference
const pPatch = calGeom.patch.feedReference

const patchXMin = calGeom.patch.center.x - calGeom.patch.widthMm / 2
const patchXMax = calGeom.patch.center.x + calGeom.patch.widthMm / 2
const patchYMin = calGeom.patch.center.y - calGeom.patch.lengthMm / 2
const patchYMax = calGeom.patch.center.y + calGeom.patch.lengthMm / 2
const notchW = calGeom.patch.feedWidthMm + 2 * calGeom.patch.insetGapMm
const notchXMin = -notchW / 2
const notchXMax = notchW / 2
const notchYMax = patchYMin + calGeom.patch.insetDepthMm
const insetEnd = { x: pPatch.x, y: notchYMax + 0.2 }

const patchTopHeight = patchYMax - notchYMax
const patchTopCenterY = (patchYMax + notchYMax) / 2
const patchLegWidth = (calGeom.patch.widthMm - notchW) / 2
const patchLegOffset = (notchW + patchLegWidth) / 2
const patchLegHeight = calGeom.patch.insetDepthMm
const patchLegCenterY = patchYMin + patchLegHeight / 2

const productBounds = {
  xMin: calGeom.board.center.x - calGeom.board.widthMm / 2,
  xMax: calGeom.board.center.x + calGeom.board.widthMm / 2,
  yMin: calGeom.board.center.y - calGeom.board.heightMm / 2,
  yMax: calGeom.board.center.y + calGeom.board.heightMm / 2
} as const

const GroundLaunchFootprint = ({ x }: { x: number }) => (
  <>
    <smtpad
      portHints={["pin2"]}
      pcbX={mm(x)}
      pcbY={mm(calGeom.launch.groundPadCenterYMm)}
      width={mm(calGeom.launch.groundPadWidthMm)}
      height={mm(calGeom.launch.groundPadHeightMm)}
      shape="rect"
      coveredWithSolderMask={false}
    />
    {calGeom.launch.viaXOffsetsMm.map((dx, i) => (
      <platedhole
        key={`gnd-${x}-${i}`}
        portHints={["pin2"]}
        pcbX={mm(x + dx)}
        pcbY={mm(calGeom.launch.groundPadCenterYMm)}
        shape="circle"
        holeDiameter={mm(calGeom.launch.viaHoleDiameterMm)}
        outerDiameter={mm(calGeom.launch.viaOuterDiameterMm)}
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
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(-calGeom.launch.contactXAbsMm)}
          pcbY={mm(calGeom.launch.signalPadCenterYMm)}
          width={mm(calGeom.launch.signalPadWidthMm)}
          height={mm(calGeom.launch.signalPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(calGeom.launch.contactXAbsMm)}
          pcbY={mm(calGeom.launch.signalPadCenterYMm)}
          width={mm(calGeom.launch.signalPadWidthMm)}
          height={mm(calGeom.launch.signalPadHeightMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(pIn, junction, calGeom.tcell.seriesWidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pOut, calGeom.tcell.through50WidthMm)}
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(junction, pPatch, calGeom.tcell.branchWidthMm)}
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          pcbX={mm(junction.x)}
          pcbY={mm(junction.y)}
          width={mm(calGeom.tcell.junctionNodeSizeMm)}
          height={mm(calGeom.tcell.junctionNodeSizeMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />
        <smtpad
          portHints={["pin1"]}
          pcbX={mm(pPatch.x)}
          pcbY={mm(pPatch.y)}
          width={mm(calGeom.patch.feedNodeSizeMm)}
          height={mm(calGeom.patch.feedNodeSizeMm)}
          shape="rect"
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          shape="polygon"
          points={linePolygon(pPatch, insetEnd, calGeom.patch.feedWidthMm)}
          coveredWithSolderMask={false}
        />

        <smtpad
          portHints={["pin1"]}
          pcbX={mm(calGeom.patch.center.x)}
          pcbY={mm(patchTopCenterY)}
          width={mm(calGeom.patch.widthMm)}
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

        <GroundLaunchFootprint x={-calGeom.launch.contactXAbsMm} />
        <GroundLaunchFootprint x={calGeom.launch.contactXAbsMm} />
      </footprint>
    }
  />
)

export const TCellCalibrationBoard = () => (
  <board
    title="2.45 GHz T-cell calibration board"
    width={mm(calGeom.board.widthMm)}
    height={mm(calGeom.board.heightMm)}
    boardAnchorPosition={calGeom.board.center}
    boardAnchorAlignment="center"
    material="fr4"
    layers={2}
    thickness={mm(calGeom.stackup.fr4ThicknessMm)}
    routeRemaining={false}
    schematicDisabled
  >
    <net name="GND" />

    <copperpour
      name="GND_PLANE"
      connectsTo="net.GND"
      layer="bottom"
      boardEdgeMargin={mm(calGeom.board.edgeMarginMm)}
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
      text={`k=${(100 * calGeom.tcell.targetExtraction).toFixed(2)}%  Zt=${calGeom.tcell.targetSeriesOhm.toFixed(2)}R  Zb=${calGeom.tcell.targetBranchOhm.toFixed(2)}R`}
      fontSize="0.52mm"
    />
    <silkscreentext
      pcbX="0mm"
      pcbY="-33.0mm"
      text="RF TOP COPPER: NO MASK / CALIBRATION ONLY"
      fontSize="0.45mm"
    />

    <fabricationnotedimension
      from={{ x: productBounds.xMin, y: productBounds.yMax - 1 }}
      to={{ x: productBounds.xMax, y: productBounds.yMax - 1 }}
      text={`${calGeom.board.widthMm.toFixed(1)} mm`}
      fontSize={0.8}
      arrowSize={0.6}
    />
    <fabricationnotedimension
      from={{ x: productBounds.xMin + 1, y: productBounds.yMin }}
      to={{ x: productBounds.xMin + 1, y: productBounds.yMax }}
      text={`${calGeom.board.heightMm.toFixed(1)} mm`}
      fontSize={0.8}
      arrowSize={0.6}
    />
  </board>
)

export const calibrationGeometry = {
  schema: calGeom.schema,
  frequencyGHz: calGeom.frequencyGHz,
  boardCenter: calGeom.board.center,
  productBounds,
  inputReference: pIn,
  outputReference: pOut,
  patchReference: pPatch,
  junction,
  targetExtraction: calGeom.tcell.targetExtraction,
  targetSeriesOhm: calGeom.tcell.targetSeriesOhm,
  targetBranchOhm: calGeom.tcell.targetBranchOhm,
  seriesWidthMm: calGeom.tcell.seriesWidthMm,
  branchWidthMm: calGeom.tcell.branchWidthMm,
  seriesQuarterWaveMm: calGeom.tcell.targetSeriesQuarterWaveMm,
  branchQuarterWaveMm: calGeom.tcell.targetBranchQuarterWaveMm
} as const
