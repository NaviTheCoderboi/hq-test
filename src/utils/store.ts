import { createStore } from 'floppy-disk';

export interface Session {
    name: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
}

export interface DbSession extends Session {
    id: number;
}

const parseSessionToString = (session: Session): string => {
    return JSON.stringify({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString()
    });
};

const parseStringToSession = (sessionStr: string): Session => {
    const parsed = JSON.parse(sessionStr);
    return {
        ...parsed,
        startTime: new Date(parsed.startTime),
        endTime: new Date(parsed.endTime)
    };
};

interface StudyStore {
    sessions: DbSession[];
    currentSession: Session | null;
    state: 'idle' | 'paused' | 'running';
    focusMode: boolean;
    // clock
    time: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    timer: ReturnType<typeof setInterval> | null;

    startSession: (name: string, subject: string) => boolean;
    pauseSession: () => void;
    resumeSession: () => void;
    stopSession: (notes?: string) => Promise<boolean>;
    deleteSession: (id: number) => Promise<boolean>;
    setFocusMode: (enabled: boolean) => Promise<boolean>;

    refreshSessions: () => Promise<void>;

    // clock
    startTimer: () => void;
    stopTimer: () => void;
    pauseTimer: () => void;
}

export const useStudyStore = createStore<StudyStore>(({ get, set }) => ({
    sessions: [],
    currentSession: null,
    state: 'idle',
    focusMode: false,
    // clock
    time: { hours: 0, minutes: 0, seconds: 0 },
    timer: null as ReturnType<typeof setInterval> | null,

    startSession: (name: string, subject: string) => {
        const { startTimer } = get();

        const newSession: Session = {
            name,
            subject,
            startTime: new Date(),
            endTime: new Date()
        };
        set({ currentSession: newSession, state: 'running' });
        startTimer();

        return true;
    },
    pauseSession: () => {
        const { currentSession, pauseTimer } = get();
        if (currentSession) {
            set({ state: 'paused' });
            pauseTimer();
        }
    },
    resumeSession: () => {
        const { currentSession, startTimer } = get();
        if (currentSession) {
            set({ state: 'running' });
            startTimer();
        }
    },
    stopSession: async (notes?: string) => {
        const { currentSession, refreshSessions, stopTimer } = get();
        if (currentSession) {
            const endedSession = {
                ...currentSession,
                endTime: new Date(),
                notes
            };

            const result = await saucer.exposed.createSession(parseSessionToString(endedSession));
            if (!result) return false;

            set({
                currentSession: null,
                state: 'idle'
            });
            await refreshSessions();
            stopTimer();
        }

        return true;
    },
    deleteSession: async (id: number) => {
        const { sessions, refreshSessions } = get();

        const sessionExists = sessions.find((s) => s.id === id);
        if (!sessionExists) return false;

        const result = await saucer.exposed.deleteSession(id);
        if (!result) return false;

        await refreshSessions();

        return true;
    },
    setFocusMode: async (enabled: boolean) => {
        if (enabled) {
            const result = await saucer.exposed.enableDoNotDisturb();
            if (!result) return false;

            set({ focusMode: enabled });
            return true;
        } else {
            const result = await saucer.exposed.disableDoNotDisturb();
            if (!result) return false;

            set({ focusMode: enabled });
            return true;
        }
    },

    refreshSessions: async () => {
        const sessionStrings = await saucer.exposed.getAllSessions();
        const array = JSON.parse(sessionStrings);

        const sessions: DbSession[] = array.map((session: any) => {
            return {
                ...parseStringToSession(JSON.stringify(session)),
                id: session.id
            };
        });

        set({ sessions });
    },

    // clock
    startTimer: () => {
        const { timer } = get();
        if (timer) return;

        const newTimer = setInterval(() => {
            set((state) => {
                let { hours, minutes, seconds } = state.time;
                seconds += 1;
                if (seconds >= 60) {
                    seconds = 0;
                    minutes += 1;
                }
                if (minutes >= 60) {
                    minutes = 0;
                    hours += 1;
                }
                return { time: { hours, minutes, seconds } };
            });
        }, 1000);

        set({ timer: newTimer });
    },
    stopTimer: () => {
        const { timer } = get();
        if (timer) clearInterval(timer);
        set({ timer: null, time: { hours: 0, minutes: 0, seconds: 0 } });
    },
    pauseTimer: () => {
        const { timer } = get();
        if (timer) clearInterval(timer);
        set({ timer: null });
    }
}));
