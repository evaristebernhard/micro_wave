import { derived, pcb } from "./geometry"

const mm = (value: number) => `${value}mm`

/**
 * Presentation/engineering seed for the 50 mm x 50 mm magnetic patch board.
 *
 * Critical microwave geometry stays as fixed copper inside ANT1 so the
 * autorouter cannot change the RF dimensions.
 *
 * pin1 = THROUGH RF bus
 * pin2 = PATCH branch
 * pin3 = RF ground
 */
const RfGeometry = () => {
  const patchTopHeight = derived.patchYMax - derived.notchYMax
  const patchTopCenterY = (derived.patchYMax + derived.notchYMax) / 2

  const patchLegWidth = (pcb.patchW - derived.notchW) / 2
  const patchLegCenterOffset = (derived.notchW + patchLegWidth) / 2
  const patchLegHeight = pcb.insetDepth
  const patchLegCenterY = derived.patchYMin + patchLegHeight / 2

  const feedYMin = derived.coupledTraceY + pcb.rfTraceW / 2
  const feedYMax = derived.notchYMax
  const feedHeight = feedYMax - feedYMin
  const feedCenterY = (feedYMax + feedYMin) / 2

  return (
    <chip
      name="ANT1"
      pcbX={0}
      pcbY={0}
      pinLabels={{
        pin1: "RF_THROUGH",
        pin2: "PATCH",
        pin3: "GND"
      }}
      connections={{
        pin3: "net.GND"
      }}
      footprint={
        <footprint>
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

          {/* Dedicated top-side RF ground-return contact areas. */}
          <smtpad
            portHints={["pin3"]}
            pcbX={mm(-pcb.rfContactX)}
            pcbY={mm(pcb.rfGroundPadY)}
            width={mm(pcb.rfGroundPadW)}
            height={mm(pcb.rfGroundPadH)}
            shape="rect"
          />
          <smtpad
            portHints={["pin3"]}
            pcbX={mm(pcb.rfContactX)}
            pcbY={mm(pcb.rfGroundPadY)}
            width={mm(pcb.rfGroundPadW)}
            height={mm(pcb.rfGroundPadH)}
            shape="rect"
          />

          {/* Parallel weak-coupling line. */}
          <smtpad
            portHints={["pin2"]}
            pcbX="0mm"
            pcbY={mm(derived.coupledTraceY)}
            width={mm(pcb.couplingLength)}
            height={mm(pcb.rfTraceW)}
            shape="rect"
          />

          {/* Vertical patch feed inside the inset notch. */}
          <smtpad
            portHints={["pin2"]}
            pcbX="0mm"
            pcbY={mm(feedCenterY)}
            width={mm(pcb.rfTraceW)}
            height={mm(feedHeight)}
            shape="rect"
          />

          {/* Patch upper body. */}
          <smtpad
            portHints={["pin2"]}
            pcbX={mm(pcb.patchCenterX)}
            pcbY={mm(patchTopCenterY)}
            width={mm(pcb.patchW)}
            height={mm(patchTopHeight)}
            shape="rect"
          />

          {/* Patch lower legs around the inset feed. */}
          <smtpad
            portHints={["pin2"]}
            pcbX={mm(-patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />
          <smtpad
            portHints={["pin2"]}
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
            pcbY="0mm"
            width="49.6mm"
            height="49.6mm"
            shape="rect"
            layer="bottom"
          />
        </footprint>
      }
    />
  )
}

const GroundReturnVias = () => {
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
  )
}

const IdChain = () => (
  <>
    <testpoint
      name="ID_IN"
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
      name="ID_OUT"
      footprintVariant="pad"
      padShape="rect"
      width={mm(pcb.idPadW)}
      height={mm(pcb.idPadH)}
      pcbX={mm(pcb.idPadX)}
      pcbY={mm(pcb.idTraceY)}
    />

    <trace
      from=".ID_IN > .pin1"
      to=".R_ID > .pin1"
      pcbPath={["ID_IN.pin1", "R_ID.pin1"]}
      width={mm(pcb.idTraceW)}
    />
    <trace
      from=".R_ID > .pin2"
      to=".ID_OUT > .pin1"
      pcbPath={["R_ID.pin2", "ID_OUT.pin1"]}
      width={mm(pcb.idTraceW)}
    />
  </>
)

const PresentationSilkscreen = () => (
  <>
    <silkscreentext
      pcbX="0mm"
      pcbY="22.3mm"
      text="2.45 GHz PATCH / WORKPIECE +Z"
      fontSize="0.8mm"
    />
    <silkscreentext
      pcbX="-21.5mm"
      pcbY="-10.2mm"
      text="RF IN"
      fontSize="0.75mm"
    />
    <silkscreentext
      pcbX="21.5mm"
      pcbY="-10.2mm"
      text="RF OUT"
      fontSize="0.75mm"
    />
    <silkscreentext
      pcbX="-20.5mm"
      pcbY="-24mm"
      text="ID IN"
      fontSize="0.65mm"
    />
    <silkscreentext
      pcbX="20.5mm"
      pcbY="-24mm"
      text="ID OUT"
      fontSize="0.65mm"
    />

    {/* Mechanical/magnetic interface outlines for presentation and placement. */}
    <silkscreenrect
      pcbX={mm(-pcb.rfContactX)}
      pcbY="-16.0mm"
      width={mm(pcb.magneticOutlineW)}
      height={mm(pcb.magneticOutlineH)}
      filled={false}
      stroke="solid"
      strokeWidth="0.2mm"
    />
    <silkscreenrect
      pcbX={mm(pcb.rfContactX)}
      pcbY="-16.0mm"
      width={mm(pcb.magneticOutlineW)}
      height={mm(pcb.magneticOutlineH)}
      filled={false}
      stroke="solid"
      strokeWidth="0.2mm"
    />
  </>
)

export const SingleBoard = () => (
  <board
    width={mm(pcb.boardW)}
    height={mm(pcb.boardH)}
    center_x={0}
    center_y={0}
    routingDisabled
  >
    <net name="GND" />

    <RfGeometry />
    <GroundReturnVias />
    <IdChain />
    <PresentationSilkscreen />
  </board>
)
