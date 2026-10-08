import {createFileRoute} from '@tanstack/react-router';
import {EnquiryForm} from '@/components/enquiry-form';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/enquiry')({head:()=>meta('Contact & Enquiries','Start the right conversation with Kelsey Greene Group about products, businesses and partnerships.'),component:EnquiryForm});
