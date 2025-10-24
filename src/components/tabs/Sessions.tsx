import {
    addToast,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    TimeInput,
    useDisclosure
} from '@heroui/react';
import { Time } from '@internationalized/date';
import { Clock, MoveRight, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { TimeFormatter } from '../../utils/date.ts';
import { type DbSession, useStudyStore } from '../../utils/store.ts';

const dateToTime = (date: Date): Time => {
    return new Time(date.getHours(), date.getMinutes(), date.getSeconds());
};

const SessionCard = (props: { session: DbSession }) => {
    const viewModal = useDisclosure();
    const studyState = useStudyStore();

    const duration = useMemo(() => {
        const duration = dateToTime(props.session.endTime).subtract({
            hours: props.session.startTime.getHours(),
            minutes: props.session.startTime.getMinutes(),
            seconds: props.session.startTime.getSeconds()
        });

        return duration;
    }, [props.session]);

    const formatter = useMemo(() => {
        return new TimeFormatter();
    }, []);

    const deleteSession = useCallback(async () => {
        const result = await studyState.deleteSession(props.session.id);
        if (!result) {
            return addToast({
                title: 'Error',
                description: `Failed to delete the session "${props.session.name}".`,
                color: 'danger'
            });
        }

        addToast({
            title: 'Session deleted',
            description: `The session "${props.session.name}" has been deleted.`,
            color: 'success'
        });
    }, [props.session, studyState]);

    return (
        <>
            <Card className="max-w-sm" isPressable onPress={viewModal.onOpen}>
                <CardHeader className="justify-between">
                    <div className="flex flex-col items-start gap-1">
                        <h3 className="text-lg font-medium">{props.session.name}</h3>
                        <Chip size="sm">{props.session.subject}</Chip>
                    </div>
                    <Button
                        color="danger"
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={deleteSession}
                    >
                        <Trash2 size={20} />
                    </Button>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex items-center justify-between gap-4">
                        <TimeInput
                            defaultValue={dateToTime(props.session.startTime)}
                            startContent={
                                <Clock
                                    className="text-default-500 pointer-events-none shrink-0"
                                    size={20}
                                />
                            }
                            className="w-fit"
                            isReadOnly
                        />
                        <MoveRight />
                        <TimeInput
                            defaultValue={dateToTime(props.session.endTime)}
                            startContent={
                                <Clock
                                    className="text-default-500 pointer-events-none shrink-0"
                                    size={20}
                                />
                            }
                            className="w-fit"
                            isReadOnly
                        />
                    </div>
                </CardBody>
                <Divider />
                <CardFooter className="justify-between text-sm">
                    <p className="text-zinc-300">Duration</p>
                    <p className="font-medium">{formatter.formatRange(duration)}</p>
                </CardFooter>
            </Card>

            <Modal {...viewModal} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {props.session.name}
                                <Chip size="sm">{props.session.subject}</Chip>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <TimeInput
                                            defaultValue={dateToTime(props.session.startTime)}
                                            startContent={
                                                <Clock
                                                    className="text-default-500 pointer-events-none shrink-0"
                                                    size={20}
                                                />
                                            }
                                            className="w-fit"
                                            isReadOnly
                                        />
                                        <MoveRight />
                                        <TimeInput
                                            defaultValue={dateToTime(props.session.endTime)}
                                            startContent={
                                                <Clock
                                                    className="text-default-500 pointer-events-none shrink-0"
                                                    size={20}
                                                />
                                            }
                                            className="w-fit"
                                            isReadOnly
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-lg font-medium text-zinc-100">Notes</h4>
                                        <p className="text-zinc-400">{props.session.notes}</p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={() => {
                                        deleteSession();
                                        onClose();
                                    }}
                                    startContent={<Trash2 size={20} />}
                                >
                                    Delete Session
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

const groupByDay = (sessions: DbSession[]) => {
    const grouped: Record<string, DbSession[]> = {};

    for (const session of sessions) {
        const day = session.startTime.toISOString().split('T')[0];

        if (!grouped[day]) {
            grouped[day] = [];
        }

        grouped[day].push(session);
    }

    return grouped;
};

// const dummySessions: Session[] = [
//     {
//         name: 'Session 1',
//         subject: 'Math',
//         startTime: new Date(2024, 5, 1, 10, 0),
//         endTime: new Date(2024, 5, 1, 11, 30),
//         notes: 'Studied algebra and geometry.'
//     },
//     {
//         name: 'Session 2',
//         subject: 'Science',
//         startTime: new Date(2024, 5, 1, 12, 0),
//         endTime: new Date(2024, 5, 1, 13, 15),
//         notes: 'Reviewed physics concepts.'
//     },
//     {
//         name: 'Session 3',
//         subject: 'History',
//         startTime: new Date(2024, 5, 2, 9, 0),
//         endTime: new Date(2024, 5, 2, 10, 45),
//         notes: 'Learned about ancient civilizations.'
//     },
//     {
//         name: 'Session 4',
//         subject: 'English',
//         startTime: new Date(2024, 5, 2, 11, 0),
//         endTime: new Date(2024, 5, 2, 12, 30),
//         notes: 'Read and analyzed classic literature.'
//     },
//     {
//         name: 'Session 5',
//         subject: 'Art',
//         startTime: new Date(2024, 5, 3, 14, 0),
//         endTime: new Date(2024, 5, 3, 15, 30),
//         notes: 'Practiced sketching and painting techniques.'
//     }
// ];

const Sessions = () => {
    const studyState = useStudyStore();

    const groupedSessions = useMemo(() => {
        return groupByDay(studyState.sessions);
    }, [studyState.sessions]);

    const dateFormatter = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }, []);

    const sortedSessions = useMemo(() => {
        const sortedDays = Object.keys(groupedSessions).sort((a, b) => {
            return new Date(b).getTime() - new Date(a).getTime();
        });

        const sorted: Record<string, DbSession[]> = {};

        for (const day of sortedDays) {
            const sessions = groupedSessions[day].sort((a, b) => {
                return a.startTime.getTime() - b.startTime.getTime();
            });
            sorted[day] = sessions;
        }

        return sorted;
    }, [groupedSessions]);

    return (
        <div className="h-full w-full p-6 flex flex-col gap-6 overflow-y-scroll">
            <div className="flex flex-col gap-2">
                <h2 className="text-zinc-100 text-3xl font-medium">Study sessions</h2>
                <h3 className="text-zinc-300">{studyState.sessions.length} sessions recorded</h3>
            </div>
            <div className="flex flex-col gap-6 overflow-y-auto">
                {Object.entries(sortedSessions).map(([day, sessions]) => (
                    <div key={day} className="flex flex-col gap-4">
                        <h4 className="text-zinc-200 text-xl font-semibold">
                            {dateFormatter.format(new Date(day))}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sessions.map((session) => (
                                <SessionCard key={session.name} session={session} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sessions;
