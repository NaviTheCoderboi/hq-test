import { type PropsWithChildren, useMemo } from 'react';

export const Show = (props: PropsWithChildren<{ when?: boolean | null }>) => {
    const content = useMemo(() => {
        if (props.when) {
            return props.children;
        }
        return null;
    }, [props.when, props.children]);

    return <>{content}</>;
};
