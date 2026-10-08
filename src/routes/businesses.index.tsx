import { createFileRoute } from '@tanstack/react-router';
import { PageIntro,BusinessExplorer } from '@/components/editorial';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/businesses/')({head:()=>meta('Our Businesses','Explore the six businesses in the Kelsey Greene Group portfolio.'),component:()=> <><PageIntro eyebrow="OUR PORTFOLIO" title="Distinct businesses. Shared purpose." description="Six business pillars. One corporate identity. Connected by quality, integrity and long-term value."/><BusinessExplorer directory/></>});
