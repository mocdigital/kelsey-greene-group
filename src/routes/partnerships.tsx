import {createFileRoute} from '@tanstack/react-router';
import {PageIntro,PartnershipsSection} from '@/components/editorial';
import {EnquiryForm} from '@/components/enquiry-form';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/partnerships')({head:()=>meta('Partnerships','Connect with Kelsey Greene Group through retail, distribution, supply, strategic partnerships and sponsorship.'),component:()=> <><PageIntro eyebrow="PARTNERSHIPS" title="Shared interests. New possibilities." description="Commercial relationships, new markets and long-term opportunity across our diversified portfolio."/><PartnershipsSection/><EnquiryForm/></>});
