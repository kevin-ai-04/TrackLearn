## Module Topology

- Module – 1 (Distributed systems basics and Computation model)

- Module – 2(Election algorithm, Global state and Termination

detection)

- Module – 3 (Mutual exclusion and Deadlock detection)

- Module – 4 (Distributed shared memory and Failure recovery)

- Module – 5 (Consensus and Distributed file system)

## Module – 1

## Lesson Plan

- L1: Distributed System – Definition, Relation to computer system
    components
- L2: Primitives for distributed communication
- L3: Design issues, challenges and applications
- L4: Design issues, challenges and applications
- L5: A model of distributed computations – Distributed program, Model of
    distributed executions
- L6: Models of communication networks, Global state of a distributed
- L7: Cuts of a distributed computation, Past and future cones of an event, Models
    of process communications.

## Distributed Systems

- A distributed system is a collection of independent entities that cooperate to solve a problem that
    cannot be individually solved.
- Collection of independent systems that work together to solve a problem or to accomplish a task.
**Distributed system has been characterized in one of several ways:**
### 1.   Crash of a single machine never prevents from doing work

2.   A collection of computers that do not share common memory or a common physical clock, that
communicate by a messages passing over a communication network, and where each computer
has its own memory and runs its own operating system
3.   A collection of independent computers that appears to the users of the system as a single coherent
computer
4.   A term that describes a wide range of computers, from weakly coupled systems such as wide-area
networks, to strongly coupled systems such as local area networks

## Features of Distributed Systems

- No common physical clock: This is an important assumption
    because it introduces the element of “distribution” in the system
    and gives rise to the inherent asynchrony amongst the processors.
- No shared memory: This is a key feature that requires message-
    passing for communication. This feature implies the absence of the
    common physical clock
- Geographical separation: The geographically wider apart that the
    processors are, the more representative is the system of a
    distributed system.
    ◦WAN
    ◦NOW/COW(network/cluster of workstations)--- eg, Google
    search engine
- Autonomy and heterogeneity: The processors are “loosely
    coupled” in that they have different speeds and each can be
    running a different operating system, cooperate with one another
    by offering services or solving a problem jointly.

## Relation to computer system

components




Each computer has a memory-processing unit and the
computers are connected by a communication network

Relationships of the software components that run on each of the
computers and use the local operating system and network protocol stack
for functioning

- The distributed software is also termed as
    middleware.
- A distributed execution is the execution of
    processes across the distributed system to
    collaboratively achieve a common goal.
- An execution is also sometimes termed a
    computation or a run.
- The distributed system uses a layered
    architecture to break down the complexity of
    system design.
- The middleware is the distributed software
    that drives the distributed system, while
    providing transparency of heterogeneity at
    the platform level

- The middleware layer does not contain the
    traditional application layer functions of the
    network protocol stack, such as http, mail,
    ftp, and telnet.
- Various primitives and calls to functions
    defined in various libraries of the middleware
    layer are embedded in the user program
    code.
- There exist several libraries to choose from
    to invoke primitives for the more common
    functions – such as reliable and ordered
    multicasting – of the middleware layer

## Motivation

- Inherently distributed computations:
   - In many applications like money transfer in banking, or reaching consensus
    among parties that are geographically distant, computation is inherently
    distributed
- Resource sharing:
   - Resources like peripherals, complete data sets in databases, special libraries,
    data etc., cannot be fully replicated at all sites
   - They cannot be placed at a single site
   - Such resources are distributed across the system
   - E.g. distributed databases such as DB2 partition the data sets across several
    servers, in addition to replicating them at a few sites for rapid access as well as
    reliability
- Access to geographically remote data and resources:
   - In many scenarios, data cannot be replicated at every site participating in the
    distributed execution because it may be too large or too sensitive to be replicated
   - E.g. Payroll data of MNC

- Enhanced reliability:
   - Availability: resource should be accessible at all times
   - Integrity: state of resource should be correct
   - Fault-tolerance: ability to recover from failures
- Increased performance/cost ratio:
   - By resource sharing and accessing geographically remote
    data and resources, performance/cost ratio is increased
   - Though throughput is the main objective of using
    distributed system, any task can be partitioned across the
    various computers in the distributed system
