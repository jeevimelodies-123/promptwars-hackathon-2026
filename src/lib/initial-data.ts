import { Subject, Flashcard, AssessmentResult, AssessmentQuestion } from '@/types';

// Calculate dynamic dates so demo data is always relevant today
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const examDate = new Date(today);
examDate.setDate(today.getDate() + 5); // Exam in 5 days!

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const inThreeDays = new Date(today);
inThreeDays.setDate(today.getDate() + 3);

const inSevenDays = new Date(today);
inSevenDays.setDate(today.getDate() + 7);

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-os-101',
    name: 'Operating Systems',
    code: 'CS-301',
    examDate: formatDate(examDate),
    availableHoursPerDay: 3.5,
    preparationLevel: 'intermediate',
    colorTheme: '#4f46e5',
    chapters: [
      {
        id: 'chap-concurrency',
        subjectId: 'sub-os-101',
        name: 'Concurrency & Process Management',
        topics: [
          {
            id: 'top-proc-sync',
            subjectId: 'sub-os-101',
            chapterId: 'chap-concurrency',
            name: 'Process Synchronization',
            importance: 'critical',
            weightagePercentage: 85,
            estimatedMinutes: 60,
            masteryScore: 35, // Major weakness as specified in hackathon prompt!
            lastStudiedDate: formatDate(yesterday),
            nextRevisionDate: formatDate(today), // Due today!
            revisionIntervalDays: 1,
            easeFactor: 1.7,
            revisionRepetitions: 0,
            calculatedPriority: 92,
            subtopics: [
              { id: 'sub-cs-prob', name: 'Critical Section Problem & Race Conditions', masteryScore: 30 },
              { id: 'sub-peterson', name: "Peterson's Solution & Hardware Instructions (TSL)", masteryScore: 25 },
              { id: 'sub-semaphores', name: 'Semaphores & Mutex Locks', masteryScore: 45 },
              { id: 'sub-classical', name: 'Dining Philosophers & Producer-Consumer', masteryScore: 40 },
            ],
          },
          {
            id: 'top-deadlocks',
            subjectId: 'sub-os-101',
            chapterId: 'chap-concurrency',
            name: 'Deadlocks',
            importance: 'high',
            weightagePercentage: 75,
            estimatedMinutes: 45,
            masteryScore: 80, // Strong understanding
            lastStudiedDate: formatDate(yesterday),
            nextRevisionDate: formatDate(inThreeDays),
            revisionIntervalDays: 3,
            easeFactor: 2.5,
            revisionRepetitions: 2,
            calculatedPriority: 48,
            subtopics: [
              { id: 'sub-dl-char', name: 'Necessary Conditions for Deadlock', masteryScore: 90 },
              { id: 'sub-rag', name: 'Resource Allocation Graph (RAG)', masteryScore: 85 },
              { id: 'sub-bankers', name: "Banker's Algorithm & Safe State", masteryScore: 75 },
              { id: 'sub-recovery', name: 'Deadlock Detection & Recovery', masteryScore: 70 },
            ],
          },
          {
            id: 'top-cpu-sched',
            subjectId: 'sub-os-101',
            chapterId: 'chap-concurrency',
            name: 'CPU Scheduling',
            importance: 'medium',
            weightagePercentage: 60,
            estimatedMinutes: 40,
            masteryScore: 90, // Mastered
            lastStudiedDate: formatDate(yesterday),
            nextRevisionDate: formatDate(inSevenDays),
            revisionIntervalDays: 7,
            easeFactor: 2.6,
            revisionRepetitions: 3,
            calculatedPriority: 32,
            subtopics: [
              { id: 'sub-sched-criteria', name: 'Scheduling Criteria & Preemption', masteryScore: 95 },
              { id: 'sub-algorithms', name: 'FCFS, SJF, SRTF, and Round Robin', masteryScore: 90 },
              { id: 'sub-multilevel', name: 'Multilevel Queue & Feedback Queue', masteryScore: 85 },
            ],
          },
        ],
      },
      {
        id: 'chap-memory',
        subjectId: 'sub-os-101',
        name: 'Memory Architecture',
        topics: [
          {
            id: 'top-mem-mgmt',
            subjectId: 'sub-os-101',
            chapterId: 'chap-memory',
            name: 'Memory Management',
            importance: 'high',
            weightagePercentage: 80,
            estimatedMinutes: 50,
            masteryScore: 55, // Moderate weakness
            lastStudiedDate: formatDate(yesterday),
            nextRevisionDate: formatDate(tomorrow),
            revisionIntervalDays: 2,
            easeFactor: 2.1,
            revisionRepetitions: 1,
            calculatedPriority: 74,
            subtopics: [
              { id: 'sub-contiguous', name: 'Contiguous Allocation & Fragmentation', masteryScore: 65 },
              { id: 'sub-paging', name: 'Paging, Page Tables, and TLB Hit Ratio', masteryScore: 50 },
              { id: 'sub-segmentation', name: 'Segmentation Architecture', masteryScore: 50 },
            ],
          },
          {
            id: 'top-virt-mem',
            subjectId: 'sub-os-101',
            chapterId: 'chap-memory',
            name: 'Virtual Memory & Page Replacement',
            importance: 'medium',
            weightagePercentage: 65,
            estimatedMinutes: 45,
            masteryScore: 62,
            lastStudiedDate: formatDate(yesterday),
            nextRevisionDate: formatDate(inThreeDays),
            revisionIntervalDays: 3,
            easeFactor: 2.3,
            revisionRepetitions: 1,
            calculatedPriority: 60,
            subtopics: [
              { id: 'sub-demand-paging', name: 'Demand Paging & Page Fault Handling', masteryScore: 65 },
              { id: 'sub-fifo-lru', name: 'FIFO, Optimal, and LRU Replacement', masteryScore: 60 },
              { id: 'sub-thrashing', name: 'Thrashing & Working Set Model', masteryScore: 60 },
            ],
          },
        ],
      },
    ],
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    topicId: 'top-proc-sync',
    topicName: 'Process Synchronization',
    front: 'What are the three mandatory requirements that any valid solution to the Critical Section Problem must satisfy?',
    back: '1. Mutual Exclusion: Only one process can execute in its critical section at any given time.\n2. Progress: If no process is in the critical section, only processes wanting to enter can participate in deciding who enters next.\n3. Bounded Waiting: A limit must exist on the number of times other processes are allowed to enter before a waiting process is granted access.',
    hint: 'Think: Exclusivity, forward movement, and anti-starvation limit.',
    concept: 'Critical Section Requirements',
    masteryScore: 35,
  },
  {
    id: 'fc-2',
    topicId: 'top-proc-sync',
    topicName: 'Process Synchronization',
    front: 'Why does Peterson’s Solution fail on modern multi-core superscalar processors without memory fences?',
    back: 'Modern out-of-order processors and optimizing compilers reorder memory read and write operations. Without memory barriers (fences), thread A can observe thread B\'s flag before turn is updated, violating mutual exclusion.',
    hint: 'Hardware instruction reordering and store buffers.',
    concept: 'Hardware Concurrency & Peterson Solution',
    masteryScore: 30,
  },
  {
    id: 'fc-3',
    topicId: 'top-proc-sync',
    topicName: 'Process Synchronization',
    front: 'What is the operational difference between a Binary Semaphore and a Mutex lock?',
    back: 'A Mutex has the concept of ownership—only the thread that locked the mutex can unlock it. A Binary Semaphore has no ownership; any thread can signal (V) or wait (P) on it, making semaphores suitable for signaling events as well as locking.',
    hint: 'Consider thread ownership and signal semantics.',
    concept: 'Mutex vs Binary Semaphore',
    masteryScore: 40,
  },
  {
    id: 'fc-4',
    topicId: 'top-deadlocks',
    topicName: 'Deadlocks',
    front: 'State the four Coffman conditions necessary for a Deadlock to occur.',
    back: '1. Mutual Exclusion (resources non-shareable)\n2. Hold and Wait (process holds resource while requesting another)\n3. No Preemption (resources cannot be forcibly taken)\n4. Circular Wait (a closed chain of processes each waiting for a held resource)',
    hint: 'Four conditions, breaking any one prevents deadlock.',
    concept: 'Coffman Conditions',
    masteryScore: 85,
  },
  {
    id: 'fc-5',
    topicId: 'top-mem-mgmt',
    topicName: 'Memory Management',
    front: 'How does a Translation Lookaside Buffer (TLB) impact Effective Memory Access Time (EMAT)?',
    back: 'Formula: EMAT = (Hit Ratio × [TLB time + Memory time]) + ((1 - Hit Ratio) × [TLB time + 2 × Memory time]). Without TLB, every memory access requires two physical memory accesses (one for page table, one for data).',
    hint: 'Cache hit vs cache miss memory penalties.',
    concept: 'TLB Hit Ratio & EMAT',
    masteryScore: 55,
  },
];

