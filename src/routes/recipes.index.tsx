import {createFileRoute} from '@tanstack/react-router';
import {ContentHub} from '@/components/content-hub';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/recipes/')({head:()=>meta('recipes','Discover recipes from Kelsey Greene Group and the 1 Million Breakfast Movement.'),component:()=> <ContentHub kind="recipe"/>});
