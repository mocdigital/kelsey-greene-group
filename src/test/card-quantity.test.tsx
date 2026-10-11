import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuantityStepper, BagToggle } from '@/components/editorial';
import type { ContentRecord } from '@/lib/content';

const change=vi.fn(),add=vi.fn();
vi.mock('@/components/site-provider',()=>({useSite:()=>({cart:[{slug:'test-product',quantity:3}],change,add})}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('Card bag quantities',()=>{
 it('increments, decrements and allows replacing the typed number',()=>{
  render(<QuantityStepper value={3} min={0} label="Test product" onChange={change}/>);
  fireEvent.click(screen.getByRole('button',{name:'Increase Test product'}));expect(change).toHaveBeenLastCalledWith(4);
  fireEvent.click(screen.getByRole('button',{name:'Decrease Test product'}));expect(change).toHaveBeenLastCalledWith(2);
  const input=screen.getByRole('spinbutton');fireEvent.change(input,{target:{value:''}});fireEvent.change(input,{target:{value:'12'}});fireEvent.blur(input);expect(change).toHaveBeenLastCalledWith(12);
 });
 it('allows zero removal, clamps high values and recovers an empty entry',()=>{
  render(<QuantityStepper value={1} min={0} label="Test" onChange={change}/>);
  fireEvent.click(screen.getByRole('button',{name:'Decrease Test'}));expect(change).toHaveBeenLastCalledWith(0);
  const input=screen.getByRole('spinbutton');fireEvent.change(input,{target:{value:'200'}});fireEvent.keyDown(input,{key:'Enter'});expect(change).toHaveBeenLastCalledWith(99);
  fireEvent.change(input,{target:{value:''}});fireEvent.blur(input);expect(input).toHaveValue(1);
 });
 it('offers quantity controls and a direct remove button on a bagged card',()=>{
  render(<BagToggle product={{slug:'test-product',title:'Test product'} as ContentRecord}/>);
  expect(screen.getByRole('spinbutton')).toHaveValue(3);
  fireEvent.click(screen.getByRole('button',{name:'Remove Test product from bag'}));expect(change).toHaveBeenCalledWith('test-product',0);
 });
});