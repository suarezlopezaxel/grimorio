import React from 'react';

export function Divider({
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`divider ${className}`} />;
}
