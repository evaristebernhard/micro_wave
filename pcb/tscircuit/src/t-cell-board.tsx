import {
  matchedExtractionTCellSeed,
  patchDerived,
  pcb,
  type BoardClass
} from "./geometry"
import { tCellRfPolygonPoints, tCellVariantMeta } from "./tcell-geometry"

const mm = (value: number) => `${value}mm`

type VariantProps = {
  boardClass: BoardClass
}

const TCellRfGeometry = ({ boardClass }: VariantProps) => {
  const meta = tCellVariantMeta[boardClass]
  const patchTopHeight = patchDerived.patchYMax - patchDerived.notchYMax
  const patchTopCenterY =
    (patchDerived.patchYMax + patchDerived.notchYMax) / 2
  const patchLegWidth = (pcb.patchW - patchDerived.notchW) / 2
  const patchLegCenterOffset = (patchDerived.notchW + patchLegWidth) / 2
  const patchLegHeight = pcb.insetDepth
  const patchLegCenterY = patchDerived.patchYMin + patchLegHeight / 2

  return (
    <chip
      name="ANT1"
      pcbX={0}
      pcbY={0}
      pinLabels={{
        pin1: boardClass === "D" ? "RF_IN_PATCH" : "RF_TCELL_PATCH",
        pin3: "GND"
      }}
      connections={{ pin3: "net.GND" }}
      footprint={
        <footprint>
          {/*
           * One continuous top-copper polygon contains the input lead,
           * impedance transformer(s), T junction, through tail, Patch branch
           * and inset feed.  This avoids the disconnected-pad ambiguity that
           * appears when microwave transmission lines are approximated by many
           * touching SMT pads.
           */}
          <smtpad
            portHints={["pin1"]}
            shape="polygon"
            points={tCellRfPolygonPoints[boardClass]}
          />

          {/* Magnetic RF signal contact(s). */}
          <smtpad
            portHints={["pin1"]}
            pcbX={mm(-pcb.rfContactX)}
            pcbY={mm(pcb.rfTraceY)}
            width={mm(pcb.rfPadW)}
            height={mm(pcb.rfPadH)}
            shape="rect"
          />
          {meta.hasRfOut && (
            <smtpad
              portHints={["pin1"]}
              pcbX={mm(pcb.rfContactX)}
              pcbY={mm(pcb.rfTraceY)}
              width={mm(pcb.rfPadW)}
              height={mm(pcb.rfPadH)}
              shape="rect"
            />
          )}

          {/* Patch upper body. */}
          <smtpad
            portHints={["pin1"]}
            pcbX={mm(pcb.patchCenterX)}
            pcbY={mm(patchTopCenterY)}
            width={mm(pcb.patchW)}
            height={mm(patchTopHeight)}
            shape="rect"
          />

          {/* Patch lower legs around the common inset corridor. */}
          <smtpad
            portHints={["pin1"]}
            pcbX={mm(-patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />
          <smtpad
            portHints={["pin1"]}
            pcbX={mm(patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />

          {/* Extended bottom ground plane follows the 50 x 60 mm board. */}
          <smtpad
            portHints={["pin3"]}
            pcbX="0mm"
            pcbY={mm(pcb.boardCenterY)}
            width={mm(pcb.boardW - 0.4)}
            height={mm(pcb.boardH - 0.4)}
            shape="rect"
            layer="bottom"
          />
        </footprint>
      }
    />
  )
}

const TCellGroundContacts = ({ boardClass }: VariantProps) => {
  const meta = tCellVariantMeta[boardClass]
  const x = pcb.rfContactX
  const dx = 0.70
  const groundPadW = pcb.rfPadW

  return (
    <>
      <testpoint
        name="TP_RF_GND_IN"
        footprintVariant="pad"
        padShape="rect"
        width={mm(groundPadW)}
        height={mm(pcb.rfGroundPadH)}
        pcbX={mm(-x)}
        pcbY={mm(pcb.rfGroundPadY)}
        connections={{ pin1: "net.GND" }}
      />
      <via
        name="V_GND_L1"
        pcbX={mm(-x - dx)}
        pcbY={mm(pcb.rfGroundPadY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />
      <via
        name="V_GND_L2"
        pcbX={mm(-x + dx)}
        pcbY={mm(pcb.rfGroundPadY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />

      {meta.hasRfOut && (
        <>
          <testpoint
            name="TP_RF_GND_OUT"
            footprintVariant="pad"
            padShape="rect"
            width={mm(groundPadW)}
            height={mm(pcb.rfGroundPadH)}
            pcbX={mm(x)}
            pcbY={mm(pcb.rfGroundPadY)}
            connections={{ pin1: "net.GND" }}
          />
          <via
            name="V_GND_R1"
            pcbX={mm(x - dx)}
            pcbY={mm(pcb.rfGroundPadY)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter={mm(pcb.rfGroundViaHole)}
            outerDiameter={mm(pcb.rfGroundViaOuter)}
            connectsTo="net.GND"
          />
          <via
            name="V_GND_R2"
            pcbX={mm(x + dx)}
            pcbY={mm(pcb.rfGroundPadY)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter={mm(pcb.rfGroundViaHole)}
            outerDiameter={mm(pcb.rfGroundViaOuter)}
            connectsTo="net.GND"
          />
        </>
      )}
    </>
  )
}

const TCellIdChain = () => (
  <>
    <testpoint
      name="TP_ID_IN"
      footprintVariant="pad"
      padShape="rect"
      width={mm(pcb.idPadW)}
      height={mm(pcb.idPadH)}
      pcbX={mm(-pcb.idPadX)}
      pcbY={mm(pcb.idTraceY)}
    />
    <resistor
      name="R_ID"
      resistance="100ohm"
      footprint="0603"
      pcbX="0mm"
      pcbY={mm(pcb.idTraceY)}
    />
    <testpoint
      name="TP_ID_OUT"
      footprintVariant="pad"
      padShape="rect"
      width={mm(pcb.idPadW)}
      height={mm(pcb.idPadH)}
      pcbX={mm(pcb.idPadX)}
      pcbY={mm(pcb.idTraceY)}
    />
    <trace
      name="TR_ID_IN"
      from=".TP_ID_IN > .pin1"
      to=".R_ID > .pin1"
      pcbPath={["TP_ID_IN.pin1", "R_ID.pin1"]}
      width={mm(pcb.idTraceW)}
    />
    <trace
      name="TR_ID_OUT"
      from=".R_ID > .pin2"
      to=".TP_ID_OUT > .pin1"
      pcbPath={["R_ID.pin2", "TP_ID_OUT.pin1"]}
      width={mm(pcb.idTraceW)}
    />
  </>
)

const TCellSilkscreen = ({ boardClass }: VariantProps) => {
  const meta = tCellVariantMeta[boardClass]
  const label =
    boardClass === "D"
      ? "T-CELL TERMINAL / HALF-WAVE FEED"
      : `T-CELL ${(100 * meta.k).toFixed(1)}% EXTRACTION`

  return (
    <>
      <silkscreentext
        pcbX="0mm"
        pcbY="22.3mm"
        text={`2.45 GHz PATCH ${boardClass} / WORKPIECE +Z`}
        fontSize="0.75mm"
      />
      <silkscreentext
        pcbX="0mm"
        pcbY="-27.8mm"
        text={label}
        fontSize="0.55mm"
      />
      <silkscreentext
        pcbX="-21mm"
        pcbY="-10.2mm"
        text="RF IN"
        fontSize="0.7mm"
      />
      {meta.hasRfOut && (
        <silkscreentext
          pcbX="21mm"
          pcbY="-10.2mm"
          text="RF OUT"
          fontSize="0.7mm"
        />
      )}
      <silkscreentext
        pcbX="0mm"
        pcbY="-30.0mm"
        text={
          boardClass === "D"
            ? `L≈${matchedExtractionTCellSeed.terminalD.preInsetHalfWaveMm.toFixed(2)}mm`
            : `BRIDGE≈${meta.bridgePhaseDeg.toFixed(2)}deg`
        }
        fontSize="0.5mm"
      />
    </>
  )
}

export const MatchedTCellBoard = ({ boardClass }: VariantProps) => (
  <board
    width={mm(pcb.boardW)}
    height={mm(pcb.boardH)}
    center_x={0}
    center_y={pcb.boardCenterY}
    routingDisabled
  >
    <net name="GND" />
    <TCellRfGeometry boardClass={boardClass} />
    <TCellGroundContacts boardClass={boardClass} />
    <TCellIdChain />
    <TCellSilkscreen boardClass={boardClass} />
  </board>
)

export const TCellBoardA = () => <MatchedTCellBoard boardClass="A" />
export const TCellBoardB = () => <MatchedTCellBoard boardClass="B" />
export const TCellBoardC = () => <MatchedTCellBoard boardClass="C" />
export const TCellBoardD = () => <MatchedTCellBoard boardClass="D" />
