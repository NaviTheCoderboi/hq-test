import {
    addToast,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    cn,
    Switch
} from '@heroui/react';
import { Clock as ClockI } from 'lucide-react';
import { useMemo } from 'react';
import { useStudyStore } from '../../utils/store.ts';
import { changeURL } from '../../utils/url.ts';
import Clock from '../Clock.tsx';
import SessionsForm from '../SessionsForm.tsx';

const Home = () => {
    const studyState = useStudyStore();

    const time = useMemo(() => studyState.time, [studyState.time]);

    const sessionCardColor = useMemo(() => {
        switch (studyState.state) {
            case 'running':
                return {
                    bg: 'bg-emerald-950/30',
                    text1: 'text-emerald-100',
                    text2: 'text-emerald-100/90'
                };
            case 'paused':
                return {
                    bg: 'bg-yellow-950/30',
                    text1: 'text-yellow-100',
                    text2: 'text-yellow-100/90'
                };
            case 'idle':
                return {
                    bg: 'bg-red-950/30',
                    text1: 'text-red-100',
                    text2: 'text-red-100/90'
                };
            default:
                return {
                    bg: 'bg-red-950/30',
                    text1: 'text-red-100',
                    text2: 'text-red-100/90'
                };
        }
    }, [studyState.state]);

    const focusCardColor = useMemo(() => {
        if (studyState.focusMode) {
            return {
                bg: 'bg-blue-950/30',
                text1: 'text-blue-100',
                text2: 'text-blue-100/90'
            };
        } else {
            return {
                bg: 'bg-zinc-800/30',
                text1: 'text-zinc-100',
                text2: 'text-zinc-100/90'
            };
        }
    }, [studyState.focusMode]);

    return (
        <div className="h-full w-full flex flex-col gap-12 p-6 overflow-y-scroll">
            <div className="flex flex-col items-center justify-center gap-6 mx-auto w-fit p-12 backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <h2 className="flex justify-center items-center gap-2 text-zinc-300">
                    <ClockI />
                    Study Timer
                </h2>
                <Clock value={time} />
                <SessionsForm />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
                <Card className="h-full p-4 bg-indigo-950/30">
                    <CardHeader className="text-indigo-100">Current session</CardHeader>
                    <CardBody>
                        <p className="text-indigo-100/90 min-h-20">
                            You have been studying for {time.hours} hours, {time.minutes} minutes,
                            and {time.seconds} seconds.
                        </p>
                        <p className="text-indigo-100/90">
                            Current subject: {studyState.currentSession?.subject || 'N/A'}
                        </p>
                    </CardBody>
                    <CardFooter>
                        <Button
                            color="secondary"
                            onPress={() => {
                                const newURL = new URL(window.location.href);
                                newURL.searchParams.set('tab', 'sessions');
                                changeURL(newURL.toString());
                            }}
                            isDisabled={!studyState.currentSession}
                        >
                            View Details
                        </Button>
                    </CardFooter>
                </Card>
                <Card className={cn('h-full p-4', sessionCardColor.bg)}>
                    <CardHeader className={cn(sessionCardColor.text1)}>Status</CardHeader>
                    <CardBody>
                        <p className={cn(sessionCardColor.text2)}>
                            {(() => {
                                switch (studyState.state) {
                                    case 'running':
                                        return 'You are currently in a study session. Keep up the good work!';
                                    case 'paused':
                                        return 'Your study session is paused. Take a deep breath and get ready to resume!';
                                    case 'idle':
                                        return 'You are not in a study session. Start a new session to boost your productivity!';
                                    default:
                                        return 'Status unknown. Please check your study session.';
                                }
                            })()}
                        </p>
                    </CardBody>
                </Card>
                <Card className={cn('h-full p-4', focusCardColor.bg)}>
                    <CardHeader className={cn('justify-between', focusCardColor.text1)}>
                        Mode{' '}
                        <Switch
                            size="lg"
                            color="success"
                            isSelected={studyState.focusMode}
                            onValueChange={async (v) => {
                                const result = await studyState.setFocusMode(v);

                                if (result) {
                                    return addToast({
                                        title: `Focus Mode ${v ? 'Enabled' : 'Disabled'}`,
                                        description: `Focus Mode has been ${v ? 'enabled' : 'disabled'}.`,
                                        color: 'success'
                                    });
                                }

                                addToast({
                                    title: `Focus Mode Change Failed`,
                                    description: `Failed to ${v ? 'enable' : 'disable'} Focus Mode.`,
                                    color: 'danger'
                                });
                            }}
                        />
                    </CardHeader>
                    <CardBody>
                        <p className={cn(focusCardColor.text2)}>
                            Focus Mode is {studyState.focusMode ? 'enabled' : 'disabled'}.
                            Notifications are {studyState.focusMode ? 'silenced' : 'not silenced'}{' '}
                            to help you
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Home;
