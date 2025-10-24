import { motion } from 'framer-motion';
import { type PropsWithChildren, useMemo } from 'react';
import { useViewport } from '../utils/viewport.ts';

const Box = (
    props: PropsWithChildren & {
        key?: string | number;
        value: number;
    }
) => {
    const viewport = useViewport();

    const scrollFactor = useMemo(() => {
        if (viewport.width >= 768) {
            return 60;
        } else {
            return 40;
        }
    }, [viewport.width]);

    const row1 = useMemo(() => {
        const digits = [];
        for (let i = 0; i <= 9; i++) {
            digits.push(
                <div
                    key={i}
                    className="h-10 md:h-16 flex justify-center items-center text-4xl md:text-6xl font-mono"
                >
                    {i}
                </div>
            );
        }
        return digits;
    }, []);

    const row2 = useMemo(() => {
        const digits = [];
        for (let i = 0; i <= 9; i++) {
            digits.push(
                <div
                    key={i}
                    className="h-10 md:h-16 flex justify-center items-center text-4xl md:text-6xl font-mono"
                >
                    {i}
                </div>
            );
        }
        return digits;
    }, []);

    const translateRow1 = useMemo(() => {
        const digit = Math.floor(props.value / 10);
        return -digit * scrollFactor;
    }, [props.value, scrollFactor]);

    const translateRow2 = useMemo(() => {
        const digit = props.value % 10;
        return -digit * scrollFactor;
    }, [props.value, scrollFactor]);

    return (
        <div
            className="flex h-15 md:h-20 overflow-hidden [mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]"
            style={{
                // @ts-expect-error ignore it
                '--scroll-shadow-size': '20px'
            }}
        >
            <motion.div
                className="flex flex-col pt-3 px-2"
                animate={{ y: translateRow1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {row1}
            </motion.div>
            <motion.div
                className="flex flex-col pt-3 px-2"
                animate={{ y: translateRow2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {row2}
            </motion.div>
        </div>
    );
};

const Clock = (props: {
    value: {
        hours: number;
        minutes: number;
        seconds: number;
    };
}) => {
    const { hours, minutes, seconds } = props.value;
    return (
        <div className="flex justify-center items-center gap-4">
            <Box value={hours} />
            <div className="text-4xl md:text-6xl font-mono">:</div>
            <Box value={minutes} />
            <div className="text-4xl md:text-6xl font-mono">:</div>
            <Box value={seconds} />
        </div>
    );
};

export default Clock;
