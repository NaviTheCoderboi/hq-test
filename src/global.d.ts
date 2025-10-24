declare global {
    interface Funcs {
        createSession: (toCreate: string) => Promise<boolean>;
        getAllSessions: () => Promise<string>;
        deleteSession: (toDelete: number) => Promise<boolean>;

        enableDoNotDisturb: () => Promise<boolean>;
        disableDoNotDisturb: () => Promise<boolean>;
    }

    interface Saucer {
        exposed: Funcs;
    }

    var saucer: Saucer;
}

export {};
