
import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

const Toaster = (props: React.ComponentPropsWithoutRef<typeof SonnerToaster>) => {
  return <SonnerToaster theme="light" {...props} />;
};

export { Toaster };