export const INITIAL_ASSESSMENT_RESULTS: AssessmentResult[] = [
  {
    id: 'res-diag-1',
    subjectId: 'sub-os-101',
    topicId: 'top-proc-sync',
    topicName: 'Process Synchronization',
    date: formatDate(yesterday),
    totalQuestions: 5,
    correctCount: 2,
    percentageScore: 35,
    topicScores: {
      'top-proc-sync': 35,
      'top-deadlocks': 80,
      'top-mem-mgmt': 55,
      'top-cpu-sched': 90,
    },
    weakConcepts: [
      'Critical Section Problem (Bounded Waiting violations)',
      'Peterson’s Solution memory reordering bugs',
      'Counting Semaphore wait/signal state transitions',
    ],
    mistakes: [
      {
        questionId: 'q-sync-1',
        prompt: 'In Peterson’s Algorithm, what happens if both processes set flag[i] = true and flag[j] = true simultaneously?',
        studentResponse: 'Both processes will enter the critical section simultaneously causing a race condition.',
        correctAnswer: 'The turn variable breaks the tie; only one process can proceed while the other waits in the while loop.',
        explanation: 'Even if both flags are asserted, the shared variable `turn` receives one final sequential value in memory. The process whose turn value was overwritten enters first.',
        conceptMissed: "Peterson's Algorithm Turn Variable Semantics",
        severity: 'high',
      },
      {
        questionId: 'q-sync-2',
        prompt: 'Explain why disabling interrupts in user-mode is an unacceptable solution for mutual exclusion in multiprocessor systems.',
        studentResponse: 'Because it takes too much CPU battery power.',
        correctAnswer: 'Disabling interrupts only disables them on the local CPU core running the thread, leaving other CPU cores free to execute and corrupt shared memory. Furthermore, giving user code privilege to disable interrupts threatens system stability.',
        explanation: 'Hardware interrupts disabled on Core 0 have zero effect on Core 1 or Core 2 accessing the same shared RAM.',
        conceptMissed: 'Hardware Multiprocessor Mutual Exclusion',
        severity: 'high',
      },
      {
        questionId: 'q-sync-3',
        prompt: 'What condition does the wait() operation on a semaphore perform when the counter is <= 0?',
        studentResponse: 'It terminates the thread immediately.',
        correctAnswer: 'It decrements the semaphore and blocks (sleeps) the calling process, placing it in a waiting queue.',
        explanation: 'Semaphores do not terminate processes; they block until another thread calls signal() / post().',
        conceptMissed: 'Semaphore Wait Queue Primitives',
        severity: 'medium',
      },
    ],
    remedialRecommendations: [
      'Focus study on hardware vs software synchronization mechanisms.',
      'Practice drawing execution timelines for Peterson’s algorithm with interleaved steps.',
      'Review Semaphore wait() / signal() queue mechanics before taking the follow-up drill.',
    ],
    aiAnalysisSummary: 'Diagnostic analysis detected significant conceptual confusion around hardware atomicity, Peterson\'s Algorithm tie-breaking, and multiprocessor execution models. Process Synchronization has been escalated to Top Priority in your study timetable.',
  },
];

