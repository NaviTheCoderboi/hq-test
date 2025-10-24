import {
    addToast,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    useDisclosure
} from '@heroui/react';
import { NotebookPen, Pause, Play, Plus, Square, Target } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useStudyStore } from '../utils/store.ts';
import { Show } from './Utils.tsx';

const SessionsForm = () => {
    const createModal = useDisclosure();
    const saveModal = useDisclosure();

    const studyState = useStudyStore();
    const [title, setTitle] = useState('New Session');
    const [subject, setSubject] = useState('General');
    const [note, setNote] = useState('');

    const handleCreateSession = useCallback(() => {
        if (studyState.currentSession !== null) return;

        const status = studyState.startSession(title, subject);
        createModal.onClose();

        if (!status) {
            return addToast({
                title: 'Error',
                description: 'A session with same title already exists.',
                color: 'danger'
            });
        }

        addToast({
            title: 'Session Created',
            description: `Your study session "${title}" has started.`,
            color: 'success'
        });
    }, [studyState, title, subject, createModal]);

    const handlePause = useCallback(() => {
        if (studyState.currentSession === null) return;

        studyState.pauseSession();
        addToast({
            title: 'Session Paused',
            description: `Your study session "${title}" has been paused.`,
            color: 'warning'
        });
    }, [studyState, title]);

    const handleResume = useCallback(() => {
        if (studyState.currentSession === null) return;

        studyState.resumeSession();
        addToast({
            title: 'Session Resumed',
            description: `Your study session "${title}" has resumed.`,
            color: 'success'
        });
    }, [studyState, title]);

    const handleSave = useCallback(async () => {
        if (studyState.currentSession === null) return;

        const result = await studyState.stopSession(note);
        if (!result) {
            return addToast({
                title: 'Error',
                description: 'Failed to save the session.',
                color: 'danger'
            });
        }

        saveModal.onClose();
        setNote('');
        addToast({
            title: 'Session Saved',
            description: `Your study session "${title}" has been saved.`,
            color: 'success'
        });
    }, [studyState, title, note, saveModal]);

    return (
        <div className="flex justify-center items-center gap-4">
            <Show when={!studyState.currentSession && studyState.state === 'idle'}>
                <Button startContent={<Plus />} color="primary" onPress={createModal.onOpen}>
                    New
                </Button>
            </Show>

            <Show when={studyState.currentSession && studyState.state === 'running'}>
                <Button startContent={<Pause />} color="secondary" onPress={handlePause}>
                    Pause
                </Button>
            </Show>

            <Show when={studyState.currentSession && studyState.state === 'paused'}>
                <Button startContent={<Play />} color="primary" onPress={handleResume}>
                    Resume
                </Button>
            </Show>

            <Button
                startContent={<Square />}
                color="danger"
                onPress={saveModal.onOpen}
                disabled={!studyState.currentSession}
            >
                Stop & Save
            </Button>

            <Modal
                isOpen={saveModal.isOpen}
                placement="top-center"
                onOpenChange={saveModal.onOpenChange}
                onClose={saveModal.onClose}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Save Session</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    endContent={
                                        <NotebookPen className="text-2xl text-default-400 pointer-events-none shrink-0" />
                                    }
                                    label="Note"
                                    placeholder="Enter the note"
                                    variant="bordered"
                                    autoFocus
                                    value={note}
                                    onValueChange={setNote}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={handleSave}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal
                isOpen={createModal.isOpen}
                placement="top-center"
                onOpenChange={createModal.onOpenChange}
                onClose={createModal.onClose}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">New Session</ModalHeader>
                            <ModalBody>
                                <Input
                                    endContent={
                                        <NotebookPen className="text-2xl text-default-400 pointer-events-none shrink-0" />
                                    }
                                    label="Title"
                                    placeholder="Enter the title"
                                    variant="bordered"
                                    autoFocus
                                    value={title}
                                    onValueChange={setTitle}
                                />
                                <Input
                                    endContent={
                                        <Target className="text-2xl text-default-400 pointer-events-none shrink-0" />
                                    }
                                    label="Subject"
                                    placeholder="Enter the subject"
                                    variant="bordered"
                                    value={subject}
                                    onValueChange={setSubject}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={handleCreateSession}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default SessionsForm;