- Scalability
   - As processors are connected by WAN , adding more processors
    do not pose a bottleneck
- Modularity and incremental expandability
   - Heterogeneous processors can be added to system without
    affecting the performance (with same middleware)
   - Existing processors can be easily replaced by other processors

## Primitives for distributed

communication

## Primitives for distributed communication


 - Blocking/non-blocking,
    synchronous/asynchronous primitives
 - Processor synchrony
 - Libraries and standards

## Blocking/non-blocking,

synchronous/asynchronous primitives
- Send()- has at least two parameters,
  - the destination, and
  - the buffer in the user space
- Receive()- at least two parameters,
  - the source from which the data is to be
    received and
  - the user buffer into which the data is to be
    received

- There are two ways of sending data when the
    Send primitive is invoked the
- buffered option
  - is the standard option copies the data from the user
    buffer to the kernel buffer.
  - The data later gets copied from the kernel buffer onto
    the network.
- unbuffered option
  - the data gets copied directly from the user buffer onto
    the network.
- For the Receive primitive, the buffered option is
    usually required because the data may already
    have arrived when the primitive is invoked, and
    needs a storage place in the kernel.

## Synchronous primitives

- Send or a Receive primitive is
    synchronous if both the Send() and
    Receive() handshake with each
    other.
- The processing for the Send
    primitive completes only after the
    invoking processor learns that the
    other     corresponding     Receive
    primitive has also been invoked and
    that the receive operation has been
    completed.
- The processing for the Receive
    primitive completes when the data
    to be received is copied into the
    receiver’s user buffer.

## Asynchronous primitives

- A Send primitive is said to be
    asynchronous if control returns back
    to the invoking process after the data
    item to be sent has been copied out
    of the user-specified buffer.
- It does not make sense to define
    asynchronous Receive primitives.

## Blocking vs Non-Blocking primitives

- A primitive is blocking if the control - A primitive is non-blocking if control
    returns to the invoking process after    returns back to the invoking
    the processing for the primitive         process        immediately       after
    (whether     in    synchronous      or   invocation,     even   though     the
    asynchronous mode) completes.            operation has not completed.
                                         - For a non-blocking Send, control
    returns to the process even before
    the data is copied out of the user
    buffer.
                                         - For a non-blocking Receive, control
    returns to the process even before
    the data may have arrived from the
    sender.

- For non-blocking primitives, a return
    parameter on the primitive call returns a
    system-generated handle which can be
    later used to check the         status of
    completion of the call.
- The process can check for the completion
    of the call in two ways.
- First, it can keep checking (in a loop or
    periodically) if the handle has been flagged or
    posted.
- Second, it can issue a Wait with a list of
    handles as parameters.

- The Wait call usually blocks until one of
    the parameter handles is posted.
- Presumably after issuing the primitive in
    non-blocking mode, the process has done
    whatever actions it could and now needs
    to know the status of completion of the
    call, therefore using a blocking Wait() call
    is usual programming practice

- If at the time that Wait() is issued, the
    processing for the primitive has completed,
    the Wait returns immediately
- If the processing of the primitive has not
    completed, the Wait blocks and waits for a
    signal to wake it up.
- When the processing for the primitive
    completes, the communication subsystem
    software sets the value of handlek and wakes
    up (signals) any process with a Wait call
    blocked on this handlek.
- This is called posting the completion of the
    operation.

## Four versions of the Send primitive


1.synchronous blocking,
2.synchronous non-blocking,
3.asynchronous blocking, and
4.asynchronous non-blocking

- Here, three time lines are shown for each
    process:
    (1)for the process execution,
    (2)for the user buffer from/to which data is
    sent/received, and
    (3)for the kernel/communication subsystem.

Blocking synchronous Send
- The data gets copied from the
    user buffer to the kernel buffer and
    is then sent over the network.
- After the data is copied to the
    receiver’s system buffer and a
    Receive call has been issued, an
    acknowledgement back to the
    sender causes control to return to
    the process that invoked the Send
    operation and completes the Send

