import { CpuIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const systemMonitorExtension: ExtensionManifest = {
  id: 'system-monitor',
  name: 'System Monitor',
  icon: CpuIcon(),
  description:
    'Monitor your system resources in real-time. Check CPU usage, memory, disk space, and network activity.',
  author: 'Raycast',
  commands: [
    {
      name: 'system-monitor',
      title: 'System Monitor',
      subtitle: 'CPU, Memory, Disk',
      icon: CpuIcon(),
      keywords: [
        'system',
        'monitor',
        'cpu',
        'memory',
        'disk',
        'network',
      ],
      mode: 'no-view',
      section: 'Commands',
      accessories: [
        {
          tag: {
            text: 'System',
            color: 'orange',
          },
        },
        { text: 'Raycast' },
      ],
      detail: {
        markdown: `# System Monitor

Monitor your system resources in real-time. Check CPU usage, memory, disk space, and network activity.`,
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
