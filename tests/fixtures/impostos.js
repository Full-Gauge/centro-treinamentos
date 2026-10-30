export function taxSimulation(cursoId = "TURMA-001", dataCalculo = "2026-10-29") {
  const tax = (codigo, valor, aliquotaOuValor, retido = false) => ({
    codigo, descricao: codigo, grupo: "Impostos", unidade: "%", aliquotaOuValor, valor, retido
  });
  return {
    cursoId, dataCalculo, moeda: "BRL", quantidade: 1,
    calculadoEm: `${dataCalculo}T12:00:00Z`, calculoId: "CALC-TEST",
    cenarios: [
      { tipo: "PF", descricao: "Pessoa Física", valorCurso: 1200, retencoes: 0, liquidoAPagar: 1200,
        impostos: [tax("ISSQN", 36, 3)] },
      { tipo: "PJ", descricao: "Pessoa Jurídica", valorCurso: 1200, retencoes: 73.8, liquidoAPagar: 1126.2,
        impostos: [tax("IRRF", 18, 1.5, true), tax("PCC", 55.8, 4.65, true), tax("ISSQN", 36, 3)] },
      { tipo: "PJ_CANOAS", descricao: "Pessoa Jurídica (Canoas)", valorCurso: 1200, retencoes: 109.8, liquidoAPagar: 1090.2,
        impostos: [tax("IRRF", 18, 1.5, true), tax("PCC", 55.8, 4.65, true), tax("ISSQN", 36, 3, true)] }
    ]
  };
}
