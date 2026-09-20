import geom from "./connection-hardware-geometry.json"

const mm = (v: number) => `${v}mm`

export const CornerBridgeLegBoard = () => {
  const L = geom.cornerBridge.legLengthMm
  const W = geom.cornerBridge.legWidthMm
  const outerX = -L / 2 + geom.cornerBridge.outerContactOffsetFromEdgeMm
  const jointX = L / 2 - 2.5

  return (
    <board
      title="2.45 GHz vertical corner bridge leg"
      width={mm(L)}
      height={mm(W)}
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
        name="TP_RF_OUTER"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.signalPadWidthMm)}
        height={mm(geom.interface.signalPadHeightMm)}
        pcbX={mm(outerX)}
        pcbY="0mm"
      />
      <testpoint
        name="TP_RF_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width="6mm"
        height="4mm"
        pcbX={mm(jointX)}
        pcbY="0mm"
      />
      <trace
        name="TR_RF"
        from=".TP_RF_OUTER > .pin1"
        to=".TP_RF_JOINT > .pin1"
        pcbPath={["TP_RF_OUTER.pin1", "TP_RF_JOINT.pin1"]}
        width={mm(geom.rf.calibratedTraceWidthMm)}
      />

      <testpoint
        name="TP_GND_OUTER"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.groundPadWidthMm)}
        height={mm(geom.interface.groundPadHeightMm)}
        pcbX={mm(outerX)}
        pcbY="-5.5mm"
        connections={{ pin1: "net.GND" }}
      />
      <testpoint
        name="TP_GND_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width="6mm"
        height="3mm"
        pcbX={mm(jointX)}
        pcbY="-5.5mm"
        connections={{ pin1: "net.GND" }}
      />

      {geom.interface.viaXOffsetsMm.map((dx, i) => (
        <via
          key={`vo-${i}`}
          name={`V_GND_OUT_${i + 1}`}
          pcbX={mm(outerX + dx)}
          pcbY="-5.5mm"
          fromLayer="top"
          toLayer="bottom"
          holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
          outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
          connectsTo="net.GND"
        />
      ))}
      {geom.interface.viaXOffsetsMm.map((dx, i) => (
        <via
          key={`vj-${i}`}
          name={`V_GND_JOINT_${i + 1}`}
          pcbX={mm(jointX + dx)}
          pcbY="-5.5mm"
          fromLayer="top"
          toLayer="bottom"
          holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
          outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
          connectsTo="net.GND"
        />
      ))}

      <testpoint
        name="TP_ID_OUTER"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.idPadWidthMm)}
        height={mm(geom.interface.idPadHeightMm)}
        pcbX={mm(outerX)}
        pcbY="-10.5mm"
      />
      <testpoint
        name="TP_ID_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width="5mm"
        height="2.2mm"
        pcbX={mm(jointX)}
        pcbY="-10.5mm"
      />
      <trace
        name="TR_ID"
        from=".TP_ID_OUTER > .pin1"
        to=".TP_ID_JOINT > .pin1"
        pcbPath={["TP_ID_OUTER.pin1", "TP_ID_JOINT.pin1"]}
        width={mm(geom.rf.idTraceWidthMm)}
      />

      <silkscreenrect pcbX={mm(outerX)} pcbY="7mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
      <silkscreenrect pcbX={mm(outerX)} pcbY="12mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />

      <silkscreentext pcbX="0mm" pcbY="12.5mm" text="CORNER BRIDGE LEG / QTY 2" fontSize="0.65mm" />
      <silkscreentext pcbX="15mm" pcbY="7.5mm" text="90deg JOINT" fontSize="0.48mm" />

      <fabricationnotedimension
        from={{ x: -L / 2, y: W / 2 - 1 }}
        to={{ x: L / 2, y: W / 2 - 1 }}
        text="50.0 mm"
        fontSize={0.7}
        arrowSize={0.55}
      />
      <fabricationnotedimension
        from={{ x: -L / 2 + 1, y: -W / 2 }}
        to={{ x: -L / 2 + 1, y: W / 2 }}
        text="30.0 mm"
        fontSize={0.7}
        arrowSize={0.55}
      />
    </board>
  )
}
