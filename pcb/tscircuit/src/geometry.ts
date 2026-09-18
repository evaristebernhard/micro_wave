export type BoardClass = "A" | "B" | "C" | "D"

export type CouplerTopology = "edge-coupled-quarter-wave" | "strong-coupler-seed" | "terminal"

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

  // The old 6 mm / 0.5 mm geometry is retained only as a historical
  // proximity-coupler calibration point. The current A/B/C seeds use
  // quarter-wave-scale coupling sections and must be retuned in HFSS.
  legacyCouplingGap: 0.5,
  legacyCouplingLength: 6.0,

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
  magneticOutlineH: 9.5,

  isoPadW: 1.8,
  isoPadH: 1.8
} as const

export const boardVariants = {
  A: {
    boardClass: "A",
    topology: "edge-coupled-quarter-wave",
    targetCouplingDb: 6.5,
    targetPowerFraction: 0.224,
    couplingLengthSeed: 17.0,
    couplingGapSeed: 0.70,
    targetEvenModeOhm: 83.6,
    targetOddModeOhm: 29.9,
    branchPhaseTrimLengthSeed: 0.0,
    needsIsolationTermination: true,
    hasRfOut: true
  },
  B: {
    boardClass: "B",
    topology: "edge-coupled-quarter-wave",
    targetCouplingDb: 5.0,
    targetPowerFraction: 0.316,
    couplingLengthSeed: 17.0,
    couplingGapSeed: 0.45,
    targetEvenModeOhm: 94.5,
    targetOddModeOhm: 26.5,
    branchPhaseTrimLengthSeed: 0.66,
    needsIsolationTermination: true,
    hasRfOut: true
  },
  C: {
    boardClass: "C",
    topology: "strong-coupler-seed",
    targetCouplingDb: 3.0,
    targetPowerFraction: 0.501,
    couplingLengthSeed: 17.0,
    couplingGapSeed: 0.30,
    targetEvenModeOhm: 120.9,
    targetOddModeOhm: 20.7,
    branchPhaseTrimLengthSeed: 1.41,
    needsIsolationTermination: true,
    hasRfOut: true
  },
  D: {
    boardClass: "D",
    topology: "terminal",
    targetCouplingDb: null,
    targetPowerFraction: 1.0,
    couplingLengthSeed: 0,
    couplingGapSeed: 0,
    targetEvenModeOhm: null,
    targetOddModeOhm: null,
    branchPhaseTrimLengthSeed: null,
    needsIsolationTermination: false,
    hasRfOut: false
  }
} as const satisfies Record<
  BoardClass,
  {
    boardClass: BoardClass
    topology: CouplerTopology
    targetCouplingDb: number | null
    targetPowerFraction: number
    couplingLengthSeed: number
    couplingGapSeed: number
    targetEvenModeOhm: number | null
    targetOddModeOhm: number | null
    branchPhaseTrimLengthSeed: number | null
    needsIsolationTermination: boolean
    hasRfOut: boolean
  }
>

export const patchDerived = {
  patchXMin: pcb.patchCenterX - pcb.patchW / 2,
  patchXMax: pcb.patchCenterX + pcb.patchW / 2,
  patchYMin: pcb.patchCenterY - pcb.patchL / 2,
  patchYMax: pcb.patchCenterY + pcb.patchL / 2,

  notchW: pcb.rfTraceW + 2 * pcb.insetGap,
  notchYMax: pcb.patchCenterY - pcb.patchL / 2 + pcb.insetDepth
} as const

