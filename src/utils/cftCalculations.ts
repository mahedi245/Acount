/**
 * CFT (Cubic Feet) Calculation Utilities for Wood & Sawmill Operations
 * Standard formulas used across Bangladesh Timber Market & Forest Industry
 */

export interface SawnWoodDimensions {
  lengthFt: number;
  lengthIn?: number;
  widthIn: number;
  widthSuuta?: number; // 1 Suuta = 1/8 inch
  thicknessIn: number;
  thicknessSuuta?: number;
  quantity?: number;
}

export interface RoundLogDimensions {
  lengthFt: number;
  lengthIn?: number;
  girthInches: number; // বেড় / পরিধি in inches
  quantity?: number;
}

/**
 * Converts inches and suuta to total decimal inches
 */
export function suutaToInches(inches: number = 0, suuta: number = 0): number {
  return Number(inches || 0) + (Number(suuta || 0) / 8);
}

/**
 * Calculates CFT for Sawn / Size Wood (সাইজ কাঠ)
 * Formula: (Length in Feet * Width in Inches * Thickness in Inches) / 144
 */
export function calculateSawnWoodCft(dims: SawnWoodDimensions): {
  cftPerPiece: number;
  totalCft: number;
  formulaDescription: string;
} {
  const totalLengthFt = Number(dims.lengthFt || 0) + (Number(dims.lengthIn || 0) / 12);
  const totalWidthIn = suutaToInches(dims.widthIn, dims.widthSuuta);
  const totalThicknessIn = suutaToInches(dims.thicknessIn, dims.thicknessSuuta);
  const qty = Number(dims.quantity || 1);

  if (totalLengthFt <= 0 || totalWidthIn <= 0 || totalThicknessIn <= 0) {
    return { cftPerPiece: 0, totalCft: 0, formulaDescription: '0 CFT' };
  }

  // (L_ft * W_in * T_in) / 144
  const cftPerPiece = (totalLengthFt * totalWidthIn * totalThicknessIn) / 144;
  const totalCft = cftPerPiece * qty;

  const formulaDescription = `${totalLengthFt.toFixed(2)}' × ${totalWidthIn.toFixed(2)}" × ${totalThicknessIn.toFixed(2)}" / 144 × ${qty} = ${totalCft.toFixed(3)} CFT`;

  return {
    cftPerPiece: Number(cftPerPiece.toFixed(4)),
    totalCft: Number(totalCft.toFixed(3)),
    formulaDescription,
  };
}

/**
 * Calculates CFT for Round Logs / Gol Kaath (গোল কাঠ / গোল লগ) using Hoppus Quarter-Girth Formula
 * Formula: ((Girth / 4) ^ 2 * Length in Feet) / 144  => (Girth^2 * Length) / 2304
 */
export function calculateRoundLogCft(dims: RoundLogDimensions): {
  cftPerPiece: number;
  totalCft: number;
  trueCylindricalCft: number;
  quarterGirthInches: number;
  formulaDescription: string;
} {
  const totalLengthFt = Number(dims.lengthFt || 0) + (Number(dims.lengthIn || 0) / 12);
  const girthIn = Number(dims.girthInches || 0);
  const qty = Number(dims.quantity || 1);

  if (totalLengthFt <= 0 || girthIn <= 0) {
    return {
      cftPerPiece: 0,
      totalCft: 0,
      trueCylindricalCft: 0,
      quarterGirthInches: 0,
      formulaDescription: '0 CFT',
    };
  }

  const quarterGirth = girthIn / 4;
  // Hoppus formula: (quarterGirth^2 * length) / 144
  const hoppusCft = (Math.pow(quarterGirth, 2) * totalLengthFt) / 144;
  const totalHoppusCft = hoppusCft * qty;

  // True cylindrical volume: (Girth^2 * Length) / (4 * PI * 144)
  const trueCylinderCft = ((Math.pow(girthIn, 2) * totalLengthFt) / (4 * Math.PI * 144)) * qty;

  const formulaDescription = `((${girthIn}" / 4)² × ${totalLengthFt.toFixed(2)}') / 144 × ${qty} = ${totalHoppusCft.toFixed(3)} CFT`;

  return {
    cftPerPiece: Number(hoppusCft.toFixed(4)),
    totalCft: Number(totalHoppusCft.toFixed(3)),
    trueCylindricalCft: Number(trueCylinderCft.toFixed(3)),
    quarterGirthInches: Number(quarterGirth.toFixed(2)),
    formulaDescription,
  };
}

/**
 * Calculates Sawmill sawing wastage
 */
export function calculateSawingWastage(roundLogCft: number, sawnTimberOutputCft: number): {
  wastageCft: number;
  wastagePercentage: number;
  recoveryPercentage: number;
} {
  if (roundLogCft <= 0) {
    return { wastageCft: 0, wastagePercentage: 0, recoveryPercentage: 0 };
  }

  const wastageCft = Math.max(0, roundLogCft - sawnTimberOutputCft);
  const wastagePercentage = (wastageCft / roundLogCft) * 100;
  const recoveryPercentage = (sawnTimberOutputCft / roundLogCft) * 100;

  return {
    wastageCft: Number(wastageCft.toFixed(3)),
    wastagePercentage: Number(wastagePercentage.toFixed(1)),
    recoveryPercentage: Number(recoveryPercentage.toFixed(1)),
  };
}

/**
 * Standard Door Size to CFT & SqFt estimate helper
 */
export function getDoorSizeMetrics(heightFt: number, widthIn: number, thicknessIn: number) {
  const widthFt = widthIn / 12;
  const sqft = heightFt * widthFt;
  const sawnCft = (heightFt * widthIn * thicknessIn) / 144;

  return {
    sqft: Number(sqft.toFixed(2)),
    sawnCft: Number(sawnCft.toFixed(3)),
  };
}

/**
 * Standard Choukhat (Door Frame) Size CFT helper
 * Standard frame runs along 2 sides (Height x 2) + 1 top (Width x 1)
 * E.g., for 7ft x 3.25ft opening, running length = 7 + 7 + 3.25 = 17.25 RFT
 */
export function getChoukhatCft(
  doorHeightFt: number,
  doorWidthFt: number,
  frameWidthIn: number = 5.5, // e.g. 5.5" wall width (ইট গাঁথুনি)
  frameThicknessIn: number = 2.25 // e.g. 2.25" thickness
): { runningFeet: number; cft: number } {
  const runningFeet = (doorHeightFt * 2) + doorWidthFt;
  const cft = (runningFeet * frameWidthIn * frameThicknessIn) / 144;

  return {
    runningFeet: Number(runningFeet.toFixed(2)),
    cft: Number(cft.toFixed(3)),
  };
}
