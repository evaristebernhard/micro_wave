export type BoardClass = "A" | "B" | "C" | "D"

export type CouplerTopology = "edge-coupled-quarter-wave" | "strong-coupler-seed" | "terminal"

export const pcb = {
  boardW: 50,
  // Keep the 50 mm horizontal pitch that controls inter-Patch phase.
  // The extra 10 mm is added only below the original board outline so the
  // RF/Patch coordinates and left-right magnetic pitch remain unchanged.
  boardH: 60,
  boardCenterY: -5,
  originalBoardH: 50,

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
  idTraceY: -32.0,

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
    targetBranchPhaseDeg: -90,
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
    targetBranchPhaseDeg: -90,
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
    targetBranchPhaseDeg: -90,
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
    targetBranchPhaseDeg: 0,
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
    targetBranchPhaseDeg: number
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

type PcbPoint = { x: number; y: number }

const strokePolyline = (points: PcbPoint[], width: number): PcbPoint[] => {
  const half = width / 2
  const normals = points.slice(0, -1).map((p, i) => {
    const q = points[i + 1]
    const dx = q.x - p.x
    const dy = q.y - p.y
    const len = Math.hypot(dx, dy)
    return { x: -dy / len, y: dx / len }
  })

  const offsetPoint = (i: number, side: 1 | -1): PcbPoint => {
    const p = points[i]
    if (i === 0) {
      const n = normals[0]
      return { x: p.x + side * half * n.x, y: p.y + side * half * n.y }
    }
    if (i === points.length - 1) {
      const n = normals[normals.length - 1]
      return { x: p.x + side * half * n.x, y: p.y + side * half * n.y }
    }

    const n0 = normals[i - 1]
    const n1 = normals[i]
    const sx = n0.x + n1.x
    const sy = n0.y + n1.y
    const sl = Math.hypot(sx, sy)
    const mx = sx / sl
    const my = sy / sl
    const denom = mx * n0.x + my * n0.y
    const scale = half / Math.max(Math.abs(denom), 0.25)
    return { x: p.x + side * scale * mx, y: p.y + side * scale * my }
  }

  const left = points.map((_, i) => offsetPoint(i, 1))
  const right = points
    .map((_, i) => offsetPoint(i, -1))
    .reverse()
  return [...left, ...right]
}

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
  const phaseFeedCenterline: PcbPoint[] =
    branchTrim > 0
      ? [
          { x: 0, y: phaseFeedStartY },
          { x: phaseFeedPeakX, y: phaseFeedMidY },
          { x: 0, y: phaseFeedEndY },
          { x: 0, y: patchDerived.notchYMax + 0.2 }
        ]
      : [
          { x: 0, y: phaseFeedStartY },
          { x: 0, y: patchDerived.notchYMax + 0.2 }
        ]
  const phaseFeedPolygonPoints = strokePolyline(
    phaseFeedCenterline,
    pcb.rfTraceW
  )

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
    phaseFeedAngleDeg,
    phaseFeedCenterline,
    phaseFeedPolygonPoints
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

export const terminalPhaseRouteCenterline: PcbPoint[] = [
  { x: terminalPhaseRouteSeed.inputX, y: terminalPhaseRouteSeed.inputY },
  { x: terminalPhaseRouteSeed.junctionX, y: terminalPhaseRouteSeed.junctionY },
  { x: terminalPhaseRouteSeed.patchEntryX, y: terminalPhaseRouteSeed.patchEntryY },
  { x: terminalPhaseRouteSeed.patchEntryX, y: patchDerived.notchYMax + 0.2 }
]

export const terminalPhaseRoutePolygonPoints = strokePolyline(
  terminalPhaseRouteCenterline,
  pcb.rfTraceW
)

/**
 * Complete pre-HFSS complex-excitation seed.
 *
 * Magnitudes include the 0.42 dB/cell scalar loss estimate and the
 * 6.5/5/3 dB A/B/C coupling seeds. Phases are normalized to A=0 deg.
 * Complex values are represented as [real, imag].
 */
export const complexExcitationSeed = {
  normalizedInputWave: 1.0,
  patchAmplitude: {
    A: 0.47315,
    B: 0.47203,
    C: 0.46819,
    D: 0.44503
  },
  patchPhaseDeg: {
    A: 0,
    B: 90,
    C: 180,
    D: 270
  },
  patchComplex: {
    A: [0.47315, 0.0],
    B: [0.0, 0.47203],
    C: [-0.46819, 0.0],
    D: [0.0, -0.44503]
  },
  phaseDegreesPerMm: 5.30,
  epsilonEffPhaseSensitivityDegPerUnit: 40.80,
  epsilonEffUncertaintyExample: 0.15,
  equivalentTrimUncertaintyMm: 1.15
} as const

/**
 * C-board topology decision from the pre-HFSS footprint audit.
 * A full-size single-section branch-line hybrid is not treated as a direct
 * fallback on the current 50 mm x 50 mm / same-layer Patch layout.
 */
export const cCouplerFeasibilitySeed = {
  standardBranchLineEnvelopeMm: {
    width: 19.68,
    height: 22.25
  },
  originalPatchLowerFreeHeightMm: 15.75,
  currentPatchLowerFreeHeightMm: 25.75,
  originalAbsoluteMaxLowerFreeHeightMm: 21.5,
  extendedBoardHeightMm: 70,
  standardBranchLineFitsSameLayer: true,
  preferredPhaseConventionDeg: -90,
  fallbackClass: "extended-standard-or-compact-quadrature",
  candidateFamilies: [
    "miniaturized-branch-line",
    "loaded-coupled-line",
    "lange-interdigital",
    "multilayer-broadside",
    "external-or-smd-hybrid"
  ]
} as const

/**
 * Matched-extraction T-cell analytical alternative.
 *
 * At f0, a quarter-wave series transformer matches a T junction whose
 * downstream arm is 50 ohm and whose Patch branch is transformed to the
 * effective resistance needed for the requested extraction fraction.
 *
 * Zt = 50*sqrt(1-k)
 * Zb = 50*sqrt((1-k)/k)
 *
 * The input transformer contributes about -90 deg; the Patch branch adds
 * another -90 deg. A 50-ohm half-wave tail to the next cell therefore gives
 * an overall through phase near -270 deg and Patch progression near +90 deg.
 */
export const matchedExtractionTCellSeed = {
  referenceOhm: 50,
  fiftyOhmWidthMm: 3.137,
  fiftyOhmQuarterWaveMm: 16.921,
  fiftyOhmHalfWaveMm: 33.842,
  fiftyOhmInsetFeedMm: 10.5,
  insetCommonPhaseDeg: 55.84,
  // Transformer reference planes are the INNER edges of the 4.6 mm magnetic
  // signal pads. This keeps all synthesized copper inside the 50 mm board.
  inputTransformerStart: { x: -20.2, y: -18.0 },
  patchBranchEndpoint: { x: 0.0, y: -9.25 },
  rfOutTransformerEnd: { x: 20.2, y: -18.0 },
  intercellInnerEdgeSpanMm: 9.6,
  variants: {
    A: {
      k: 0.224,
      seriesTransformerOhm: 44.045,
      seriesTransformerWidthMm: 3.845,
      seriesQuarterWaveMm: 16.779,
      branchTransformerOhm: 93.063,
      branchTransformerWidthMm: 0.877,
      branchQuarterWaveMm: 17.637,
      junctionX: -5.462,
      junctionY: -26.020,
      onboardThroughTailMm: 26.886,
      requiredIntercellEquivalent50OhmMm: 6.956,
      requiredIntercellPhaseDeg: 37.00,
      intercellEffectivePermittivityFor9p6mm: 1.716
    },
    B: {
      k: 0.316,
      seriesTransformerOhm: 41.352,
      seriesTransformerWidthMm: 4.235,
      seriesQuarterWaveMm: 16.710,
      branchTransformerOhm: 73.562,
      branchTransformerWidthMm: 1.521,
      branchQuarterWaveMm: 17.382,
      junctionX: -5.406,
      junctionY: -25.770,
      onboardThroughTailMm: 26.759,
      requiredIntercellEquivalent50OhmMm: 7.083,
      requiredIntercellPhaseDeg: 37.67,
      intercellEffectivePermittivityFor9p6mm: 1.779
    },
    C: {
      k: 0.501,
      seriesTransformerOhm: 35.320,
      seriesTransformerWidthMm: 5.337,
      seriesQuarterWaveMm: 16.543,
      branchTransformerOhm: 49.900,
      branchTransformerWidthMm: 3.147,
      branchQuarterWaveMm: 16.919,
      junctionX: -5.355,
      junctionY: -25.299,
      onboardThroughTailMm: 26.577,
      requiredIntercellEquivalent50OhmMm: 7.266,
      requiredIntercellPhaseDeg: 38.65,
      intercellEffectivePermittivityFor9p6mm: 1.872
    }
  },
  commonIntercellPhaseSeedDeg: 37.8,
  inputToJunctionPhaseDeg: -90,
  junctionToPatchBottomPhaseDeg: -90,
  insetFeedCommonPhaseDeg: -55.84,
  junctionToNextCellPhaseDeg: -180,
  targetCellThroughPhaseDeg: -270,
  targetPatchProgressionDeg: 90,
  terminalD: {
    inputTransformerStart: { x: -20.2, y: -18.0 },
    vertex: { x: -4.992, y: -25.418 },
    patchBranchEndpoint: { x: 0.0, y: -9.25 },
    preInsetHalfWaveMm: 33.842,
    insetFeedMm: 10.5,
    localPatchPhaseDeg: -235.84
  },
  primaryAdvantage: "ordinary-width-lines-no-micron-coupling-gap",
  primaryRisk: "three-port-T-cell-has-no-inherent-output-isolation"
} as const


export const tCellRobustnessGate = {
  preferredLoadedPatchGammaMax: 0.10,
  conditionalLoadedPatchGammaMax: 0.20,
  nominalBandGHz: [2.40, 2.50],
  nominalWorstReturnLossDbAcrossBand: {
    A: 62.85,
    B: 53.42,
    C: 38.86
  },
  worstReturnLossDbAtGamma0p10: {
    A: 32.29,
    B: 29.39,
    C: 25.56
  },
  worstReturnLossDbAtGamma0p20: {
    A: 25.51,
    B: 22.71,
    C: 19.07
  },
  decision: "prefer-tcell-if-loaded-patch-reflection-is-small"
} as const
