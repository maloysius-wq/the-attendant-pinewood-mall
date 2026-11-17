/**
 * V123 PREVIEW ONLY. Original source audition for 1979/1997 abandoned
 * department merchandise and receiving stock, not published mall layout.
 * No owner-authored Builder save is read or altered.
 */
import {MALL} from './masterplan-v66.mjs';
export const ANCHOR_STOCK_CANDIDATES_V123=Object.freeze([
  {
    "key": "folded_stock_cube",
    "label": "Original folded knitwear cube",
    "path": "assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-folded-stock-cube-unit-9651a3ff.glb",
    "sha256": "6edeccd22be0792c2d776aac66408b210c324fc4dc031bc1e6a473301b5a826e",
    "license": "CC0-1.0",
    "targetHeight": 1.18,
    "sourceUrl": "https://cdn.3dassets.dev/assets/25252/v1/model.glb",
    "role": "Original folded knitwear cube"
  },
  {
    "key": "shoe_riser",
    "label": "Shoe riser display",
    "path": "assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-shoe-riser-set-55368ed1.glb",
    "sha256": "33fec8cfb5ee6a4117eacb77d6913f5b61c4acf700393e40e72b1e886d3e6ecb",
    "license": "CC0-1.0",
    "targetHeight": 0.72,
    "sourceUrl": "https://cdn.3dassets.dev/assets/25230/v1/model.glb",
    "role": "Shoe riser display"
  },
  {
    "key": "stepped_riser",
    "label": "Countertop merchandising riser",
    "path": "assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-stepped-display-riser-8b7a9715.glb",
    "sha256": "9b89288f944065f4ff57dc824650994396a7929b056fd070e414e8d0c68c6774",
    "license": "CC0-1.0",
    "targetHeight": 0.72,
    "sourceUrl": "https://cdn.3dassets.dev/assets/25227/v1/model.glb",
    "role": "Countertop merchandising riser"
  },
  {
    "key": "promo_bin",
    "label": "Clearance promotional bin",
    "path": "assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-promotional-dump-bin-6a9cf661.glb",
    "sha256": "88b615c9f51a172d2c91dab576d8082b6c780c17c15b37ea2a7562fc772c02c7",
    "license": "CC0-1.0",
    "targetHeight": 1.02,
    "sourceUrl": "https://cdn.3dassets.dev/assets/25239/v1/model.glb",
    "role": "Clearance promotional bin"
  },
  {
    "key": "stock_box_open",
    "label": "Open back-stock carton",
    "path": "assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-cardboardboxopen.glb",
    "sha256": "960da412564774c75e7b32f9af0100895e1edb877fc1e70dd34ee2422a2196d4",
    "license": "CC0-1.0",
    "targetHeight": 0.52,
    "sourceUrl": "https://raw.githubusercontent.com/Hidencod/tge-assets/ea2f2aa1ca8da0898330c97df8a5489976b051d0/packs/furniture-kit/cardboardboxopen.glb",
    "role": "Open back-stock carton"
  },
  {
    "key": "stock_box_closed",
    "label": "Sealed back-stock carton",
    "path": "assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-cardboardboxclosed.glb",
    "sha256": "4af079dca52960912764574950f0549ff2ae1224b3db1528718629473a2d5d81",
    "license": "CC0-1.0",
    "targetHeight": 0.48,
    "sourceUrl": "https://raw.githubusercontent.com/Hidencod/tge-assets/ea2f2aa1ca8da0898330c97df8a5489976b051d0/packs/furniture-kit/cardboardboxclosed.glb",
    "role": "Sealed back-stock carton"
  },
  {
    "key": "gift_books",
    "label": "Department gift-book stack",
    "path": "assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-books.glb",
    "sha256": "b8dc56e5d29f6fc1f4727fccb1b9642627fee9942c48060a00034e98df02701c",
    "license": "CC0-1.0",
    "targetHeight": 0.33,
    "sourceUrl": "https://raw.githubusercontent.com/Hidencod/tge-assets/ea2f2aa1ca8da0898330c97df8a5489976b051d0/packs/furniture-kit/books.glb",
    "role": "Department gift-book stack"
  },
  {
    "key": "cube_block",
    "label": "Small counter display cube",
    "path": "assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-cube-display-block-561b48be.glb",
    "sha256": "23fa5f0043dfff384d481c4e66f0526ba8f8ec72d6dfa465df6f5d553c2df2eb",
    "license": "CC0-1.0",
    "targetHeight": 0.77,
    "sourceUrl": "https://cdn.3dassets.dev/assets/25226/v1/model.glb",
    "role": "Small counter display cube"
  }
].map(x=>Object.freeze(x)));
export function validateAnchorStockSourcesV123(candidates=ANCHOR_STOCK_CANDIDATES_V123){
 const issues=[],ids=new Set(),paths=new Set();
 if(candidates.length!==8)issues.push('expected eight independently licensed stock candidate GLBs');
 for(const a of candidates){
  if(ids.has(a.key)||paths.has(a.path))issues.push('duplicate stock candidate '+a.key);
  ids.add(a.key);paths.add(a.path);
  if(!a.path.startsWith('assets/vendor/builder/models/')||!a.path.endsWith('.glb')||
   !/^[a-f0-9]{64}$/.test(a.sha256)||a.license!=='CC0-1.0'||
   !(a.targetHeight>.20&&a.targetHeight<1.5))
   issues.push('unlicensed/unscaled physical merchandise candidate '+a.key);
 }
 if(MALL.rooms.length!==41||MALL.evidence.length!==9)issues.push('lost original story data');
 return issues;
}
