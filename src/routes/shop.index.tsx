import {createFileRoute} from '@tanstack/react-router';
import {PageIntro,ProductGrid} from '@/components/editorial';
import {assets,meta} from '@/lib/content';
export const Route=createFileRoute('/shop/')({head:()=>meta('Shop the Breakfast Range','Discover Millet Pap, Date Powder and Beans Flour from Kelsey Greene Foods & Agro-Allied.'),component:()=> <><PageIntro eyebrow="FOODS & AGRO-ALLIED" title="The Breakfast Range" description="Organic. No Preservatives. No Additives. Explore the breakfast range." photo={assets.breakfast}/><ProductGrid/></>});
