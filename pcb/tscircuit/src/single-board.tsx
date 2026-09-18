import {
  boardVariants,
  getVariantDerived,
  patchDerived,
  pcb,
  terminalPhaseRoutePolygonPoints,
  terminalPhaseRouteSeed,
  type BoardClass
} from "./geometry"

const mm = (value: number) => `${value}mm`

type VariantProps = {
  boardClass: BoardClass
}

/**
 * Parameterized presentation/engineering seed for the 50 mm x 60 mm
 * extended-height gradient-coupled Patch boards.
 *
 * The original RF/Patch coordinates are preserved. The extra 10 mm grows
 * downward only, so the 50 mm horizontal Patch pitch is unchanged.
 *
 * A/B/C are through boards with quarter-wave-scale coupling sections.
 * D is a terminal radiator and deliberately has no RF OUT.
 *
 * These are HFSS/openEMS seeds. Coupling gaps are search starting points,
 * not validated final dimensions.
 */
const RfGeometry = ({ boardClass }: VariantProps) => {
  const variant = boardVariants[boardClass]
  const derived = getVariantDerived(boardClass)

  const patchTopHeight = patchDerived.patchYMax - patchDerived.notchYMax
  const patchTopCenterY =
    (patchDerived.patchYMax + patchDerived.notchYMax) / 2

  const patchLegWidth = (pcb.patchW - patchDerived.notchW) / 2
  const patchLegCenterOffset = (patchDerived.notchW + patchLegWidth) / 2
  const patchLegHeight = pcb.insetDepth
  const patchLegCenterY = patchDerived.patchYMin + patchLegHeight / 2

  const patchPortHint = boardClass === "D" ? "pin1" : "pin2"
  const insetFeedCenterY =
    (patchDerived.patchYMin + patchDerived.notchYMax) / 2

  return (
    <chip
      name="ANT1"
      pcbX={0}
      pcbY={0}
      pinLabels={
        boardClass === "D"
          ? {
              pin1: "RF_IN_PATCH",
              pin3: "GND"
            }
          : {
              pin1: "RF_THROUGH",
              pin2: "PATCH",
              pin3: "GND"
            }
      }
      connections={
        boardClass === "D"
          ? {
              pin3: "net.GND"
            }
          : {
              pin2: "net.COUPLED",
              pin3: "net.GND"
            }
      }
      footprint={
        <footprint>
          {boardClass === "D" ? (
            <>
              {/*
               * One contiguous polygon implements the analytical D phase route:
               * horizontal -> diagonal -> inset. This is the Gerber-like copper
               * representation of the ~35.34 mm centerline seed.
               */}
              <smtpad
                portHints={["pin1"]}
                shape="polygon"
                points={terminalPhaseRoutePolygonPoints}
              />
              <smtpad
                portHints={["pin1"]}
                pcbX={mm(-pcb.rfContactX)}
                pcbY={mm(pcb.rfTraceY)}
                width={mm(pcb.rfPadW)}
                height={mm(pcb.rfPadH)}
                shape="rect"
              />
            </>
          ) : (            <>
              {/* 50 ohm through-line seed. */}
              <smtpad
                portHints={["pin1"]}
                pcbX="0mm"
                pcbY={mm(pcb.rfTraceY)}
                width="49.6mm"
                height={mm(pcb.rfTraceW)}
                shape="rect"
              />

              {/* Left / right magnetic RF signal contact placeholders. */}
              <smtpad
                portHints={["pin1"]}
                pcbX={mm(-pcb.rfContactX)}
                pcbY={mm(pcb.rfTraceY)}
                width={mm(pcb.rfPadW)}
                height={mm(pcb.rfPadH)}
                shape="rect"
              />
              <smtpad
                portHints={["pin1"]}
                pcbX={mm(pcb.rfContactX)}
                pcbY={mm(pcb.rfTraceY)}
                width={mm(pcb.rfPadW)}
                height={mm(pcb.rfPadH)}
                shape="rect"
              />

              {/*
               * Quarter-wave-scale coupling seed. The line terminates at x=0
               * where it feeds the centered Patch inset. The left endpoint is
               * the isolated-end calibration reference.
               */}
              <smtpad
                portHints={["pin2"]}
                pcbX={mm(derived.coupledTraceCenterX)}
                pcbY={mm(derived.coupledTraceY)}
                width={mm(variant.couplingLengthSeed)}
                height={mm(pcb.rfTraceW)}
                shape="rect"
              />

              {/* The isolated-end termination is attached by TP_ISO_TAP below. */}
            </>
          )}

          {/* Patch feed / analytical phase-trim section. */}
          {boardClass === "D" ? null : derived.branchPhaseTrimLengthSeed === 0 ? (
            <smtpad
              portHints={[patchPortHint]}
              pcbX="0mm"
              pcbY={mm(
                (derived.phaseFeedStartY + patchDerived.notchYMax) / 2
              )}
              width={mm(pcb.rfTraceW)}
              height={mm(patchDerived.notchYMax - derived.phaseFeedStartY)}
              shape="rect"
            />
          ) : (
            <smtpad
              portHints={[patchPortHint]}
              shape="polygon"
              points={derived.phaseFeedPolygonPoints}
            />
          )}

          {/* Patch upper body. */}
          <smtpad
            portHints={[patchPortHint]}
            pcbX={mm(pcb.patchCenterX)}
            pcbY={mm(patchTopCenterY)}
            width={mm(pcb.patchW)}
            height={mm(patchTopHeight)}
            shape="rect"
          />

          {/* Patch lower legs around the inset feed. */}
          <smtpad
            portHints={[patchPortHint]}
            pcbX={mm(-patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />
          <smtpad
            portHints={[patchPortHint]}
            pcbX={mm(patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />

          {/* Nearly full continuous bottom RF ground plane. */}
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

const GroundReturnVias = ({ boardClass }: VariantProps) => {
  const variant = boardVariants[boardClass]
  const leftX = -pcb.rfContactX
  const rightX = pcb.rfContactX
  const dx = pcb.rfGroundViaOffsetX

  return (
    <>
      <via
        name="V_GND_L1"
        pcbX={mm(leftX - dx)}
        pcbY={mm(pcb.rfGroundPadY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />
      <via
        name="V_GND_L2"
        pcbX={mm(leftX + dx)}
        pcbY={mm(pcb.rfGroundPadY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />

      {variant.hasRfOut && (
        <>
          <via
            name="V_GND_R1"
            pcbX={mm(rightX - dx)}
            pcbY={mm(pcb.rfGroundPadY)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter={mm(pcb.rfGroundViaHole)}
            outerDiameter={mm(pcb.rfGroundViaOuter)}
            connectsTo="net.GND"
          />
          <via
            name="V_GND_R2"
            pcbX={mm(rightX + dx)}
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

const GroundContactPads = ({ boardClass }: VariantProps) => {
  const variant = boardVariants[boardClass]
  return (
    <>
      <testpoint
        name="TP_RF_GND_IN"
        footprintVariant="pad"
        padShape="rect"
        width={mm(pcb.rfGroundPadW)}
        height={mm(pcb.rfGroundPadH)}
        pcbX={mm(-pcb.rfContactX)}
        pcbY={mm(pcb.rfGroundPadY)}
        connections={{ pin1: "net.GND" }}
      />
      {variant.hasRfOut && (
        <testpoint
          name="TP_RF_GND_OUT"
          footprintVariant="pad"
          padShape="rect"
          width={mm(pcb.rfGroundPadW)}
          height={mm(pcb.rfGroundPadH)}
          pcbX={mm(pcb.rfContactX)}
          pcbY={mm(pcb.rfGroundPadY)}
          connections={{ pin1: "net.GND" }}
        />
      )}
    </>
  )
}

const IsolationTermination = ({ boardClass }: VariantProps) => {
  const variant = boardVariants[boardClass]
  if (!variant.needsIsolationTermination) return null

  const derived = getVariantDerived(boardClass)
  const x = derived.coupledTraceXMin
  const resistorY = -11.4
  const groundX = x - 2.4

  return (
    <>
      <testpoint
        name="TP_ISO_TAP"
        footprintVariant="pad"
        padShape="rect"
        width={mm(pcb.isoPadW)}
        height={mm(pcb.isoPadH)}
        pcbX={mm(derived.coupledTraceXMin)}
        pcbY={mm(derived.coupledTraceY)}
        connections={{ pin1: "net.COUPLED" }}
      />

      <resistor
        name="R_ISO"
        resistance="50ohm"
        footprint="0603"
        pcbX={mm(x)}
        pcbY={mm(resistorY)}
        connections={{
          pin1: "net.COUPLED",
          pin2: "net.GND"
        }}
      />

      <testpoint
        name="TP_ISO_GND"
        footprintVariant="pad"
        padShape="rect"
        width="1.6mm"
        height="1.6mm"
        pcbX={mm(groundX)}
        pcbY={mm(resistorY)}
        connections={{ pin1: "net.GND" }}
      />

      <trace
        name="TR_ISO_COUPLED"
        from=".TP_ISO_TAP > .pin1"
        to=".R_ISO > .pin1"
        pcbPath={["TP_ISO_TAP.pin1", "R_ISO.pin1"]}
        width="0.5mm"
      />
      <trace
        name="TR_ISO_GND"
        from=".R_ISO > .pin2"
        to=".TP_ISO_GND > .pin1"
        pcbPath={["R_ISO.pin2", "TP_ISO_GND.pin1"]}
        width="0.5mm"
      />

      <via
        name="V_ISO_GND"
        pcbX={mm(groundX)}
        pcbY={mm(resistorY)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(pcb.rfGroundViaHole)}
        outerDiameter={mm(pcb.rfGroundViaOuter)}
        connectsTo="net.GND"
      />
    </>
  )
}

const IdChain = () => (
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

const PresentationSilkscreen = ({ boardClass }: VariantProps) => {
  const variant = boardVariants[boardClass]
  const couplingLabel =
    variant.targetCouplingDb === null
      ? "TERMINAL MATCHED PATCH"
      : `${variant.targetCouplingDb.toFixed(1)} dB COUPLER HFSS SEED`

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
        pcbY="-5.5mm"
        text={couplingLabel}
        fontSize="0.55mm"
      />
      <silkscreentext
        pcbX="-21.5mm"
        pcbY="-10.2mm"
        text="RF IN"
        fontSize="0.75mm"
      />
      {variant.hasRfOut && (
        <silkscreentext
          pcbX="21.5mm"
          pcbY="-10.2mm"
          text="RF OUT"
          fontSize="0.75mm"
        />
      )}
      {!variant.hasRfOut && (
        <silkscreentext
          pcbX="18mm"
          pcbY="-18mm"
          text="NO RF OUT"
          fontSize="0.65mm"
        />
      )}

      {variant.needsIsolationTermination && (
        <silkscreentext
          pcbX="-17mm"
          pcbY="-9.7mm"
          text="ISO 50R"
          fontSize="0.55mm"
        />
      )}

      <silkscreentext
        pcbX="-20.5mm"
        pcbY="-33.2mm"
        text="ID IN"
        fontSize="0.65mm"
      />
      <silkscreentext
        pcbX="20.5mm"
        pcbY="-33.2mm"
        text="ID OUT"
        fontSize="0.65mm"
      />

      <silkscreenrect
        pcbX={mm(-pcb.rfContactX)}
        pcbY="-16.0mm"
        width={mm(pcb.magneticOutlineW)}
        height={mm(pcb.magneticOutlineH)}
        filled={false}
        stroke="solid"
        strokeWidth="0.2mm"
      />
      {variant.hasRfOut && (
        <silkscreenrect
          pcbX={mm(pcb.rfContactX)}
          pcbY="-16.0mm"
          width={mm(pcb.magneticOutlineW)}
          height={mm(pcb.magneticOutlineH)}
          filled={false}
          stroke="solid"
          strokeWidth="0.2mm"
        />
      )}
    </>
  )
}

export const GradientPatchBoard = ({ boardClass }: VariantProps) => (
  <board
    width={mm(pcb.boardW)}
    height={mm(pcb.boardH)}
    center_x={0}
    center_y={pcb.boardCenterY}
    routingDisabled
  >
    <net name="GND" />
    <net name="COUPLED" />

    <RfGeometry boardClass={boardClass} />
    <GroundContactPads boardClass={boardClass} />
    <GroundReturnVias boardClass={boardClass} />
    <IsolationTermination boardClass={boardClass} />
    <IdChain />
    <PresentationSilkscreen boardClass={boardClass} />
  </board>
)

export const BoardA = () => <GradientPatchBoard boardClass="A" />
export const BoardB = () => <GradientPatchBoard boardClass="B" />
export const BoardC = () => <GradientPatchBoard boardClass="C" />
export const BoardD = () => <GradientPatchBoard boardClass="D" />

// Backward-compatible default used by the historical index.tsx.
export const SingleBoard = BoardA
