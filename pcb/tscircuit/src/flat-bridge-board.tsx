import geom from "./connection-hardware-geometry.json"

const mm = (v: number) => `${v}mm`

const GroundInterface = ({ x }: { x: number }) => (
  <>
    <testpoint
      name={`TP_GND_${x < 0 ? "L" : "R"}`}
      footprintVariant="pad"
      padShape="rect"
      width={mm(geom.interface.groundPadWidthMm)}
      height={mm(geom.interface.groundPadHeightMm)}
      pcbX={mm(x)}
      pcbY={mm(geom.interface.groundYmm)}
      connections={{ pin1: "net.GND" }}
    />
    {geom.interface.viaXOffsetsMm.map((dx, i) => (
      <via
        key={`${x}-${i}`}
        name={`V_GND_${x < 0 ? "L" : "R"}_${i + 1}`}
        pcbX={mm(x + dx)}
        pcbY={mm(geom.interface.groundYmm)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
        outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
        connectsTo="net.GND"
      />
    ))}
  </>
)

export const FlatBridgeBoard = () => {
  const x = geom.flatBridge.contactXAbsMm
  const w = geom.flatBridge.boardWidthMm
  const h = geom.flatBridge.boardHeightMm

  return (
    <board
      title="2.45 GHz flat magnetic bridge"
      width={mm(w)}
      height={mm(h)}
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

      <testpoint
        name="TP_RF_IN"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.signalPadWidthMm)}
        height={mm(geom.interface.signalPadHeightMm)}
        pcbX={mm(-x)}
        pcbY={mm(geom.interface.signalYmm)}
      />
      <testpoint
        name="TP_RF_OUT"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.signalPadWidthMm)}
        height={mm(geom.interface.signalPadHeightMm)}
        pcbX={mm(x)}
        pcbY={mm(geom.interface.signalYmm)}
      />
      <trace
        name="TR_RF"
        from=".TP_RF_IN > .pin1"
        to=".TP_RF_OUT > .pin1"
        pcbPath={["TP_RF_IN.pin1", "TP_RF_OUT.pin1"]}
        width={mm(geom.rf.calibratedTraceWidthMm)}
      />

      <GroundInterface x={-x} />
      <GroundInterface x={x} />

      <testpoint
        name="TP_ID_IN"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.idPadWidthMm)}
        height={mm(geom.interface.idPadHeightMm)}
        pcbX={mm(-x)}
        pcbY={mm(geom.interface.idYmm)}
      />
      <testpoint
        name="TP_ID_OUT"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.idPadWidthMm)}
        height={mm(geom.interface.idPadHeightMm)}
        pcbX={mm(x)}
        pcbY={mm(geom.interface.idYmm)}
      />
      <trace
        name="TR_ID"
        from=".TP_ID_IN > .pin1"
        to=".TP_ID_OUT > .pin1"
        pcbPath={["TP_ID_IN.pin1", "TP_ID_OUT.pin1"]}
        width={mm(geom.rf.idTraceWidthMm)}
      />

      {geom.interface.magnetYmm.flatMap((my, idx) => [
        <silkscreenrect
          key={`ML${idx}`}
          pcbX={mm(-x)}
          pcbY={mm(my)}
          width={mm(geom.interface.magnetOutlineWidthMm)}
          height={mm(geom.interface.magnetOutlineHeightMm)}
          filled={false}
          stroke="solid"
          strokeWidth="0.18mm"
        />,
        <silkscreenrect
          key={`MR${idx}`}
          pcbX={mm(x)}
          pcbY={mm(my)}
          width={mm(geom.interface.magnetOutlineWidthMm)}
          height={mm(geom.interface.magnetOutlineHeightMm)}
          filled={false}
          stroke="solid"
          strokeWidth="0.18mm"
        />
      ])}

      <silkscreentext pcbX="0mm" pcbY="21mm" text="FLAT BRIDGE / 2.45GHz" fontSize="0.8mm" />
      <silkscreentext pcbX="0mm" pcbY="18.5mm" text="RF 50R + ID 0.30mm" fontSize="0.55mm" />

      <fabricationnotedimension
        from={{ x: -w / 2, y: h / 2 - 1 }}
        to={{ x: w / 2, y: h / 2 - 1 }}
        text="100.0 mm"
        fontSize={0.8}
        arrowSize={0.6}
      />
      <fabricationnotedimension
        from={{ x: -w / 2 + 1, y: -h / 2 }}
        to={{ x: -w / 2 + 1, y: h / 2 }}
        text="50.0 mm"
        fontSize={0.8}
        arrowSize={0.6}
      />
    </board>
  )
}
