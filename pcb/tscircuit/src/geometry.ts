export const pcb = {
  boardW: 50,
  boardH: 50,

  patchW: 37.5,
  patchL: 28.5,
  patchCenterX: 0,
  patchCenterY: 5.0,

  rfTraceW: 2.9,
  rfTraceY: -18.0,

  insetDepth: 10.5,
  insetGap: 0.5,

  couplingGap: 0.5,
  couplingLength: 6.0,

  idTraceW: 0.30,
  idTraceY: -23.0,

  rfPadW: 4.6,
  rfPadH: 4.0,
  rfContactX: 22.5,

  rfGroundPadW: 4.6,
  rfGroundPadH: 2.4,
  rfGroundPadY: -13.7,
  rfGroundViaOffsetX: 0.8,
  rfGroundViaHole: 0.30,
  rfGroundViaOuter: 0.60,

  idPadX: 23.5,
  idPadW: 2.0,
  idPadH: 1.2,

  magneticOutlineW: 5.0,
  magneticOutlineH: 9.5
} as const

export const derived = {
  patchXMin: pcb.patchCenterX - pcb.patchW / 2,
  patchXMax: pcb.patchCenterX + pcb.patchW / 2,
  patchYMin: pcb.patchCenterY - pcb.patchL / 2,
  patchYMax: pcb.patchCenterY + pcb.patchL / 2,

  notchW: pcb.rfTraceW + 2 * pcb.insetGap,
  notchYMax: pcb.patchCenterY - pcb.patchL / 2 + pcb.insetDepth,

  coupledTraceY:
    pcb.rfTraceY + pcb.rfTraceW / 2 + pcb.couplingGap + pcb.rfTraceW / 2
} as const
