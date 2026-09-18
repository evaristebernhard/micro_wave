import { matchedExtractionTCellSeed, type BoardClass } from "./geometry"

export const tCellRfPolygonPoints = {
  A: [{ x: -20.614, y: -15.719 },{ x: -20.356, y: -17.613 },{ x: -20.567, y: -16.068 },{ x: -23.41, y: -16.455 },{ x: -22.99, y: -19.545 },{ x: -20.146, y: -19.158 },{ x: -20.098, y: -19.507 },{ x: -3.48, y: -17.245 },{ x: -3.521, y: -16.939 },{ x: 23.047, y: -19.552 },{ x: 23.353, y: -16.448 },{ x: -2.346, y: -13.92 },{ x: 0.375, y: -9.48 },{ x: 0, y: -9.25 },{ x: 0.44, y: -9.25 },{ x: 0.44, y: 1.45 },{ x: -0.44, y: 1.45 },{ x: -0.44, y: -9.126 },{ x: -3.318, y: -13.825 },{ x: -3.585, y: -13.799 },{ x: -3.611, y: -14.065 },{ x: -3.738, y: -14.012 },{ x: -3.91, y: -14.084 },{ x: -3.995, y: -13.456 }],
  B: [{ x: -20.693, y: -15.472 },{ x: -20.365, y: -17.553 },{ x: -20.608, y: -16.013 },{ x: -23.443, y: -16.46 },{ x: -22.957, y: -19.54 },{ x: -20.122, y: -19.093 },{ x: -20.037, y: -19.634 },{ x: -3.541, y: -17.033 },{ x: -3.618, y: -16.549 },{ x: 23.026, y: -19.55 },{ x: 23.374, y: -16.45 },{ x: -2.026, y: -13.59 },{ x: 0.629, y: -9.677 },{ x: 0, y: -9.25 },{ x: 0.76, y: -9.25 },{ x: 0.76, y: 1.45 },{ x: -0.76, y: 1.45 },{ x: -0.76, y: -9.016 },{ x: -3.806, y: -13.504 },{ x: -3.869, y: -13.477 },{ x: -4.088, y: -13.568 },{ x: -4.198, y: -12.871 }],
  C: [{ x: -23.513, y: -16.472 },{ x: -22.887, y: -19.528 },{ x: -20.075, y: -18.951 },{ x: -19.854, y: -20.027 },{ x: -3.668, y: -16.706 },{ x: -3.85, y: -15.817 },{ x: -3.689, y: -15.75 },{ x: 22.98, y: -19.544 },{ x: 23.42, y: -16.456 },{ x: -1.145, y: -12.962 },{ x: 1.183, y: -10.274 },{ x: 0, y: -9.25 },{ x: 1.565, y: -9.25 },{ x: 1.565, y: 1.45 },{ x: -1.565, y: 1.45 },{ x: -1.565, y: -8.667 },{ x: -4.599, y: -12.17 },{ x: -4.736, y: -11.499 },{ x: -20.923, y: -14.82 },{ x: -20.702, y: -15.896 }],
  D: [{ x: -10.542, y: -23.115 },{ x: -22.454, y: -16.63 },{ x: -23.946, y: -19.37 },{ x: -9.458, y: -27.256 },{ x: 1.559, y: -9.699 },{ x: 1.559, y: 1.45 },{ x: -1.559, y: 1.45 },{ x: -1.559, y: -8.801 }]
} as const

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
    throughResidualPhaseDeg:
      matchedExtractionTCellSeed.variants.A.throughResidualPhaseDeg,
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
    throughResidualPhaseDeg:
      matchedExtractionTCellSeed.variants.B.throughResidualPhaseDeg,
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
    throughResidualPhaseDeg:
      matchedExtractionTCellSeed.variants.C.throughResidualPhaseDeg,
    hasRfOut: true
  },
  D: {
    boardClass: "D",
    k: 1,
    junctionX: null,
    junctionY: null,
    seriesTransformerOhm: null,
    branchTransformerOhm: 50,
    throughResidualPhaseDeg: 0,
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
    throughResidualPhaseDeg: number
    hasRfOut: boolean
  }
>