## Blocking Receive

- The Receive call blocks until the
    data expected arrives and is written
    in the specified user buffer.
- Then control is returned to the user
    process.

Non-blocking synchronous Send
- Control returns back to the invoking
    process as soon as the copy of
    data from the user buffer to the
    kernel buffer is initiated.
- A parameter in the non-blocking call
    also gets set with the handle of a
    location
- that the user process can later
    check for the completion of the
    synchronous send operation.
- The location gets posted after an
    acknowledgement returns from the
    receiver

- The user process can keep
    checking for the completion of the
    non-blocking synchronous Send by
    testing the returned handle, or it
    can invoke the        blocking Wait
    operation on the returned handle

Non-blocking Receive
- The Receive call will cause the
    kernel to register the call and return
    the handle of a location that the
    user process can later check for
    the completion of the non-blocking
    Receive operation.

- This location gets posted by the
    kernel after the expected data
    arrives and is copied to the user-
    specified buffer.

- The user process can check for the
    completion of the non-blocking
    Receive by invoking the Wait
    operation on the returned handle.

Blocking asynchronous Send
- The user process that invokes the
    Send is blocked until the data is
    copied from the user’s buffer to the
    kernel buffer.

- For the unbuffered option, the user
    process that invokes the Send is
    blocked until the data is copied from
    the user’s buffer to the network.

Non-blocking asynchronous Send
- The user process that invokes the
    Send is blocked until the transfer of
    the data from the user’s buffer to
    the kernel buffer is initiated.

- Control returns to the user process
    as soon as this transfer is initiated,
    and a parameter in the non-
    blocking call also gets set with the - The  asynchronous Send completes
    when the data has been copied out
    handle of a location that the user     of the user’s buffer.
    process can check later using the
    Wait operation for the completion of - The checking for the completion
    the asynchronous Send operation.       may be necessary if the user wants
    to reuse the buffer from which the
    data was sent.

## Processor synchrony

- Processor synchrony indicates that all the processors
    execute in lock- step with their clocks synchronized.
- As this synchrony is not attainable in a distributed
    system, what is more generally indicated is that for a
    large granularity of code, usually termed as a step,
    the processors are synchronized.
- This abstraction is implemented using some form of
    barrier synchronization to ensure that no processor
    begins executing the next step of code until all the
    processors have completed executing the previous
    steps of code assigned to each of the processors.

## Categorization

- Important design issues and challenges are
    categorized as:
  - Having a greater component related to systems
    design and operating systems design
  - Having a greater component related to algorithm
    design
  - Emerging from recent technology advances or
    driven by new applications

## Distributed System Challenges from a

## System Perspective

- Addresses the challenges in designing distributed
    systems from a system building perspective
  - Communication
  - Processes
  - Naming
  - Synchronization
  - Data storage and access
  - Consistency and replication
  - Fault tolerance
  - Security
  - API and transparency
  - Scalability and modularity

## Distributed System Challenges from a

## System Perspective

- Communication
     - Task involves designing appropriate mechanisms for communication among
    processes in network
     - E.g. RPC, ROI
- Processes
     - Issues involved are: management of processes and threads at clients/servers,
    code migration, design of s/w and mobile agents
- Naming
     - Devising easy to use names, identifiers and addresses is needed for locating
    resources and processes in a transparent and reliable manner
     - Naming provides additional challenges as naming cannot be tied to any static
    geographical topology
- Synchronization
     - Mechanisms for synchronization among processes are essential
     - Mutual exclusion, synchronizing physical clocks, global state recording all
    needs synchronization

- Data storage and access
   - Schemes for data storage and accessing data in a fast and
    scalable manner are important for efficiency
- Consistency and replication
   - To avoid bottlenecks, for fast access of data and scalability,
    replication of data is needed
   - Issues relating to managing replicas and dealing with
    consistency among replicas
- Fault tolerance
   - Requires maintaining correct and efficient operation in spite of
    failures of links, nodes and processes
   - Process resilience, reliable communication, distributed commit,
    checkpointing and recovery, agreement and consensus, failure
    detection and self stabilization are some of the fault-tolerance
    mechanisms
