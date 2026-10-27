/**
 * Utilidades matemáticas para la simulación económica de la Tragedia de los Comunes.
 * Modela la función de utilidad individual logarítmica y la utilidad colectiva final.
 */

/**
 * Calcula el pago en confites para una elección x: round(ln(x))
 * Evita que un jugador egoísta vacíe el bote en una sola jugada
 * y modela la utilidad marginal decreciente.
 */
export function calculateLn(x: number): number {
  if (x <= 0) return 0;
  return Math.round(Math.log(x));
}

/**
 * Valor continuo de ln(x) para fines educativos y comparativos
 */
export function calculateLnFloat(x: number): number {
  if (x <= 0) return 0;
  return Math.log(x);
}

/**
 * Calcula el bono final repartido a todos los jugadores según lo que quedó en el bote:
 * round(ln(remanente)) si remanente > 0, de lo contrario 0.
 */
export function calculateRemainingBonus(remainingCandies: number): number {
  if (remainingCandies <= 0) return 0;
  return Math.round(Math.log(remainingCandies));
}

/**
 * Ejecuta el cálculo utilizando Python con la librería math a través del endpoint del servidor,
 * con fallback instantáneo al cálculo local de alta precisión.
 */
export async function calculateWithPython(x: number): Promise<{ x: number; lnX: number; raw: number; isPython: boolean }> {
  try {
    const res = await fetch(`/api/math/log?x=${encodeURIComponent(x)}`, {
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        x: data.x,
        lnX: data.rounded,
        raw: data.raw,
        isPython: true,
      };
    }
  } catch {
    // Fallback fluido y seguro
  }

  const raw = calculateLnFloat(x);
  return {
    x,
    lnX: calculateLn(x),
    raw,
    isPython: false,
  };
}
