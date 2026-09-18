import { matchedExtractionTCellSeed, type BoardClass } from "./geometry"

export const tCellRfPolygonPoints = {
  A: [{ x: -6.098, y: -27.863 },{ x: -6.491, y: -27.985 },{ x: -6.618, y: -27.580 },{ x: -21.119, y: -19.689 },{ x: -22.807, y: -18.770 },{ x: -20.970, y: -15.393 },{ x: -5.248, y: -23.948 },{ x: -0.933, y: -10.700 },{ x: -1.450, y: -10.700 },{ x: -1.450, y: 1.450 },{ x: -1.450, y: 2.900 },{ x: 1.450, y: 2.900 },{ x: 1.450, y: -9.250 },{ x: 1.450, y: -10.700 },{ x: -0.011, y: -10.700 },{ x: -4.353, y: -24.030 },{ x: 19.732, y: -16.503 },{ x: 21.229, y: -16.035 },{ x: 22.165, y: -19.029 },{ x: -3.902, y: -27.176 },{ x: -4.692, y: -28.628 }],
  B: [{ x: -6.315, y: -27.685 },{ x: -6.452, y: -27.727 },{ x: -6.493, y: -27.592 },{ x: -21.185, y: -19.875 },{ x: -23.060, y: -18.890 },{ x: -21.090, y: -15.140 },{ x: -5.421, y: -23.370 },{ x: -1.275, y: -10.700 },{ x: -1.450, y: -10.700 },{ x: -1.450, y: 1.450 },{ x: -1.450, y: 2.900 },{ x: 1.450, y: 2.900 },{ x: 1.450, y: -9.250 },{ x: 1.450, y: -10.700 },{ x: 0.326, y: -10.700 },{ x: -3.922, y: -23.681 },{ x: 19.745, y: -16.499 },{ x: 21.245, y: -16.044 },{ x: 22.156, y: -19.045 },{ x: -3.585, y: -26.857 },{ x: -4.516, y: -28.630 }],
  C: [{ x: 19.769, y: -16.492 },{ x: 21.277, y: -16.061 },{ x: 22.139, y: -19.077 },{ x: -2.828, y: -26.209 },{ x: -4.137, y: -28.871 },{ x: -21.377, y: -20.395 },{ x: -23.772, y: -19.217 },{ x: -21.417, y: -14.428 },{ x: -5.927, y: -22.044 },{ x: -1.493, y: -8.752 },{ x: -1.450, y: -8.624 },{ x: -1.450, y: 1.450 },{ x: -1.450, y: 2.900 },{ x: 1.450, y: 2.900 },{ x: 1.450, y: -8.075 },{ x: 1.991, y: -8.255 },{ x: 1.450, y: -9.876 },{ x: 1.450, y: -10.700 },{ x: 1.175, y: -10.700 },{ x: -2.919, y: -22.973 }],
  D: [{ x: -1.499, y: -8.787 },{ x: -1.450, y: -8.630 },{ x: -1.450, y: 1.450 },{ x: -1.450, y: 2.900 },{ x: 1.450, y: 2.900 },{ x: 1.450, y: -8.056 },{ x: 1.961, y: -8.214 },{ x: 1.450, y: -9.870 },{ x: 1.450, y: -10.700 },{ x: 1.194, y: -10.700 },{ x: -4.033, y: -27.631 },{ x: -20.888, y: -19.410 },{ x: -22.297, y: -18.722 },{ x: -20.922, y: -15.903 },{ x: -5.950, y: -23.206 }]
} as const

export const tCellVariantMeta = {
  A: {
    boardClass: "A",
    k: matchedExtractionTCellSeed.variants.A.k,
    junctionX: matchedExtractionTCellSeed.variants.A.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.A.junctionY,
    seriesTransformerOhm: matchedExtractionTCellSeed.variants.A.seriesTransformerOhm,
    branchTransformerOhm: matchedExtractionTCellSeed.variants.A.branchTransformerOhm,
    bridgePhaseDeg: matchedExtractionTCellSeed.variants.A.requiredIntercellPhaseDeg,
    hasRfOut: true
  },
  B: {
    boardClass: "B",
    k: matchedExtractionTCellSeed.variants.B.k,
    junctionX: matchedExtractionTCellSeed.variants.B.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.B.junctionY,
    seriesTransformerOhm: matchedExtractionTCellSeed.variants.B.seriesTransformerOhm,
    branchTransformerOhm: matchedExtractionTCellSeed.variants.B.branchTransformerOhm,
    bridgePhaseDeg: matchedExtractionTCellSeed.variants.B.requiredIntercellPhaseDeg,
    hasRfOut: true
  },
  C: {
    boardClass: "C",
    k: matchedExtractionTCellSeed.variants.C.k,
    junctionX: matchedExtractionTCellSeed.variants.C.junctionX,
    junctionY: matchedExtractionTCellSeed.variants.C.junctionY,
    seriesTransformerOhm: matchedExtractionTCellSeed.variants.C.seriesTransformerOhm,
    branchTransformerOhm: matchedExtractionTCellSeed.variants.C.branchTransformerOhm,
    bridgePhaseDeg: matchedExtractionTCellSeed.variants.C.requiredIntercellPhaseDeg,
    hasRfOut: true
  },
  D: {
    boardClass: "D",
    k: 1,
    junctionX: null,
    junctionY: null,
    seriesTransformerOhm: null,
    branchTransformerOhm: 50,
    bridgePhaseDeg: 0,
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
    bridgePhaseDeg: number
    hasRfOut: boolean
  }
>
