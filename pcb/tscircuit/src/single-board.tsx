import { derived, pcb } from "./geometry"

const mm = (value: number) => `${value}mm`

/**
 * First tscircuit seed for the 50 mm x 50 mm magnetic patch board.
 *
 * RF geometry is deliberately expressed as fixed copper pads inside one custom
 * footprint so the autorouter cannot modify the critical microwave geometry.
 *
 * pin1 = THROUGH RF bus
 * pin2 = PATCH branch
 * pin3 = bottom RF ground plane
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
      name="RF1"
      pcbX={0}
      pcbY={0}
      pinLabels={{
        pin1: "RF_THROUGH",
        pin2: "PATCH",
        pin3: "GND"
      }}
      footprint={
        <footprint>
          {/* 50 ohm through-line seed. Keep this geometry fixed. */}
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
            pcbX="-22.5mm"
            pcbY={mm(pcb.rfTraceY)}
            width={mm(pcb.rfPadW)}
            height={mm(pcb.rfPadH)}
            shape="rect"
          />
          <smtpad
            portHints={["pin1"]}
            pcbX="22.5mm"
            pcbY={mm(pcb.rfTraceY)}
            width={mm(pcb.rfPadW)}
            height={mm(pcb.rfPadH)}
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

          {/* Patch lower left leg around inset feed. */}
          <smtpad
            portHints={["pin2"]}
            pcbX={mm(-patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />

          {/* Patch lower right leg around inset feed. */}
          <smtpad
            portHints={["pin2"]}
            pcbX={mm(patchLegCenterOffset)}
            pcbY={mm(patchLegCenterY)}
            width={mm(patchLegWidth)}
            height={mm(patchLegHeight)}
            shape="rect"
          />

          {/* Nearly full bottom copper RF ground plane. */}
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

export const SingleBoard = () => (
  <board
    width={mm(pcb.boardW)}
    height={mm(pcb.boardH)}
    center_x={0}
    center_y={0}
    routingDisabled
  >
    <RfGeometry />

    {/* Board-count resistor placement seed. Low-frequency routing is added after
        the RF geometry is validated. */}
    <resistor
      name="R_ID"
      resistance="100ohm"
      footprint="0603"
      pcbX="0mm"
      pcbY={mm(pcb.idTraceY)}
    />
  </board>
)
