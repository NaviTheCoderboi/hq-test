import { useEffect, useLayoutEffect } from 'react';
import Home from './components/tabs/Home.tsx';
import Sessions from './components/tabs/Sessions.tsx';
import Stats from './components/tabs/Stats.tsx';
import { BackgroundBeams } from './components/ui/BgBeams.tsx';
import { Tabs } from './components/ui/Tabs.tsx';
import { useStudyStore } from './utils/store.ts';

const App = () => {
    const studyState = useStudyStore();

    const tabs = [
        {
            title: 'Home',
            value: 'home',
            content: (
                <div className="w-full overflow-y-auto relative h-full rounded-2xl bg-zinc-950">
                    <BackgroundBeams />
                    <Home />
                </div>
            )
        },
        {
            title: 'Sessions',
            value: 'sessions',
            content: (
                <div className="w-full overflow-y-auto relative h-full rounded-2xl bg-zinc-950">
                    <Sessions />
                </div>
            )
        },
        {
            title: 'Stats',
            value: 'stats',
            content: (
                <div className="w-full overflow-y-auto relative h-full rounded-2xl bg-zinc-950">
                    <Stats />
                </div>
            )
        }
    ];

    // biome-ignore lint/correctness/useExhaustiveDependencies: ignore it
    useLayoutEffect(() => {
        studyState.refreshSessions();
    }, []);

    return (
        <main className="h-screen [perspective:1000px] relative b flex flex-col px-4 mx-auto w-full items-start justify-start py-6 antialiased">
            <Tabs tabs={tabs} contentClassName="mt-6" />
        </main>
    );
};

export default App;
