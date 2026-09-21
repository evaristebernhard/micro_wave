import geom from "./connection-hardware-geometry.json"

const mm = (v: number) => `${v}mm`

export const CableMagneticTabBoard = () => {
  const W = geom.cableTab.boardWidthMm
  const H = geom.cableTab.boardHeightMm
  const yMag = geom.cableTab.contactEdgeYmm
  const yCable = geom.cableTab.coaxEdgeYmm

  return (
    <board
      title="N-coax to magnetic tab adapter"
      width={mm(W)}
      height={mm(H)}
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
        name="TP_RF_MAG"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.signalPadWidthMm)}
        height={mm(geom.interface.signalPadHeightMm)}
        pcbX="0mm"
        pcbY={mm(yMag)}
      />
      <testpoint
        name="TP_COAX_CENTER"
        footprintVariant="pad"
        padShape="rect"
        width="4.6mm"
        height="4mm"
        pcbX="0mm"
        pcbY={mm(yCable)}
      />
      <trace
        name="TR_RF"
        from=".TP_RF_MAG > .pin1"
        to=".TP_COAX_CENTER > .pin1"
        pcbPath={["TP_RF_MAG.pin1", "TP_COAX_CENTER.pin1"]}
        width={mm(geom.rf.calibratedTraceWidthMm)}
      />

      <testpoint
        name="TP_GND_MAG"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.groundPadWidthMm)}
        height={mm(geom.interface.groundPadHeightMm)}
        pcbX="-6mm"
        pcbY={mm(yMag)}
        connections={{ pin1: "net.GND" }}
      />
      <testpoint
        name="TP_COAX_SHIELD_L"
        footprintVariant="pad"
        padShape="rect"
        width="5mm"
        height="4mm"
        pcbX="-6.5mm"
        pcbY={mm(yCable)}
        connections={{ pin1: "net.GND" }}
      />
      <testpoint
        name="TP_COAX_SHIELD_R"
        footprintVariant="pad"
        padShape="rect"
        width="5mm"
        height="4mm"
        pcbX="6.5mm"
        pcbY={mm(yCable)}
        connections={{ pin1: "net.GND" }}
      />

      {[-7.0, -6.2, -5.4, 5.4, 6.2, 7.0].map((x, i) => (
        <via
          key={i}
          name={`V_SHIELD_${i + 1}`}
          pcbX={mm(x)}
          pcbY={mm(yCable - 2.5)}
          fromLayer="top"
          toLayer="bottom"
          holeDiameter={mm(geom.interface.viaHoleDiameterMm)}
          outerDiameter={mm(geom.interface.viaOuterDiameterMm)}
          connectsTo="net.GND"
        />
      ))}

      <testpoint
        name="TP_ID_MAG"
        footprintVariant="pad"
        padShape="rect"
        width={mm(geom.interface.idPadWidthMm)}
        height={mm(geom.interface.idPadHeightMm)}
        pcbX="6mm"
        pcbY={mm(yMag)}
      />
      <testpoint
        name="TP_ID_WIRE"
        footprintVariant="pad"
        padShape="rect"
        width="4.2mm"
        height="2.2mm"
        pcbX="11.5mm"
        pcbY={mm(yCable)}
      />
      <trace
        name="TR_ID"
        from=".TP_ID_MAG > .pin1"
        to=".TP_ID_WIRE > .pin1"
        pcbPath={["TP_ID_MAG.pin1", "TP_ID_WIRE.pin1"]}
        width={mm(geom.rf.idTraceWidthMm)}
      />

      <silkscreenrect pcbX="-8mm" pcbY="-16mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />
      <silkscreenrect pcbX="8mm" pcbY="-16mm" width="5mm" height="5mm" filled={false} stroke="solid" strokeWidth="0.18mm" />

      <silkscreentext pcbX="0mm" pcbY="17mm" text="RG142 / N -> MAG TAB" fontSize="0.65mm" />
      <silkscreentext pcbX="0mm" pcbY="14.5mm" text="RF + GND + ID" fontSize="0.50mm" />

      <fabricationnotedimension
        from={{ x: -W / 2, y: H / 2 - 1 }}
        to={{ x: W / 2, y: H / 2 - 1 }}
        text="30.0 mm"
        fontSize={0.7}
        arrowSize={0.55}
      />
      <fabricationnotedimension
        from={{ x: -W / 2 + 1, y: -H / 2 }}
        to={{ x: -W / 2 + 1, y: H / 2 }}
        text="50.0 mm"
        fontSize={0.7}
        arrowSize={0.55}
      />
    </board>
  )
}
