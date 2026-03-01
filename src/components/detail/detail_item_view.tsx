import type { ListItemData } from '../../types';
import { Detail } from './detail';
import { DetailMetadata } from './detail_metadata';
import { renderMetadataEntry } from './render_metadata';

export function DetailItemView({ item }: { item: ListItemData }) {
  const itemDetail = item.detail;
  if (!itemDetail) return null;
  return (
    <Detail
      markdown={itemDetail.markdown}
      metadata={
        itemDetail.metadata ? (
          <DetailMetadata>
            {itemDetail.metadata.map(renderMetadataEntry)}
          </DetailMetadata>
        ) : undefined
      }
    />
  );
}
