import { CalculatorIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const calculatorExtension: ExtensionManifest = {
  id: 'calculator',
  name: 'Calculator',
  icon: CalculatorIcon(),
  description:
    'Perform quick calculations right from the command bar. Supports basic arithmetic, percentages, and unit conversions.',
  author: 'Raycast',
  commands: [
    {
      name: 'calculator',
      title: 'Calculator',
      subtitle: 'Quick Calculations',
      icon: CalculatorIcon(),
      keywords: [
        'calculate',
        'math',
        'arithmetic',
      ],
      mode: 'no-view',
      section: 'Commands',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Calculator

Perform quick calculations right from the command bar. Supports basic arithmetic, percentages, and unit conversions.`,
        metadata: [
          {
            type: 'label',
            title: 'Application',
            text: 'Raycast',
          },
          {
            type: 'label',
            title: 'Type',
            text: 'Command',
          },
        ],
      },
    },
  ],
};
