import {createFileRoute} from '@tanstack/react-router';
import {Marketplace} from '@/components/marketplace';
import '@/components/marketplace.css';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/shop/')({head:()=>meta('Marketplace','Explore Kelsey Greene Group products and property listings across six businesses, with prices in ESPEE, naira, dollars and Ghana cedis.'),component:Marketplace});
