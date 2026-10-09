import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
const {save,records}=vi.hoisted(()=>({save:vi.fn(),records:[{id:'currency-id',kind:'setting',slug:'currency',title:'Currency configuration',description:'',status:'published',position:0,seo_title:'',seo_description:'',payload:{primary:'ESPEE',ngn_per_espee:2050,usd_per_espee:1.54,ghs_per_espee:18.14}},{id:'business-id',kind:'business',slug:'foods-agro-allied',title:'Foods & Agro-Allied',description:'',payload:{},status:'published'},{id:'product-id',kind:'product',slug:'plain-millet-pap',title:'Millet Pap — Plain',description:'',status:'published',position:1,seo_title:'',seo_description:'',payload:{price_espee:50,size:'50g',business_slug:'foods-agro-allied',category:'Foods & Agro-Allied',listing_type:'product',image:'plain'}}]}));
vi.mock('@tanstack/react-query',()=>({useQuery:()=>({data:{records,roles:['admin'],enquiries:[],applications:[],versions:[],logs:[]},error:null,isPending:false}),useQueryClient:()=>({invalidateQueries:vi.fn(),cancelQueries:vi.fn(),clear:vi.fn()})}));
vi.mock('@tanstack/react-start',()=>({useServerFn:()=>save}));
vi.mock('@/lib/platform.functions',()=>({getAdminData:vi.fn(),saveContent:vi.fn(),reviewApplication:vi.fn()}));
vi.mock('@/components/site-shell',()=>({Brand:()=> <a>Kelsey Greene Group</a>}));
vi.mock('@/components/site-provider',()=>({useSite:()=>({user:null})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{auth:{signOut:vi.fn()}}}));
vi.mock('@tanstack/react-router',()=>({Link:({children,to,...props}:{children:React.ReactNode;to:string})=><a href={to} {...props}>{children}</a>}));
vi.mock('@/lib/content',()=>({payload:(r:{payload?:Record<string,unknown>})=>r?.payload??{},image:()=>'/test.jpg'}));
import {AdminWorkspace} from '@/components/admin-workspace';
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('Administration workspace',()=>{
 it('renders live overview counts and dedicated navigation',()=>{render(<AdminWorkspace/>);expect(screen.getByRole('heading',{name:'Content overview'})).toBeTruthy();expect(screen.getByRole('navigation',{name:'Workspace navigation'})).toBeTruthy();expect(screen.getByText('1 catalogue items')).toBeTruthy();expect(screen.getByText('No drafts awaiting review.')).toBeTruthy();});
 it('saves editable currency conversions through the protected save action',async()=>{save.mockResolvedValue({id:'currency-id'});const {container}=render(<AdminWorkspace/>);fireEvent.click(screen.getByRole('button',{name:'Settings & users'}));fireEvent.click(screen.getByRole('button',{name:'Currency settings'}));fireEvent.change(screen.getByLabelText('NGN per 1 ESPEE'),{target:{value:'2100'}});const form=container.querySelector('form');if(!form)throw new Error('Missing editor');fireEvent.submit(form);await waitFor(()=>expect(save).toHaveBeenCalledWith({data:expect.objectContaining({payload:expect.objectContaining({ngn_per_espee:2100,usd_per_espee:1.54})})}));});
 it('exposes product price and sizing inputs',()=>{render(<AdminWorkspace/>);fireEvent.click(screen.getByRole('button',{name:'Marketplace catalogue'}));fireEvent.click(screen.getByRole('button',{name:/^Edit$/}));expect((screen.getByLabelText('Price (ESPEE)') as HTMLInputElement).value).toBe('50');expect((screen.getByLabelText('Pack size / apparel sizes / dimensions') as HTMLInputElement).value).toBe('50g');});
});
