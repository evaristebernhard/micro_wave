import { matchedExtractionTCellSeed, type BoardClass } from "./geometry"

export const tCellRfPolygonPoints = {
  A: [{ x: -7.521, y: -26.569 },{ x: -6.967, y: -26.799 },{ x: -6.659, y: -26.671 },{ x: -6.582, y: -26.974 },{ x: 22.885, y: -19.521 },{ x: 22.115, y: -16.479 },{ x: -5.651, y: -23.502 },{ x: 0.047, y: -10.25 },{ x: 0.721, y: -9.971 },{ x: 1.02, y: -9.25 },{ x: 1.569, y: -9.25 },{ x: 1.569, y: 1.45 },{ x: -1.569, y: 1.45 },{ x: -1.569, y: -9.25 },{ x: -1.02, y: -9.25 },{ x: -0.753, y: -9.892 },{ x: -6.6, y: -23.489 },{ x: -21.146, y: -16.278 },{ x: -22, y: -18 },{ x: -22, y: -16.431 },{ x: -22.5, y: -16.431 },{ x: -22.5, y: -19.009 },{ x: -22.854, y: -19.722 },{ x: -7.821, y: -27.175 }],
  B: [{ x: -7.51, y: -26.434 },{ x: -6.919, y: -26.678 },{ x: -6.59, y: -26.542 },{ x: -6.546, y: -26.72 },{ x: 22.873, y: -19.524 },{ x: 22.127, y: -16.476 },{ x: -5.208, y: -23.163 },{ x: 0.471, y: -10.074 },{ x: 0.721, y: -9.971 },{ x: 1.02, y: -9.25 },{ x: 1.569, y: -9.25 },{ x: 1.569, y: 1.45 },{ x: -1.569, y: 1.45 },{ x: -1.569, y: -9.25 },{ x: -1.02, y: -9.25 },{ x: -0.926, y: -9.475 },{ x: -6.762, y: -22.925 },{ x: -21.088, y: -16.089 },{ x: -22, y: -18 },{ x: -22, y: -16.431 },{ x: -22.5, y: -16.431 },{ x: -22.5, y: -19.048 },{ x: -22.912, y: -19.911 },{ x: -7.831, y: -27.107 }],
  C: [{ x: -6.878, y: -26.576 },{ x: -5.551, y: -26.014 },{ x: 22.849, y: -19.529 },{ x: 22.151, y: -16.471 },{ x: -4.164, y: -22.479 },{ x: 1.438, y: -9.89 },{ x: 0.864, y: -9.634 },{ x: 1.023, y: -9.25 },{ x: 1.569, y: -9.25 },{ x: 1.569, y: 1.45 },{ x: -1.569, y: 1.45 },{ x: -1.569, y: -8.904 },{ x: -7.232, y: -21.632 },{ x: -20.918, y: -15.561 },{ x: -22, y: -18 },{ x: -22, y: -16.431 },{ x: -22.5, y: -16.431 },{ x: -22.5, y: -19.127 },{ x: -23.082, y: -20.439 },{ x: -7.96, y: -27.147 },{ x: -7.578, y: -26.286 }],
  D: [{ x: -7.749, y: -22.628 },{ x: -21.881, y: -16.559 },{ x: -23.119, y: -19.441 },{ x: -6.155, y: -26.726 },{ x: 1.569, y: -9.587 },{ x: 1.569, y: 1.45 },{ x: -1.569, y: 1.45 },{ x: -1.569, y: -8.913 }]
} as const

const bridgeResidual = (boardClass: "A" | "B" | "C") =>
  matchedExtractionTCellSeed.variants[boardClass].requiredBridgePhaseDeg -
  matchedExtractionTCellSeed.commonBridgePhaseSeedDeg

export const tCellVariantMeta = {
  A: {
    boardClass: "A",
    k: matchedExtractionTCellSeed.variants.A.k,
    junctionX: matchedExtractionTCellSeed.variants.A.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.A.junctionY,
    seriesTransformerOhm:
      matchedExtractionTCellSeed.variants.A.seriesTransformerOhm,
    branchTransformerOhm:
      matchedExtractionTCellSeed.variants.A.branchTransformerOhm,
    bridgeResidualPhaseDeg: bridgeResidual("A"),
    hasRfOut: true
  },
  B: {
    boardClass: "B",
    k: matchedExtractionTCellSeed.variants.B.k,
    junctionX: matchedExtractionTCellSeed.variants.B.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.B.junctionY,
    seriesTransformerOhm:
      matchedExtractionTCellSeed.variants.B.seriesTransformerOhm,
    branchTransformerOhm:
      matchedExtractionTCellSeed.variants.B.branchTransformerOhm,
    bridgeResidualPhaseDeg: bridgeResidual("B"),
    hasRfOut: true
  },
  C: {
    boardClass: "C",
    k: matchedExtractionTCellSeed.variants.C.k,
    junctionX: matchedExtractionTCellSeed.variants.C.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.C.junctionY,
    seriesTransformerOhm:
      matchedExtractionTCellSeed.variants.C.seriesTransformerOhm,
    branchTransformerOhm:
      matchedExtractionTCellSeed.variants.C.branchTransformerOhm,
    bridgeResidualPhaseDeg: bridgeResidual("C"),
    hasRfOut: true
  },
  D: {
    boardClass: "D",
    k: 1,
    junctionX: null,
    junctionY: null,
    seriesTransformerOhm: null,
    branchTransformerOhm: 50,
    bridgeResidualPhaseDeg: 0,
    hasRfOut: false
  }
} as const satisfies Record<
  BoardClass,
  {
    boardClass: BoardClass
    k: number
    junctionX: number | null
    junctionY: number | null
    seriesTransformerOhm: number | null
    branchTransformerOhm: number | null
    bridgeResidualPhaseDeg: number
    hasRfOut: boolean
  }
>