- Security
   - Involves aspects of cryptography, secure channels, access
    control, key management and secure group management

- Applications       Programming                   Interface   (API)    and
    transparency
   - API for communication is important for wider adoption by non-
    technical users
   - Transparency deals with hiding implementation policies from
    user
      - Access transparency: hides differences in data representation on
    different systems and provides uniform operations to access resources
      - Location transparency: makes location of resources transparent to
    users
      - Migration transparency: allows relocating resources without changing
    names
      - Relocation transparency: ability to relocate resources as being
    accessed
      - Replication transparency: does not let user become aware of any
    replication
      - Concurrency transparency: deals with masking the concurrent use of
    shared resources
      - Failure transparency: system being reliable and fault tolerant

- Scalability and modularity
  - Algorithms, data and services must be as
    distributed as possible
  - Replication, caching and cache management and
    asynchronous processing help to achieve
    scalability

Algorithmic challenges in distributed
computing
- Summarizes key algorithmic challenges in distributed computing
     - Designing useful execution models and frameworks
     - Dynamic distributed graph algorithms and distributed routing algorithms
     - Time and global state in a distributed system
     - Synchronization/coordination mechanisms
     - Group communication, multicast and ordered message delivery
     - Monitoring distributed events and predicates
     - Debugging distributed programs
     - Data replication, consistency models and caching
     - Distributed shared memory abstraction
     - Reliable and fault-tolerant distributed systems
     - Load balancing
     - Real-time scheduling
     - Performance

Algorithmic challenges in distributed
computing
- Designing useful          execution       models   and
    frameworks
  - The interleaving model and partial order model are
    two widely adopted models of distributed system
    executions.
  - They have proved to be useful for operational
    reasoning and the design of distributed algorithms.
  - The input/output automata model and the TLA
    (temporal logic of actions) are two other examples of
    models that provide different degrees of
    infrastructure for reasoning more formally with and
    proving the correctness of distributed programs

- Dynamic distributed graph algorithms and
    distributed routing algorithms
  - The distributed system is modeled as a distributed
    graph, and the graph algorithms form the building
    blocks for a large number of higher level
    communication, data dissemination, object location,
    and object search functions.
  - The algorithms need to deal with dynamically
    changing graph characteristics
  - The efficiency of these algorithms impacts not only
    the user-perceived latency but also the traffic and
    hence the load or congestion in the network
  - Hence, the design of efficient distributed graph
    algorithms is of paramount importance

- Time and global state in a distributed system
   - The processes in the system are spread across three-
    dimensional physical space.
   - The challenges pertain to providing accurate physical time,
    and to providing a variant of time, called logical time.
   - Logical time is relative time
   - Logical time can
      - capture the logic and inter-process dependencies within the
    distributed program
      - track the relative progress at each process.
   - Observing global state of the system also involves time
    dimension
   - It is not possible for any one process to directly observe a
    meaningful global state across all the processes, without
    using extra state gathering effort which needs to be done
    in a coordinated manner

- Synchronization/coordination mechanisms
  - Synchronization is essential for the distributed
    processes to overcome the limited observation of
    the system state from the viewpoint of any one
    process.
  - Overcoming this limited observation is necessary
    for taking any actions that would impact other
    processes.
  - The synchronization mechanisms can also be
    viewed as resource management and concurrency
    management mechanisms to streamline the
    behavior of the processes that would otherwise
    act independently.

- Problems requiring synchronization
  - Physical clock synchronization
  - Leader election
  - Mutual exclusion
  - Deadlock detection and resolution
  - Termination detection
  - Garbage collection

- Group communication, multicast, and ordered
    message delivery
  - A group is a collection of processes that share a
    common context and collaborate on a common task
    within an application domain.
  - Specific algorithms need to be designed to enable
    efficient    group    communication      and   group
    management wherein processes can join and leave
    groups dynamically, or even fail.
  - When multiple processes send messages concurrently,
    different recipients may receive the messages in
    different orders, possibly violating the semantics of
    the distributed program.
  - Hence, formal specifications of the semantics of
    ordered delivery need to be formulated, and then
    implemented.

