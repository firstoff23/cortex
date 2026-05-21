export function gradeCost(custoReal, budgetMaximo) {
  const cost = Number(custoReal) || 0;
  const budget = Number(budgetMaximo) || 0;

  return {
    withinBudget: cost <= budget,
    cost,
    budget,
  };
}
