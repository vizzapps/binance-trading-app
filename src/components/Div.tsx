import React from 'react';

export interface  Params{
  children?: any,
  className?: any,
  style?: any
}
// @ts-ignore
const Div = ({children, className, style} : Params) => {
  return (
    <div style={{display:'flex', ...style}} className={className}>{children}</div>
  )
};
export default Div;
