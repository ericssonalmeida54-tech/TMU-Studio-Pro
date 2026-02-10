import { Motion } from '../types/types';

export interface ErgonomicResult {
  riskLevel: 'High' | 'Medium' | 'Low';
  message: string;
  suggestion?: string;
}

export const analyzeErgonomics = (motion: Motion): ErgonomicResult => {
  const code = motion.code.toUpperCase();

  // 1. High Risk: Heavy Body Motions or difficult positions
  if (code.startsWith('B') || code.startsWith('K') || code.startsWith('S')) {
    // Body motions like Bend, Kneel, Stoop
    return {
      riskLevel: 'High',
      message: 'Movimento corporal repetitivo ou forçado.',
      suggestion: 'Evitar curvar/agachar. Elevar a altura de trabalho.'
    };
  }

  // 2. High Risk: Heavy Lifting or High Force
  if (code.includes('W') && parseFloat(motion.desc.match(/(\d+)kg/)?.[1] || '0') > 5) {
      // Weight logic is tricky without explicit weight param, but MTM often implies weight in Move
      // Let's use Move with weight factors if we had them.
      // For standard MTM-1, "M" with weight is usually noted.
      // Assuming simple codes for now.
  }

  // 3. Medium Risk: Long Reaches (>50cm)
  if (code.startsWith('R')) {
      const dist = parseInt(code.match(/\d+/)?.[0] || '0');
      if (dist > 50) {
          return {
              riskLevel: 'Medium',
              message: `Alcance longo (${dist}cm).`,
              suggestion: 'Aproximar materiais (<40cm) para Zona de Trabalho Normal.'
          };
      }
      if (code.includes('C') || code.includes('D')) {
           return {
              riskLevel: 'Medium',
              message: 'Alcance complexo/preciso.',
              suggestion: 'Melhorar disposição/pega das peças.'
          };
      }
  }

  // 4. Medium Risk: Position (Tight fits)
  if (code.startsWith('P') && (code.includes('2') || code.includes('3'))) {
      return {
          riskLevel: 'Medium',
          message: 'Posicionamento justo ou firme.',
          suggestion: 'Usar guias, chanfros ou dispositivos de fixação.'
      };
  }

  // 5. Medium Risk: Apply Pressure
  if (code.startsWith('AP')) {
      return {
          riskLevel: 'Medium',
          message: 'Aplicação de força excessiva.',
          suggestion: 'Usar ferramentas de alavanca ou automação.'
      };
  }

  return {
    riskLevel: 'Low',
    message: 'Movimento padrão.',
  };
};