- Monitoring distributed events and predicates
  - Predicates defined on program variables that are local
    to different processes are used for specifying
    conditions on the global system state, and are useful
    for applications such as debugging, sensing the
    environment, and in industrial process control.
  - On-line algorithms for monitoring such predicates are
    hence important.
  - An       important      paradigm      for   monitoring
    distributed events is that of event streaming, wherein
    streams of relevant events reported from different
    processes are examined collectively to detect
    predicates.
  - Typically, the specification of such predicates uses
    physical or logical time relationships.

- Distributed program design and verification
    tools
  - Methodically designed and verifiably correct
    programs can greatly reduce the overhead of
    software design, debugging, and engineering.
  - Designing mechanisms to achieve these design
    and verification goals is a challenge.

- Debugging distributed programs
  - Debugging sequential programs is hard;
  - Debugging distributed programs is that much
    harder because of the concurrency in actions and
    the ensuing uncertainty due to the large number
    of possible executions defined by the interleaved
    concurrent actions.
  - Adequate debugging mechanisms and tools need
    to be designed to meet this challenge.

- Data replication, consistency models, and
    caching
  - Fast access to data and other resources requires
    them to be replicated in the distributed system.
  - Managing such replicas in the face of updates
    introduces the problems of ensuring consistency
    among the replicas and cached copies.
  - Additionally, placement of the replicas in the
    systems is also a challenge because resources
    usually cannot be freely replicated.

- Distributed shared memory abstraction
  - Has to be implemented by message passing
     - Wait-free algorithms: ability of a process to complete
    its execution irrespective of the actions of other
    processes
     - Mutual exclusion
     - Register constructions: deals with design of registers
    from scratch
     - Consistency models

- Reliable and fault tolerant distributed systems
     - Consensus algorithm
         - The goal of a distributed consensus algorithm is to allow a set of computers to reach an
    agreement (in the presence of malicious process)
         - The challenge in doing this in a distributed system is that messages can be lost or
    machines can fail
     - Replication and replica management
     - Voting and quorum systems
         - Fault tolerance is dealt using voting based on quorum criteria
         - Designing efficient algorithms for this is a challenge
     - Distributed databases and distributed commit
         - Traditional properties of transaction need to be preserved in distributed setting
     - Self-stabilizing systems
         - Is guaranteed to take the system to a good state even if bad state were to arise due to
    some error
         - Designing efficient self-stabilizing algorithms is a challenge
     - Checkpointing and recovery algorithms
         - Periodically checking the current state on secondary storage
         - If on failure, can be recovered from recent checkpoints
         - If checkpoints at different processes are not coordinated, it will be useless
     - Failure detectors
         - Class of algorithms that probabilistically suspect another process as having failed and
    converge on a determination based on the status of suspected process

- Load Balancing
  - Goal is to gain higher throughput and reduce
    latency
  - Load balancing techniques:
     - Data migration
        - Ability to move data around system
     - Computation migration
        - Ability to relocate processes to redistribute workload
     - Distributed scheduling
        - By using idle processing power in the system more efficiently

- Real-time scheduling
  - Important for mission critical applications to
    accomplish task execution on schedule
  - Dynamic changes to schedule are harder to make
  - Message propagation delays are hard to control

- Performance
  - Achieving good performance is important
  - Network latency and access to shared resources
    can lead to large delays
  - Issues relating to determining performance
    - Metrics
       - Appropriate metrics must be defined for measuring
    performance
    - Measurement methods/tools
       - Tools can be developed for measuring performance

## Applications of distributed computing

and newer challenges
- Mobile systems
- Sensor networks
- Ubiquitous or pervasive computing
- Peer-to-peer computing
- Publish-subscribe, content distribution, and
    multimedia
- Distributed agents
- Distributed data mining
- Grid computing
- Security in distributed systems

- Mobile systems
  - Mobile systems use wireless communication
    which is based on electromagnetic waves and
    utilizes a shared broadcast medium
  - Two architectures
    - Cellular approach
       - A cell (geographical region) is associated with a base
    transmission station
       - All mobile processes communicate with rest of the system via
    the base station
    - Ad-hoc network approach
       - No base station
       - All communication responsibility is distributed among mobile
    nodes

