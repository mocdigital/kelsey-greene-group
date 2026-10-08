import {createFileRoute,Link} from '@tanstack/react-router';
import {Button} from '@/components/ui/button';
import {EnquiryForm} from '@/components/enquiry-form';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/checkout')({head:()=>meta('Ordering & Product Enquiries','Connect with the product team while Kelsey Greene online ordering is being configured.'),component:()=> <><section className="section"><div className="container legal-content"><h1>Let’s get breakfast started.</h1><div className="notice">Online payments, subscriptions and delivery are not yet available. No order or payment has been placed. Send your product requirements to the team below.</div><Button variant="outline" asChild><Link to="/cart">Return to your bag</Link></Button></div></section><EnquiryForm/></>});
