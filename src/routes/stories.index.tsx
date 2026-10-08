import {createFileRoute} from '@tanstack/react-router';
import {ContentHub} from '@/components/content-hub';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/stories/')({head:()=>meta('stories','Discover stories from Kelsey Greene Group and the 1 Million Breakfast Movement.'),component:()=> <ContentHub kind="story"/>});
