import { ColorPickerView } from '../../components/color_picker/color_picker_view';
import { PaletteIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const colorPickerExtension: ExtensionManifest = {
  id: 'color-picker',
  name: 'Color Picker',
  icon: PaletteIcon(),
  description: 'Pick colors from a palette and copy their hex values.',
  author: 'Raycast',
  commands: [
    {
      name: 'color-picker',
      title: 'Color Picker',
      subtitle: 'Pick Colors',
      icon: PaletteIcon(),
      keywords: [
        'color',
        'picker',
        'palette',
        'hex',
        'rgb',
      ],
      mode: 'view',
      component: ColorPickerView,
      fullView: true,
      section: 'Commands',
      accessories: [{ text: 'Raycast' }],
    },
  ],
};
