import { HeroUIProvider, ToastProvider } from '@heroui/react';
import type { PropsWithChildren } from 'react';

const Providers = (props: PropsWithChildren) => {
    return (
        <HeroUIProvider>
            <ToastProvider placement="top-center" />
            {props.children}
        </HeroUIProvider>
    );
};

export default Providers;