export const INITIAL_DIAGNOSTIC_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  'top-proc-sync': [
    {
      id: 'q-sync-1',
      topicId: 'top-proc-sync',
      topicName: 'Process Synchronization',
      subtopicName: 'Critical Section Problem & Race Conditions',
      type: 'mcq',
      prompt: 'Which of the following is NOT a mandatory requirement for a valid solution to the critical-section problem?',
      options: [
        { id: 'a', text: 'Mutual Exclusion' },
        { id: 'b', text: 'Progress' },
        { id: 'c', text: 'Bounded Waiting' },
        { id: 'd', text: 'Preemptive Scheduling Guarantee' },
      ],
      correctAnswer: 'd',
      explanation: 'Preemptive scheduling is an OS scheduling design choice, NOT a requirement for critical-section solutions. The only three requirements defined by Dijkstra are Mutual Exclusion, Progress, and Bounded Waiting.',
      conceptTested: 'Critical Section Requirements',
    },
    {
      id: 'q-sync-2',
      topicId: 'top-proc-sync',
      topicName: 'Process Synchronization',
      subtopicName: "Peterson's Solution & Hardware Instructions (TSL)",
      type: 'mcq',
      prompt: 'In Peterson’s algorithm for two processes P0 and P1, what is the role of the shared variable "turn"?',
      options: [
        { id: 'a', text: 'It indicates which process is currently deadlocked' },
        { id: 'b', text: 'It resolves simultaneous requests and guarantees bounded waiting' },
        { id: 'c', text: 'It acts as an integer semaphore counting resources' },
        { id: 'd', text: 'It stores the process ID of the kernel interrupt handler' },
      ],
      correctAnswer: 'b',
      explanation: 'The "turn" variable serves as an explicit tie-breaker when both processes set their interest flag to true simultaneously, ensuring only one enters and the other is guaranteed bounded waiting.',
      conceptTested: "Peterson's Algorithm Tie Breaking",
    },
    {
      id: 'q-sync-3',
      topicId: 'top-proc-sync',
      topicName: 'Process Synchronization',
      subtopicName: 'Semaphores & Mutex Locks',
      type: 'mcq',
      prompt: 'If a counting semaphore initialized to value 5 undergoes 8 wait() operations and 4 signal() operations, what is its final value?',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '0 (with 1 process waiting)' },
        { id: 'c', text: '-1' },
        { id: 'd', text: '3' },
      ],
      correctAnswer: 'a',
      explanation: 'Initial = 5. After 8 wait() calls: 5 - 8 = -3 (or 0 with 3 waiting processes). Then 4 signal() calls: -3 + 4 = 1. The final semaphore value is 1.',
      conceptTested: 'Counting Semaphore Arithmetic',
    },
    {
      id: 'q-sync-4',
      topicId: 'top-proc-sync',
      topicName: 'Process Synchronization',
      subtopicName: "Peterson's Solution & Hardware Instructions (TSL)",
      type: 'short_answer',
      prompt: 'Explain what happens when an atomic Test-And-Set (TSL) hardware instruction executes, and why it prevents race conditions during lock acquisition.',
      correctAnswer: 'Test-and-Set reads the current memory value and sets it to true in a single, indivisible hardware clock cycle. Because no other CPU core can interleave between reading and writing, exactly one process can transition the lock from false to true.',
      explanation: 'Hardware atomicity guarantees that testing the flag and asserting ownership happen without any possibility of thread preemption or multicore memory overlap.',
      conceptTested: 'Hardware Atomic Instructions (TSL)',
    },
    {
      id: 'q-sync-5',
      topicId: 'top-proc-sync',
      topicName: 'Process Synchronization',
      subtopicName: 'Dining Philosophers & Producer-Consumer',
      type: 'short_answer',
      prompt: 'In the Classical Bounded-Buffer (Producer-Consumer) problem, why are two distinct counting semaphores (empty and full) required in addition to a mutex?',
      correctAnswer: 'The mutex guarantees mutual exclusion on the buffer data structure, while "empty" tracks available buffer slots and blocks the producer when full, and "full" tracks ready items and blocks the consumer when empty.',
      explanation: 'Synchronization coordinates sequence and capacity constraints, whereas mutual exclusion prevents simultaneous writes to buffer pointers.',
      conceptTested: 'Producer-Consumer Semaphore Coordination',
    },
  ],
  'top-deadlocks': [
    {
      id: 'q-dl-1',
      topicId: 'top-deadlocks',
      topicName: 'Deadlocks',
      subtopicName: 'Necessary Conditions for Deadlock',
      type: 'mcq',
      prompt: 'Which of the following conditions is NOT one of the four Coffman conditions necessary for deadlock?',
      options: [
        { id: 'a', text: 'Mutual Exclusion' },
        { id: 'b', text: 'Aging & Priority Inversion' },
        { id: 'c', text: 'Hold and Wait' },
        { id: 'd', text: 'Circular Wait' },
      ],
      correctAnswer: 'b',
      explanation: 'Aging is a scheduling technique used to prevent starvation, not a deadlock condition. The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      conceptTested: 'Coffman Deadlock Conditions',
    },
    {
      id: 'q-dl-2',
      topicId: 'top-deadlocks',
      topicName: 'Deadlocks',
      subtopicName: "Banker's Algorithm & Safe State",
      type: 'short_answer',
      prompt: 'Explain the difference between a Safe State and an Unsafe State in the context of Banker’s Algorithm.',
      correctAnswer: 'A safe state guarantees that there exists at least one allocation sequence where all processes can finish without deadlocking. An unsafe state does not necessarily mean a deadlock has already occurred, but it means the system cannot prevent a deadlock if worst-case resource demands are made.',
      explanation: 'All deadlocked states are unsafe, but not all unsafe states are deadlocks.',
      conceptTested: "Banker's Algorithm Safe State Dynamics",
    },
  ],
  'top-mem-mgmt': [
    {
      id: 'q-mem-1',
      topicId: 'top-mem-mgmt',
      topicName: 'Memory Management',
      subtopicName: 'Paging, Page Tables, and TLB Hit Ratio',
      type: 'mcq',
      prompt: 'If memory access time is 100 ns and TLB lookup time is 20 ns, what is the Effective Memory Access Time (EMAT) with an 80% TLB hit ratio?',
      options: [
        { id: 'a', text: '120 ns' },
        { id: 'b', text: '140 ns' },
        { id: 'c', text: '180 ns' },
        { id: 'd', text: '220 ns' },
      ],
      correctAnswer: 'b',
      explanation: 'Hit: 20 + 100 = 120 ns (80% of time). Miss: 20 + 100 (for page table) + 100 (for data) = 220 ns (20% of time). EMAT = 0.8 * 120 + 0.2 * 220 = 96 + 44 = 140 ns.',
      conceptTested: 'TLB EMAT Calculation',
    },
  ],
};