export const getVariantDerived = (boardClass: BoardClass) => {
  const variant = boardVariants[boardClass]
  const coupledTraceY =
    pcb.rfTraceY +
    pcb.rfTraceW / 2 +
    variant.couplingGapSeed +
    pcb.rfTraceW / 2

  const branchTrim = variant.branchPhaseTrimLengthSeed ?? 0
  const phaseFeedStartY = coupledTraceY + pcb.rfTraceW / 2
  const phaseFeedEndY = patchDerived.patchYMin
  const phaseFeedRise = phaseFeedEndY - phaseFeedStartY
  const phaseFeedTargetLength = phaseFeedRise + branchTrim
  const phaseFeedHalfSegmentLength = phaseFeedTargetLength / 2
  const phaseFeedHalfRise = phaseFeedRise / 2
  const phaseFeedPeakX =
    branchTrim > 0
      ? Math.sqrt(
          Math.max(
            0,
            phaseFeedHalfSegmentLength ** 2 - phaseFeedHalfRise ** 2
          )
        )
      : 0
  const phaseFeedMidY = (phaseFeedStartY + phaseFeedEndY) / 2
  const phaseFeedAngleDeg =
    branchTrim > 0
      ? (Math.atan2(phaseFeedHalfRise, phaseFeedPeakX) * 180) / Math.PI
      : 90

  return {
    ...patchDerived,
    coupledTraceY,
    // Put the coupled section immediately to the left of the centered Patch
    // feed. This creates an explicit isolated-end location on A/B/C.
    coupledTraceXMin: -variant.couplingLengthSeed,
    coupledTraceXMax: 0,
    coupledTraceCenterX: -variant.couplingLengthSeed / 2,
    branchPhaseTrimLengthSeed: branchTrim,
    phaseFeedStartY,
    phaseFeedEndY,
    phaseFeedRise,
    phaseFeedTargetLength,
    phaseFeedHalfSegmentLength,
    phaseFeedPeakX,
    phaseFeedMidY,
    phaseFeedAngleDeg
  } as const
}


/**
 * Pre-HFSS phase-design seed.
 *
 * These values come from the reduced-order transmission-line model in
 * docs/12_pre_simulation_phase_trim_estimate_v1.md. They are design metadata,
 * not yet physical copper meanders. HFSS/openEMS should replace the estimated
 * effective permittivity and coupler phases before manufacturing freeze.
 */
export const phaseDesignSeed = {
  centerFrequencyGHz: 2.45,
  effectivePermittivity: 3.25,
  guidedWavelengthMm: 67.88,
  naturalCellElectricalLengthDeg: 265.19,
  naturalForwardProgressionDeg: 94.81,
  preferredProgressionDeg: 90,
  phaseDegreesPerMm: 5.30,
  suggestedFineTrimStepMm: 0.5,
  suggestedFineTrimRangeMm: 8.5,
  // A/B/C fine trims required by the first-order geometry/path model to
  // move the natural ~94 deg progression toward +90 deg.
  branchTrimLengthSeedMm: {
    A: 0.0,
    B: 0.66,
    C: 1.41,
    D: null
  },
  // D is terminal/direct-fed and must be phase-matched separately.
  terminalPhaseNeedsIndependentSolve: true
} as const

/**
 * Analytical D-terminal feed route for the +90 degree progressive-phase seed.
 *
 * Phase convention: A/B/C use the lagging quadrature coupled port
 * (approximately -90 deg intrinsic branch phase). D is direct-fed.
 * The reduced-order model then requires about 35.34 mm total centerline
 * path from the D RF input reference to the Patch inset reference.
 */
export const terminalPhaseRouteSeed = {
  targetProgressionDeg: 90,
  cCouplerIntrinsicBranchPhaseDeg: -90,
  targetTotalElectricalPathMm: 35.34,
  currentOrthogonalPathMm: 41.75,
  pathReductionMm: 6.41,
  inputX: -22.5,
  inputY: -18.0,
  horizontalLengthMm: 7.29,
  junctionX: -15.21,
  junctionY: -18.0,
  diagonalLengthMm: 17.55,
  diagonalAngleDeg: 29.91,
  diagonalCenterX: -7.61,
  diagonalCenterY: -13.625,
  patchEntryX: 0,
  patchEntryY: -9.25,
  insetLengthMm: 10.5,
  insetCenterY: -4.0
} as const
