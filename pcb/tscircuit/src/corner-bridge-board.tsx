import geom from "./connection-hardware-geometry.json"

const mm = (v: number) => `${v}mm`

export const CornerBridgeBoard = () => {
  const L = geom.cornerBridge.legLengthMm
  const W = geom.cornerBridge.legWidthMm
  const xOuter = -L / 2 + geom.cornerBridge.outerContactOffsetFromEdgeMm
  const xJoint = L / 2 - geom.cornerBridge.outerContactOffsetFromEdgeMm
  const signalY = 0
  const groundY = -6
  const idY = -11.5

  return (
    <board
      title="2.45 GHz 90-degree bridge leg - fabricate QTY 2"
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
        pcbX={mm(xOuter)}
        pcbY={mm(signalY)}
      />
      <testpoint
        name="TP_RF_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.signalPadWidthMm)}
        height={mm(geom.interface.signalPadHeightMm)}
        pcbX={mm(xJoint)}
        pcbY={mm(signalY)}
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
        pcbX={mm(xOuter)}
        pcbY={mm(groundY)}
        connections={{ pin1: "net.GND" }}
      />
      <testpoint
        name="TP_GND_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.groundPadWidthMm)}
        height={mm(geom.interface.groundPadHeightMm)}
        pcbX={mm(xJoint)}
        pcbY={mm(groundY)}
        connections={{ pin1: "net.GND" }}
      />

      {geom.interface.viaXOffsetsMm.map((dx, i) => (
        <via
          key={`outer-${i}`}
          name={`V_GND_OUTER_${i + 1}`}
          pcbX={mm(xOuter + dx)}
          pcbY={mm(groundY)}
          fromLayer="top"
          toLayer="bottom"
          holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
          outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
          connectsTo="net.GND"
        />
      ))}
      {geom.interface.viaXOffsetsMm.map((dx, i) => (
        <via
          key={`joint-${i}`}
          name={`V_GND_JOINT_${i + 1}`}
          pcbX={mm(xJoint + dx)}
          pcbY={mm(groundY)}
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
        pcbX={mm(xOuter)}
        pcbY={mm(idY)}
      />
      <testpoint
        name="TP_ID_JOINT"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.idPadWidthMm)}
        height={mm(geom.interface.idPadHeightMm)}
        pcbX={mm(xJoint)}
        pcbY={mm(idY)}
      />
      <trace
        name="TR_ID"
        from=".TP_ID_OUTER > .pin1"
        to=".TP_ID_JOINT > .pin1"
        pcbPath={["TP_ID_OUTER.pin1", "TP_ID_JOINT.pin1"]}
        width={mm(geom.rf.idTraceWidthMm)}
      />

      <silkscreenrect pcbX={mm(xOuter)} pcbY="7mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
      <silkscreenrect pcbX={mm(xOuter)} pcbY="12mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />

      <silkscreentext pcbX="0mm" pcbY="12.8mm" text="90deg BRIDGE LEG / FAB QTY 2" fontSize="0.60mm" />
      <silkscreentext pcbX="0mm" pcbY="10.4mm" text="RF 50R + GND + ID / ORTHOGONAL ASSEMBLY" fontSize="0.42mm" />
      <silkscreentext pcbX={mm(xJoint - 4)} pcbY="3.3mm" text="JOINT" fontSize="0.45mm" />

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
