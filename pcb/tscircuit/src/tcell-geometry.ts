import { matchedExtractionTCellSeed, type BoardClass } from "./geometry"

export const tCellRfPolygonPoints = {
  A: [[-20.614,-15.719],[-20.356,-17.613],[-20.567,-16.068],[-23.41,-16.455],[-22.99,-19.545],[-20.146,-19.158],[-20.098,-19.507],[-3.48,-17.245],[-3.521,-16.939],[23.047,-19.552],[23.353,-16.448],[-2.346,-13.92],[0.375,-9.48],[0,-9.25],[0.44,-9.25],[0.44,1.45],[-0.44,1.45],[-0.44,-9.126],[-3.318,-13.825],[-3.585,-13.799],[-3.611,-14.065],[-3.738,-14.012],[-3.91,-14.084],[-3.995,-13.456]],
  B: [[-20.693,-15.472],[-20.365,-17.553],[-20.608,-16.013],[-23.443,-16.46],[-22.957,-19.54],[-20.122,-19.093],[-20.037,-19.634],[-3.541,-17.033],[-3.618,-16.549],[23.026,-19.55],[23.374,-16.45],[-2.026,-13.59],[0.629,-9.677],[0,-9.25],[0.76,-9.25],[0.76,1.45],[-0.76,1.45],[-0.76,-9.016],[-3.806,-13.504],[-3.869,-13.477],[-4.088,-13.568],[-4.198,-12.871]],
  C: [[-23.513,-16.472],[-22.887,-19.528],[-20.075,-18.951],[-19.854,-20.027],[-3.668,-16.706],[-3.85,-15.817],[-3.689,-15.75],[22.98,-19.544],[23.42,-16.456],[-1.145,-12.962],[1.183,-10.274],[0,-9.25],[1.565,-9.25],[1.565,1.45],[-1.565,1.45],[-1.565,-8.667],[-4.599,-12.17],[-4.736,-11.499],[-20.923,-14.82],[-20.702,-15.896]],
  D: [[-10.542,-23.115],[-22.454,-16.63],[-23.946,-19.37],[-9.458,-27.256],[1.559,-9.699],[1.559,1.45],[-1.559,1.45],[-1.559,-8.801]]
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