- Mobile Systems
  - Set of problems
     - Routing
     - Location management
     - Channel allocation
     - Localization and position estimation
     - Overall management of mobility

- Sensor networks
  - A sensor is a processor with an electro-mechanical
    interface that is capable of sensing physical
    parameters, such as temperature, velocity,
    pressure, humidity, and chemicals
  - Sensors may be mobile or static
  - Sensors may communicate wirelessly or across a
    wire
  - Challenges
     - position estimation and
     - time estimation

- Ubiquitous or pervasive computing
  - Embedding computational capability into everyday objects
    to make them communicate and perform useful tasks
  - The intelligent home, and the smart workplace are some
    example of ubiquitous environments
  - They are self-organizing, network-centric and resource
    constrained
  - Such systems are typically characterized as having many
    small processors operating collectively in a dynamic
    ambient network
  - The processors may be connected to more powerful
    networks and processing resources in the background for
    processing and collating data
  - Challenges
     - Transparency
     - Heterogeneity

- Peer-to-peer computing
  - Peer-to-peer (P2P) computing represents computing
    over an application layer network wherein all
    interactions among the processors are at a “peer”
    level, without any hierarchy among the processors
  - All processors are equal and play a symmetric role in
    computation
  - P2P computing arose as a paradigm shift from client–
    server computing
  - Challenges
     - Object storage mechanism
     - Efficient object lookup and retrieval
     - Dynamic reconfiguration with nodes
     - Replication strategies
     - Anonymity
     - Privacy and security

- Publish-subscribe, content distribution, and
    multimedia
  - In a dynamic environment where the information
    constantly fluctuates, there needs to be:
     - an efficient mechanism for distributing this information
    (publish)
     - an efficient mechanism to allow end users to indicate
    interest in receiving specific kinds of information (subscribe)
    and
     - an efficient mechanism for aggregating large volumes of
    published information and filtering it as per the user’s
    subscription filter
  - Content distribution refers to mechanisms that
    distribute specific information to interested processes
  - Challenges
     - Compression
     - Synchronization during storage and playback

- Distributed agents
  - Agents are processes that can move around the
    system to do specific tasks for which they are
    programmed
  - Agents collect and process information, and can
    exchange such information with other agents
  - Challenges
     - Coordination mechanisms among the agents
     - Controlling the mobility of the agents
     - Software design and interfaces

- Distributed data mining
  - Data mining algorithms examine large amounts of
    data to detect patterns and trends in data to
    extract useful information
  - Example: examining purchasing patterns of
    customers
  - In many applications, data is distributed and
    cannot be collected in a single repository
     - Either data is sensitive or it is massive
  - Challenges
     - Designing efficient distributed data mining algorithms

- Grid computing
  - Grid computing is a computing infrastructure that
    combines computer resources spread over
    different geographical locations to achieve a
    common goal
  - All unused resources on multiple computers are
    pooled together and made available for others
  - Challenges:
     - Scheduling jobs in such a distributed environment
     - Framework for implementing quality of service and
    real-time guarantees
     - Security of individual machines as well as of jobs being
    executed in this setting

- Security in distributed systems
  - The traditional challenges of security in a distributed
    setting include:
     - confidentiality (ensuring that only authorized processes can
    access certain information)
     - authentication (ensuring the source of received information
    and the identity of the sending process)
     - availability (maintaining allowed access to services despite
    malicious actions).
  - For newer distributed architectures, these challenges
    is interested due to
     - Resource constrained environment
     - Broadcast medium
     - Lack of structure
     - Lack of trust in network

## A Model of Distributed

## Computations

## Distributed System

- A distributed system consists of a set of
    processors that are connected by a
    communication network
- The network provides facility for information
    exchange among processors
- A distributed application runs as a collection
    of processes on a distributed system

## Global State

- Composed of the states of processes and
    communication channels
- The state of a process is characterized by the
    state of its local memory and depends on its
    context
- The state of a channel is characterized by the
    set of messages in transit in the channel
