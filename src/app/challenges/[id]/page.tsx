'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/trpc/react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Check, X, Timer } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import TiptapViewer from '@/components/tiptap-viewer';
import { toast } from 'sonner';
import { CircuitPattern } from '@/components/circuit-pattern';
import { GridOverlay } from '@/components/grid-overlay';

interface Task {
    id: string;
    moduleId: string;
    title: string;
    description: string;
    points: number;
    order: number;
    type: string;
    answerType: string;
    correctAnswer: unknown;
    options: unknown;
    metadata: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

interface Team {
    id: string;
    name: string;
    challengeId: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    members?: TeamMember[];
}

interface Challenge {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    modules: {
        id: string;
        title: string;
        tasks: Task[];
        challengeId: string;
        description: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
}

interface TaskSubmissionWithSubmitter {
    id: string;
    taskId: string;
    teamId: string;
    submittedBy: string;
    answer: unknown;
    status: string;
    points: number | null;
    feedback: string | null;
    submittedAt: Date;
    updatedAt: Date;
    submitter: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

interface TaskSubmission {
    id: string;
    taskId: string;
    teamId: string;
    submittedBy: string;
    answer: unknown;
    status: string;
    points: number | null;
    feedback: string | null;
    submittedAt: Date;
    updatedAt: Date;
}

function Stopwatch({ startDate }: { startDate: Date }) {
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    useEffect(() => {
        const updateElapsedTime = () => {
            const now = new Date();
            const elapsed = now.getTime() - startDate.getTime();

            if (elapsed < 0) {
                setElapsedTime('00:00:00');
                return;
            }

            const totalSeconds = Math.floor(elapsed / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const formatTime = (num: number) => num.toString().padStart(2, '0');

            if (hours >= 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                setElapsedTime(
                    `${days}d ${formatTime(remainingHours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                );
            } else {
                setElapsedTime(
                    `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                );
            }
        };

        updateElapsedTime();
        const interval = setInterval(updateElapsedTime, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    return (
        <div className="flex items-center gap-2 font-mono text-sm">
            <Timer className="text-primary h-4 w-4" />
            <span className="text-muted-foreground">Elapsed:</span>
            <span className="text-primary font-medium">{elapsedTime}</span>
        </div>
    );
}

function CountdownTimer({ startDate }: { startDate: Date }) {
    const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const timeRemaining = startDate.getTime() - now.getTime();

            if (timeRemaining <= 0) {
                setTimeLeft('00:00:00');
                setHasStarted(true);
                // Reload the page when challenge starts
                window.location.reload();
                return;
            }

            const totalSeconds = Math.floor(timeRemaining / 1000);
            const days = Math.floor(totalSeconds / (24 * 3600));
            const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const formatTime = (num: number) => num.toString().padStart(2, '0');

            if (days > 0) {
                setTimeLeft(
                    `${days}d ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                );
            } else {
                setTimeLeft(
                    `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                );
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    if (hasStarted) {
        return null;
    }

    return (
        <div className="bg-primary/10 border-primary/20 space-y-2 rounded-lg border p-4">
            <p className="text-muted-foreground font-mono text-xs">
                Time until start:
            </p>
            <div className="flex items-center justify-center gap-2">
                <Timer className="text-primary h-5 w-5" />
                <span className="text-primary font-mono text-xl font-bold">
                    {timeLeft}
                </span>
            </div>
        </div>
    );
}

function ChallengeEndWarning({ endDate }: { endDate: Date }) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const updateWarning = () => {
            const now = new Date();
            const timeRemaining = endDate.getTime() - now.getTime();

            // Show warning if less than 30 minutes (1800000 ms) remaining
            const thirtyMinutesInMs = 30 * 60 * 1000;

            if (timeRemaining <= 0) {
                setShowWarning(false);
                return;
            }

            if (timeRemaining <= thirtyMinutesInMs) {
                setShowWarning(true);

                const totalSeconds = Math.floor(timeRemaining / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                const formatTime = (num: number) =>
                    num.toString().padStart(2, '0');

                if (hours > 0) {
                    setTimeLeft(
                        `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                    );
                } else {
                    setTimeLeft(
                        `${formatTime(minutes)}:${formatTime(seconds)}`,
                    );
                }
            } else {
                setShowWarning(false);
            }
        };

        updateWarning();
        const interval = setInterval(updateWarning, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    if (!showWarning) {
        return null;
    }

    return (
        <div className="animate-pulse space-y-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-center gap-2">
                <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
                <p className="font-mono text-sm font-semibold text-red-500">
                    ⚠️ Challenge Ending Soon!
                </p>
            </div>
            <div className="text-muted-foreground font-mono text-xs">
                Time remaining:{' '}
                <span className="font-semibold text-red-500">{timeLeft}</span>
            </div>
            <p className="text-muted-foreground font-mono text-xs">
                Please complete your submissions before the deadline.
            </p>
        </div>
    );
}

function SubmissionHistory({
    submissions,
    onRetry,
}: {
    submissions: TaskSubmissionWithSubmitter[];
    onRetry: () => void;
}) {
    if (submissions.length === 0) {
        return (
            <div className="text-muted-foreground text-center">
                No submissions yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Submission History</h4>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="text-xs"
                >
                    Try Again
                </Button>
            </div>
            <div className="space-y-2">
                {submissions.map((submission) => (
                    <div
                        key={submission.id}
                        className={cn(
                            'rounded-lg border p-3',
                            submission.status === 'correct'
                                ? 'border-green-500/20 bg-green-500/10 dark:border-green-500/30 dark:bg-green-500/20'
                                : 'border-red-500/20 bg-red-500/10 dark:border-red-500/30 dark:bg-red-500/20',
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {submission.status === 'correct' ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                )}
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        submission.status === 'correct'
                                            ? 'text-green-500'
                                            : 'text-red-500',
                                    )}
                                >
                                    {submission.status === 'correct'
                                        ? 'Correct'
                                        : 'Incorrect'}
                                </span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                                {format(
                                    new Date(submission.submittedAt),
                                    'MMM d, h:mm a',
                                )}
                            </span>
                        </div>
                        <div className="text-foreground/90 mt-2 text-sm">
                            Answer: {submission.answer as string}
                        </div>
                        <div className="text-foreground/70 mt-1 text-xs">
                            Submitted by: {submission.submitter.name}
                        </div>
                        {submission.status === 'correct' &&
                            submission.points && (
                                <div className="mt-1 text-xs text-green-500">
                                    +{submission.points} points
                                </div>
                            )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function OpenTextAnswer({
    onSubmit,
    isSubmitting,
}: {
    onSubmit: (answer: string) => void;
    isSubmitting: boolean;
}) {
    const [answer, setAnswer] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-4">
            <div className="relative">
                <textarea
                    className={cn(
                        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[120px] w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                        isFocused && 'shadow-lg',
                    )}
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isSubmitting}
                />
                <div
                    className="text-muted-foreground absolute right-2 bottom-2 text-xs opacity-0 transition-opacity duration-200"
                    style={{ opacity: answer.length > 0 ? 1 : 0 }}
                >
                    {answer.length} characters
                </div>
            </div>
            <div className="flex justify-end">
                <Button
                    onClick={() => onSubmit(answer)}
                    disabled={!answer.trim() || isSubmitting}
                    className="w-[120px] transition-all duration-200 hover:scale-105"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Submitting</span>
                        </div>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </div>
        </div>
    );
}

function MultipleChoiceAnswer({
    options,
    onSubmit,
    isSubmitting,
}: {
    options: string[];
    onSubmit: (selectedIndex: number) => void;
    isSubmitting: boolean;
}) {
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            <RadioGroup
                value={selectedValue}
                onValueChange={setSelectedValue}
                className="grid grid-cols-1 gap-3"
                disabled={isSubmitting}
            >
                {options.map((option, index) => (
                    <div
                        key={index}
                        className={cn(
                            'border-input bg-background relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200',
                            selectedValue === index.toString() &&
                                'border-primary bg-accent scale-[1.02]',
                            hoveredIndex === index &&
                                'border-primary/50 scale-[1.01]',
                            isSubmitting && 'cursor-not-allowed opacity-50',
                        )}
                        onClick={() =>
                            !isSubmitting && setSelectedValue(index.toString())
                        }
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                                <RadioGroupItem
                                    value={index.toString()}
                                    id={`option-${index}`}
                                    disabled={isSubmitting}
                                />
                                <Label
                                    htmlFor={`option-${index}`}
                                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {option}
                                </Label>
                            </div>
                            <div
                                className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200',
                                    selectedValue === index.toString()
                                        ? 'bg-primary scale-100'
                                        : 'scale-0',
                                )}
                            >
                                <Check className="text-primary-foreground h-3 w-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </RadioGroup>
            <div className="flex justify-end">
                <Button
                    onClick={() => onSubmit(parseInt(selectedValue))}
                    disabled={!selectedValue || isSubmitting}
                    className="w-[120px] transition-all duration-200 hover:scale-105"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Submitting</span>
                        </div>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function ChallengePage() {
    const { id } = useParams();
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
        null,
    );
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmissionForm, setShowSubmissionForm] = useState(true);
    const [moduleAvailability, setModuleAvailability] = useState<
        Record<string, boolean>
    >({});
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

    // Cache for module submissions to avoid repeated API calls
    const moduleSubmissionsCache = useRef<Record<string, TaskSubmission[]>>({});

    const utils = api.useUtils();

    const { data: challenge, isLoading } = api.challenge.getById.useQuery({
        id: id as string,
    });

    // Get the user's team for this challenge
    const { data: team, isLoading: isLoadingTeam } =
        api.team.getUserTeamForChallenge.useQuery({
            challengeId: id as string,
        });

    // Get team's total score for this challenge
    const { data: teamScore, isLoading: isLoadingTeamScore } =
        api.task.getTeamChallengeScore.useQuery(
            {
                challengeId: id as string,
                teamId: team?.id as string,
            },
            {
                enabled: !!team?.id,
            },
        );

    // Get team members from the team data
    const teamMembers = team?.members || [];

    const selectedModule = challenge?.modules.find(
        (m) => m.id === selectedModuleId,
    );

    // Get all completed tasks for the current module
    const {
        data: moduleSubmissions = [],
        isLoading: isLoadingModuleSubmissions,
    } = api.task.getAllModuleSubmissions.useQuery(
        {
            moduleId: selectedModuleId as string,
            teamId: team?.id as string,
        },
        {
            enabled: !!selectedModuleId && !!team?.id,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 5,
            retry: false,
            staleTime: 1000 * 60,
        },
    );

    // Get all submissions for the selected task with submitter information
    const { data: submissions = [], isLoading: isLoadingSubmissions } =
        api.task.getAllSubmissions.useQuery(
            {
                taskId: selectedTaskId as string,
                teamId: team?.id as string,
            },
            {
                enabled: !!selectedTaskId && !!team?.id,
            },
        );

    // Helper function to check if a module is available
    const isModuleAvailable = useCallback(
        (moduleId: string | null | undefined) => {
            if (!moduleId) return false;
            return moduleAvailability[moduleId] ?? false;
        },
        [moduleAvailability],
    );

    // Helper function to check if a task is available
    const isTaskAvailable = useCallback(
        (task: Task, moduleSubmissions: TaskSubmission[]) => {
            // First task is always available
            if (task.order === 1) return true;

            // For other tasks, check if previous tasks are completed
            const previousTasks =
                selectedModule?.tasks.filter((t) => t.order < task.order) || [];
            return previousTasks.every((prevTask) =>
                moduleSubmissions.some(
                    (sub) =>
                        sub.taskId === prevTask.id && sub.status === 'correct',
                ),
            );
        },
        [selectedModule],
    );

    // Helper function to check module availability
    const checkModuleAvailability = useCallback(
        async (
            module: Challenge['modules'][0],
            currentChallenge: Challenge,
        ) => {
            if (!team) return false;

            // First module is always available
            if (module === currentChallenge.modules[0]) return true;

            // Find the previous module
            const moduleIndex = currentChallenge.modules.findIndex(
                (m) => m.id === module.id,
            );
            if (moduleIndex <= 0) return false;

            // Get all modules up to the current one
            const previousModules = currentChallenge.modules.slice(
                0,
                moduleIndex,
            );

            // Check if all tasks in all previous modules have correct submissions
            for (const prevModule of previousModules) {
                // Check cache first
                let prevModuleSubmissions =
                    moduleSubmissionsCache.current[prevModule.id];

                if (!prevModuleSubmissions) {
                    prevModuleSubmissions =
                        await utils.task.getAllModuleSubmissions.fetch({
                            moduleId: prevModule.id,
                            teamId: team.id,
                        });
                    // Cache the results
                    moduleSubmissionsCache.current[prevModule.id] =
                        prevModuleSubmissions;
                }

                const moduleTasks = prevModule.tasks.map((task) => task.id);
                const completedTasks = prevModuleSubmissions.filter(
                    (sub) =>
                        moduleTasks.includes(sub.taskId) &&
                        sub.status === 'correct',
                );

                if (completedTasks.length !== prevModule.tasks.length) {
                    return false;
                }
            }

            return true;
        },
        [team, utils.task.getAllModuleSubmissions],
    );

    // Initial module availability check - only run once when challenge and team are loaded
    useEffect(() => {
        if (!challenge || !team || isCheckingAvailability) return;

        const checkAllModules = async () => {
            setIsCheckingAvailability(true);
            try {
                const availability: Record<string, boolean> = {};
                for (const challengeModule of challenge.modules) {
                    availability[challengeModule.id] =
                        await checkModuleAvailability(
                            challengeModule,
                            challenge,
                        );
                }
                setModuleAvailability(availability);
            } finally {
                setIsCheckingAvailability(false);
            }
        };

        checkAllModules();
    }, [challenge, team, checkModuleAvailability]);

    // Only invalidate and recheck availability after successful submissions
    const handleSuccessfulSubmission = useCallback(async () => {
        if (!selectedModuleId || !challenge || !team) return;

        // Clear cache for the current module
        delete moduleSubmissionsCache.current[selectedModuleId];

        // Invalidate team score query to update the displayed score
        await utils.task.getTeamChallengeScore.invalidate({
            challengeId: id as string,
            teamId: team.id,
        });

        // Recheck availability for all modules
        setIsCheckingAvailability(true);
        try {
            const availability: Record<string, boolean> = {};
            for (const challengeModule of challenge.modules) {
                availability[challengeModule.id] =
                    await checkModuleAvailability(challengeModule, challenge);
            }
            setModuleAvailability(availability);
        } finally {
            setIsCheckingAvailability(false);
        }
    }, [
        selectedModuleId,
        challenge,
        team,
        checkModuleAvailability,
        utils.task.getTeamChallengeScore,
        id,
    ]);

    const handleModuleSelect = async (moduleId: string) => {
        if (moduleId !== selectedModuleId) {
            const challengeModule = challenge?.modules.find(
                (m) => m.id === moduleId,
            );
            if (!challengeModule || !challenge) return;

            // Check if module is already marked as available
            if (moduleAvailability[moduleId]) {
                setIsTransitioning(true);
                setSelectedModuleId(moduleId);
                setSelectedTaskId(null);
                setShowSubmissionForm(true);
                setTimeout(() => setIsTransitioning(false), 300);
                return;
            }

            // If not available, check availability
            const isAvailable = await checkModuleAvailability(
                challengeModule,
                challenge,
            );
            if (!isAvailable) {
                toast.error('Complete all tasks in the previous module first!');
                return;
            }

            // Update availability state
            setModuleAvailability((prev) => ({
                ...prev,
                [moduleId]: true,
            }));

            setIsTransitioning(true);
            setSelectedModuleId(moduleId);
            setSelectedTaskId(null);
            setShowSubmissionForm(true);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const hasCorrectSubmission = submissions.some(
        (s) => s.status === 'correct',
    );

    const submitAnswer = api.task.submitAnswer.useMutation({
        onSuccess: async (data) => {
            setIsSubmitting(false);
            if (data.isCorrect) {
                toast.success('Correct answer! 🎉', {
                    description:
                        'You earned ' + data.submission.points + ' points!',
                });
                setShowSubmissionForm(false);

                // Invalidate queries for the current task and module
                await Promise.all([
                    utils.task.getAllSubmissions.invalidate({
                        taskId: selectedTaskId as string,
                        teamId: team?.id as string,
                    }),
                    utils.task.getAllModuleSubmissions.invalidate({
                        moduleId: selectedModuleId as string,
                        teamId: team?.id as string,
                    }),
                ]);

                // Recheck module availability after successful submission
                await handleSuccessfulSubmission();
            } else {
                toast.error('Incorrect answer', {
                    description: 'Try again!',
                });
                // For incorrect answers, only invalidate the specific task's submissions
                await utils.task.getAllSubmissions.invalidate({
                    taskId: selectedTaskId as string,
                    teamId: team?.id as string,
                });
            }
        },
        onError: (error) => {
            setIsSubmitting(false);
            toast.error(error.message);
        },
    });

    const handleTaskSelect = (taskId: string) => {
        const task = selectedModule?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Since we only show available tasks, no need to check availability
        if (taskId !== selectedTaskId) {
            setIsTransitioning(true);
            setSelectedTaskId(taskId);
            setShowSubmissionForm(true);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handleSubmitAnswer = async (answer: string | number) => {
        if (!selectedTaskId || !challenge) return;

        if (!team) {
            toast.error('You must be in a team to submit answers');
            return;
        }

        setIsSubmitting(true);
        submitAnswer.mutate({
            taskId: selectedTaskId,
            teamId: team.id,
            answer,
        });
    };

    if (isLoading || isLoadingTeam) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">Loading challenge...</div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">Challenge not found</div>
            </div>
        );
    }

    // Check if challenge has started
    const now = new Date();
    const challengeStartDate = new Date(challenge.startDate);
    const challengeEndDate = new Date(challenge.endDate);
    const hasStarted = now >= challengeStartDate;
    const hasEnded = now >= challengeEndDate;

    if (!hasStarted) {
        return (
            <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
                <CircuitPattern />
                <GridOverlay />

                <div className="relative z-10 border-b">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/challenges"
                                    className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                                <div>
                                    <h1 className="font-mono text-lg font-semibold tracking-wider">
                                        {'>'} {challenge.title}
                                    </h1>
                                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Starts:{' '}
                                            {format(challengeStartDate, 'PP p')}
                                        </span>
                                        <span>→</span>
                                        <span>
                                            {format(
                                                new Date(challenge.endDate),
                                                'PP',
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Badge
                                variant="secondary"
                                className="px-2 py-0.5 font-mono"
                            >
                                {'>'} Waiting to Start
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center">
                    <div className="max-w-md space-y-6 text-center">
                        <div className="space-y-4">
                            <Timer className="text-primary mx-auto h-16 w-16" />
                            <h2 className="font-mono text-2xl font-semibold tracking-wider">
                                {'>'} Challenge Not Started
                            </h2>
                        </div>

                        <div className="bg-card border-primary/20 space-y-4 rounded-lg border p-6">
                            <p className="text-muted-foreground font-mono text-sm">
                                This challenge will begin at:
                            </p>
                            <div className="text-primary font-mono text-lg font-semibold">
                                {format(challengeStartDate, 'PPPP p')}
                            </div>
                            <div className="text-muted-foreground font-mono text-xs">
                                Please check back at the scheduled start time.
                            </div>
                        </div>

                        <CountdownTimer startDate={challengeStartDate} />

                        <ChallengeEndWarning
                            endDate={new Date(challenge.endDate)}
                        />

                        {challenge.description && (
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="mb-2 font-mono text-sm font-medium tracking-wider">
                                    {'>'} Challenge Description
                                </h3>
                                <div className="text-muted-foreground text-sm">
                                    <TiptapViewer
                                        key={challenge.id}
                                        content={challenge.description}
                                        className="document-preview prose-headings:text-foreground prose-p:text-foreground prose-headings:font-mono prose-p:font-mono text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (hasEnded) {
        return (
            <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
                <CircuitPattern />
                <GridOverlay />

                <div className="relative z-10 border-b">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/challenges"
                                    className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                                <div>
                                    <h1 className="font-mono text-lg font-semibold tracking-wider">
                                        {'>'} {challenge.title}
                                    </h1>
                                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Started:{' '}
                                            {format(challengeStartDate, 'PP p')}
                                        </span>
                                        <span>→</span>
                                        <span>
                                            Ended:{' '}
                                            {format(challengeEndDate, 'PP p')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Badge
                                variant="destructive"
                                className="px-2 py-0.5 font-mono"
                            >
                                {'>'} Challenge Ended
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center">
                    <div className="max-w-md space-y-6 text-center">
                        <div className="space-y-4">
                            <svg
                                className="mx-auto h-16 w-16 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="font-mono text-2xl font-semibold tracking-wider">
                                {'>'} Challenge Completed
                            </h2>
                        </div>

                        <div className="bg-card border-primary/20 space-y-4 rounded-lg border p-6">
                            <p className="text-muted-foreground font-mono text-sm">
                                This challenge ended at:
                            </p>
                            <div className="text-primary font-mono text-lg font-semibold">
                                {format(challengeEndDate, 'PPPP p')}
                            </div>
                            <div className="text-muted-foreground font-mono text-xs">
                                All submissions are now closed.
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border border-green-500/20 bg-green-500/10 p-6">
                            <div className="flex items-center justify-center gap-2">
                                <svg
                                    className="h-6 w-6 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <h3 className="font-mono text-lg font-semibold text-green-500">
                                    Check the Results!
                                </h3>
                            </div>
                            <p className="text-muted-foreground font-mono text-sm">
                                Visit the leaderboard to see final scores and
                                rankings.
                            </p>
                            <Link
                                href={`/leaderboard?challenge=${challenge.id}`}
                                className="inline-block rounded-lg bg-green-500 px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:bg-green-600"
                            >
                                {'>'} View Leaderboard
                            </Link>
                        </div>

                        {team && teamScore && (
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="mb-3 font-mono text-sm font-medium tracking-wider">
                                    {'>'} Your Team Performance
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-mono">
                                            Team:
                                        </span>
                                        <span className="text-primary font-mono font-semibold">
                                            {team.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-mono">
                                            Final Score:
                                        </span>
                                        <span className="text-primary font-mono font-semibold">
                                            {teamScore.totalPoints} pts
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-mono">
                                            Tasks Completed:
                                        </span>
                                        <span className="text-primary font-mono font-semibold">
                                            {teamScore.completedTasks}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const selectedTask = selectedModule?.tasks.find(
        (t) => t.id === selectedTaskId,
    );

    // Update the task list rendering to show only available tasks
    const renderTaskList = () => {
        if (!selectedModule) {
            return (
                <div className="text-muted-foreground animate-in fade-in-50 pt-4 text-center text-sm duration-300">
                    Select a module
                </div>
            );
        }

        // Sort tasks by order and filter to show only available tasks
        const sortedTasks = [...selectedModule.tasks].sort(
            (a, b) => a.order - b.order,
        );

        // Check if all tasks are completed
        const completedTasks = moduleSubmissions.filter(
            (sub: TaskSubmission) => sub.status === 'correct',
        );
        const allTasksCompleted =
            sortedTasks.length > 0 &&
            completedTasks.length === sortedTasks.length;

        // Find next module
        const currentModuleIndex =
            challenge?.modules.findIndex((m) => m.id === selectedModuleId) ??
            -1;
        const nextModule = challenge?.modules[currentModuleIndex + 1];

        // If all tasks are completed, show completion message
        if (allTasksCompleted) {
            return (
                <div className="animate-in fade-in-50 space-y-4 pt-4 duration-300">
                    <div className="text-center">
                        <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                            <div className="mb-2 flex items-center justify-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-green-500">
                                    Module Completed!
                                </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                All tasks in this module have been completed.
                            </p>
                        </div>

                        {nextModule ? (
                            <div className="space-y-2">
                                <p className="text-muted-foreground font-mono text-xs">
                                    {'>'} Next: {nextModule.title}
                                </p>
                                <button
                                    onClick={() =>
                                        handleModuleSelect(nextModule.id)
                                    }
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded px-3 py-1.5 text-xs font-medium transition-colors"
                                    disabled={!isModuleAvailable(nextModule.id)}
                                >
                                    {isModuleAvailable(nextModule.id)
                                        ? 'Continue to Next Module'
                                        : 'Next Module Locked'}
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                                <p className="text-xs font-medium text-blue-500">
                                    🎉 Challenge Completed!
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    You have completed all modules in this
                                    challenge.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Filter tasks to show only those that are available
        const availableTasks = sortedTasks.filter((task) =>
            isTaskAvailable(task, moduleSubmissions),
        );

        if (availableTasks.length === 0) {
            return (
                <div className="text-muted-foreground animate-in fade-in-50 pt-4 text-center text-sm duration-300">
                    No tasks available
                </div>
            );
        }

        return availableTasks.map((task) => {
            const isCompleted = moduleSubmissions.some(
                (sub: TaskSubmission) =>
                    sub.taskId === task.id && sub.status === 'correct',
            );

            return (
                <div
                    key={task.id}
                    className={cn(
                        'transform cursor-pointer rounded-md p-2 text-sm transition-all duration-300 ease-in-out',
                        selectedTaskId === task.id
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground scale-[1.02]'
                            : 'hover:bg-muted hover:scale-[1.01]',
                        isTransitioning &&
                            selectedTaskId === task.id &&
                            'animate-in fade-in-50 duration-300',
                    )}
                    onClick={() => handleTaskSelect(task.id)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>{task.title}</span>
                            {isCompleted && (
                                <Check className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs opacity-70">
                                {task.points} pts
                            </span>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
            <CircuitPattern />
            <GridOverlay />

            <div className="relative z-10 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-6">
                            <Link
                                href="/challenges"
                                className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="font-mono text-lg font-semibold tracking-wider">
                                    {'>'} {challenge?.title}
                                </h1>
                                <div className="text-muted-foreground flex items-center gap-3 font-mono text-sm">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        Started:{' '}
                                        {format(
                                            new Date(
                                                challenge?.startDate || '',
                                            ),
                                            'PP p',
                                        )}
                                    </span>
                                    <span>→</span>
                                    <span>
                                        {format(
                                            new Date(challenge?.endDate || ''),
                                            'PP',
                                        )}
                                    </span>
                                </div>
                                {challenge?.startDate && (
                                    <div className="mt-1">
                                        <Stopwatch
                                            startDate={
                                                new Date(challenge.startDate)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {team ? (
                                <div className="flex items-center gap-6">
                                    <div className="font-mono text-sm font-medium tracking-wider">
                                        {'>'} {team.name}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-xs">
                                        <span>{'>'} Score:</span>
                                        {isLoadingTeamScore ? (
                                            <div className="bg-muted h-3 w-8 animate-pulse rounded"></div>
                                        ) : (
                                            <span className="text-primary font-medium">
                                                {teamScore?.totalPoints || 0}{' '}
                                                pts
                                            </span>
                                        )}
                                        <span>•</span>
                                        <span>Tasks:</span>
                                        {isLoadingTeamScore ? (
                                            <div className="bg-muted h-3 w-6 animate-pulse rounded"></div>
                                        ) : (
                                            <span className="text-primary font-medium">
                                                {teamScore?.completedTasks || 0}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
                                        <span>{'>'} Members:</span>
                                        <div className="flex gap-1">
                                            {teamMembers.map(
                                                (member: TeamMember) => (
                                                    <div
                                                        key={member.id}
                                                        className="bg-muted/30 flex flex-shrink-0 items-center gap-1 rounded p-1"
                                                        title={`${member.user.name} (${member.user.email}) - ${member.role}`}
                                                    >
                                                        {member.user.image ? (
                                                            <img
                                                                src={
                                                                    member.user
                                                                        .image
                                                                }
                                                                alt={
                                                                    member.user
                                                                        .name
                                                                }
                                                                className="border-background h-4 w-4 flex-shrink-0 rounded-full border"
                                                            />
                                                        ) : (
                                                            <div className="bg-primary/20 text-primary border-background flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-[8px]">
                                                                {
                                                                    member.user
                                                                        .name[0]
                                                                }
                                                            </div>
                                                        )}
                                                        <div className="text-foreground max-w-[60px] truncate text-[9px] leading-tight font-medium">
                                                            {
                                                                member.user.name.split(
                                                                    ' ',
                                                                )[0]
                                                            }
                                                        </div>
                                                        <div className="text-primary text-[8px] font-medium">
                                                            {member.role
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Badge
                                    variant="destructive"
                                    className="px-2 py-0.5 font-mono"
                                >
                                    {'>'} No Team
                                </Badge>
                            )}
                            <Badge
                                variant={
                                    challenge?.isActive
                                        ? 'default'
                                        : 'secondary'
                                }
                                className="px-2 py-0.5 font-mono"
                            >
                                {'>'}{' '}
                                {challenge?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto flex-1 px-4 py-4">
                <ChallengeEndWarning endDate={new Date(challenge.endDate)} />
                <div className="divide-primary/20 mt-4 flex h-[calc(100vh-12rem)] divide-x">
                    {/* Modules List */}
                    <div className="w-[20%] pr-4">
                        <div className="mb-2 font-mono text-sm font-medium tracking-wider">
                            {'>'} MODULES
                        </div>
                        <div className="h-[calc(100%-2rem)] space-y-1 overflow-auto">
                            {challenge?.modules.map((module) => (
                                <div
                                    key={module.id}
                                    className={cn(
                                        'transform rounded-md p-2 font-mono text-sm transition-all duration-300 ease-in-out',
                                        selectedModuleId === module.id
                                            ? 'bg-primary text-primary-foreground scale-[1.02]'
                                            : 'hover:bg-muted hover:scale-[1.01]',
                                        isTransitioning &&
                                            selectedModuleId === module.id &&
                                            'animate-in fade-in-50 duration-300',
                                        !isModuleAvailable(module.id) &&
                                            'cursor-not-allowed opacity-50',
                                    )}
                                    onClick={() =>
                                        isModuleAvailable(module.id) &&
                                        handleModuleSelect(module.id)
                                    }
                                >
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {'>'} {module.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs opacity-70">
                                                {module.tasks.length}
                                            </span>
                                            {!isModuleAvailable(module.id) && (
                                                <svg
                                                    className="h-4 w-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 15v2m0 0v2m0-2h2m-2 0H8"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 2a10 10 0 0110 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="w-[20%] px-4">
                        <div className="mb-2 font-mono text-sm font-medium tracking-wider">
                            {'>'} TASKS
                        </div>
                        <div className="h-[calc(100%-2rem)] space-y-1 overflow-auto">
                            {renderTaskList()}
                        </div>
                    </div>

                    {/* Task Details */}
                    <div className="flex-1 pl-4">
                        <div className="mb-2 font-mono text-sm font-medium tracking-wider">
                            {'>'} DETAILS
                        </div>
                        <div className="h-[calc(100%-2rem)] overflow-auto">
                            {selectedTask ? (
                                <div
                                    className={cn(
                                        'space-y-6 transition-all duration-300 ease-in-out',
                                        isTransitioning
                                            ? 'translate-y-2 opacity-0'
                                            : 'translate-y-0 opacity-100',
                                    )}
                                >
                                    <div>
                                        <h3 className="mb-4 font-mono text-lg font-medium tracking-wider">
                                            {'>'} {selectedTask.title}
                                        </h3>
                                        <div className="mb-6">
                                            <TiptapViewer
                                                key={selectedTask.id}
                                                content={
                                                    selectedTask.description
                                                }
                                                className="document-preview prose-headings:text-foreground prose-p:text-foreground prose-headings:font-mono prose-p:font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-card border-primary/20 rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
                                        {isLoadingSubmissions ? (
                                            <div className="flex justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {submissions.length > 0 && (
                                                    <SubmissionHistory
                                                        submissions={
                                                            submissions
                                                        }
                                                        onRetry={() =>
                                                            setShowSubmissionForm(
                                                                true,
                                                            )
                                                        }
                                                    />
                                                )}

                                                {!hasCorrectSubmission &&
                                                    showSubmissionForm && (
                                                        <>
                                                            {selectedTask.answerType ===
                                                                'multiple_choice' &&
                                                            selectedTask.options &&
                                                            Array.isArray(
                                                                selectedTask.options,
                                                            ) ? (
                                                                <MultipleChoiceAnswer
                                                                    options={
                                                                        selectedTask.options as string[]
                                                                    }
                                                                    onSubmit={
                                                                        handleSubmitAnswer
                                                                    }
                                                                    isSubmitting={
                                                                        isSubmitting
                                                                    }
                                                                />
                                                            ) : (
                                                                <OpenTextAnswer
                                                                    onSubmit={
                                                                        handleSubmitAnswer
                                                                    }
                                                                    isSubmitting={
                                                                        isSubmitting
                                                                    }
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground animate-in fade-in-50 pt-4 text-center font-mono text-sm duration-300">
                                    {'>'} SELECT A TASK
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
