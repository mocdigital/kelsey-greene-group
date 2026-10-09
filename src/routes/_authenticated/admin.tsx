import {createFileRoute} from '@tanstack/react-router';
import {AdminWorkspace} from '@/components/admin-workspace';
import '@/components/admin-workspace.css';
import {meta} from '@/lib/content';
export const Route=createFileRoute('/_authenticated/admin')({head:()=>meta('Content workspace','Manage Kelsey Greene Group pages, catalogue, properties, initiatives and publishing reviews.'),component:AdminWorkspace});
