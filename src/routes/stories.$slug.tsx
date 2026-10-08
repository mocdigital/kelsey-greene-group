import {createFileRoute} from '@tanstack/react-router';
import {ContentDetail} from '@/components/content-hub';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/stories/$slug')({head:({params})=>meta(params.slug.replaceAll('-',' '),'Explore a story from Kelsey Greene Group.'),component:Page});
function Page(){const {slug}=Route.useParams();return <ContentDetail kind="story" slug={slug}/>}
